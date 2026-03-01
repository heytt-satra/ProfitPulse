import asyncio
from datetime import date, datetime, timedelta, timezone
import random
from typing import Any
import uuid

from celery import shared_task
from sqlalchemy.orm import Session

from app.core.database import SessionLocal
from app.models.financial_data import FinancialData
from app.models.integration import Integration
from app.models.sync_job import SyncJob
from app.models.sync_run import SyncRun
from app.services.airbyte import airbyte_service
from app.services.demo_seeder import seed_demo_data


@shared_task
def ingest_financial_data(user_id: str, integration_id: str) -> str:
    """
    Legacy mock ingestion task retained for compatibility.
    """
    db: Session = SessionLocal()
    try:
        integration = db.query(Integration).filter(Integration.id == integration_id).first()
        if not integration:
            return "Integration not found"

        start_date = date.today() - timedelta(days=30)
        records_processed = 0

        for day_offset in range(31):
            current_date = start_date + timedelta(days=day_offset)
            record = (
                db.query(FinancialData)
                .filter(
                    FinancialData.user_id == user_id,
                    FinancialData.workspace_id == integration.workspace_id,
                    FinancialData.date == current_date,
                )
                .first()
            )
            if not record:
                record = FinancialData(
                    workspace_id=integration.workspace_id,
                    user_id=user_id,
                    date=current_date,
                )
                db.add(record)

            daily_revenue = random.uniform(500, 2000)
            daily_ads = random.uniform(50, 300)

            record.revenue_gross = daily_revenue
            record.revenue_net = daily_revenue * 0.95
            record.cost_ads_meta = daily_ads
            record.transactions_count = int(daily_revenue / 50)
            records_processed += 1

        db.commit()
        return f"Successfully processed {records_processed} days of data for user {user_id}"
    except Exception as exc:
        db.rollback()
        return f"Error processing data: {exc}"
    finally:
        db.close()


def _mark_job_failed(db: Session, sync_job: SyncJob, sync_run: SyncRun | None, error_message: str) -> None:
    now = datetime.now(timezone.utc)
    if sync_run:
        sync_run.status = "failed"
        sync_run.error_message = error_message
        sync_run.finished_at = now

    sync_job.status = "failed"
    sync_job.latest_error = error_message
    sync_job.finished_at = now

    integration = db.query(Integration).filter(Integration.id == sync_job.integration_id).first()
    if integration:
        integration.status = "error"
    db.commit()


def _mark_job_failed_by_id(sync_job_id: uuid.UUID, error_message: str) -> None:
    """
    Best-effort fallback state transition used when an exception escapes normal flow.
    """
    db: Session = SessionLocal()
    try:
        sync_job = db.query(SyncJob).filter(SyncJob.id == sync_job_id).first()
        if not sync_job:
            return
        sync_run = (
            db.query(SyncRun)
            .filter(SyncRun.sync_job_id == sync_job_id, SyncRun.status == "running")
            .order_by(SyncRun.started_at.desc())
            .first()
        )
        _mark_job_failed(db, sync_job, sync_run, error_message)
    except Exception:
        db.rollback()
    finally:
        db.close()


@shared_task(bind=True)
def run_sync_job(self, sync_job_id: str) -> str:
    db: Session = SessionLocal()
    sync_job_uuid: uuid.UUID | None = None
    sync_run: SyncRun | None = None
    try:
        try:
            sync_job_uuid = uuid.UUID(sync_job_id)
        except ValueError:
            return "Invalid sync job id"

        sync_job = db.query(SyncJob).filter(SyncJob.id == sync_job_uuid).first()
        if not sync_job:
            return "Sync job not found"

        integration = db.query(Integration).filter(Integration.id == sync_job.integration_id).first()
        if not integration:
            sync_job.status = "failed"
            sync_job.latest_error = "Integration not found for sync job"
            sync_job.finished_at = datetime.now(timezone.utc)
            db.commit()
            return "Integration not found"

        now = datetime.now(timezone.utc)
        sync_job.status = "running"
        sync_job.started_at = now
        sync_job.attempt_count = (sync_job.attempt_count or 0) + 1

        sync_run = SyncRun(
            sync_job_id=sync_job.id,
            status="running",
            attempt_number=sync_job.attempt_count,
            started_at=now,
        )
        db.add(sync_run)
        db.commit()
        db.refresh(sync_run)

        integration.status = "syncing"
        db.commit()

        metadata = integration.metadata_config or {}
        connection_id = metadata.get("airbyte_connection_id")

        if connection_id:
            triggered = asyncio.run(airbyte_service.trigger_sync(connection_id))
            if not triggered:
                _mark_job_failed(db, sync_job, sync_run, "Airbyte sync trigger failed")
                return "Airbyte sync trigger failed"

            result_payload: dict[str, Any] = {
                "mode": "airbyte",
                "connection_id": connection_id,
                "triggered": True,
            }
            sync_run.external_job_id = str(connection_id)
        else:
            # Temporary ingestion fallback while all connectors are being wired.
            result_payload = seed_demo_data(
                db=db,
                user_id=str(integration.user_id),
                workspace_id=str(integration.workspace_id) if integration.workspace_id else None,
            )
            result_payload["mode"] = "seed_fallback"

        done_at = datetime.now(timezone.utc)
        sync_run.status = "succeeded"
        sync_run.result_payload = result_payload
        sync_run.finished_at = done_at

        sync_job.status = "succeeded"
        sync_job.latest_error = None
        sync_job.finished_at = done_at

        integration.status = "active"
        integration.last_sync_at = done_at
        db.commit()
        return f"Sync job {sync_job_id} completed"
    except Exception as exc:
        db.rollback()
        error_message = f"{type(exc).__name__}: {exc}"

        if sync_job_uuid:
            if sync_run and sync_run.id:
                try:
                    # Rehydrate objects in current session after rollback.
                    reloaded_job = db.query(SyncJob).filter(SyncJob.id == sync_job_uuid).first()
                    reloaded_run = db.query(SyncRun).filter(SyncRun.id == sync_run.id).first()
                    if reloaded_job:
                        _mark_job_failed(db, reloaded_job, reloaded_run, error_message)
                except Exception:
                    db.rollback()
                    _mark_job_failed_by_id(sync_job_uuid, error_message)
            else:
                _mark_job_failed_by_id(sync_job_uuid, error_message)

        return f"Sync job failed: {error_message}"
    finally:
        db.close()
