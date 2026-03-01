from datetime import datetime, timezone
import uuid

from sqlalchemy.orm import Session

from app.models.integration import Integration
from app.models.sync_job import SyncJob
from app.workers.tasks import run_sync_job


def create_sync_job(
    db: Session,
    workspace_id: uuid.UUID,
    integration: Integration,
    trigger_type: str = "manual",
    requested_by_user_id: uuid.UUID | None = None,
) -> SyncJob:
    sync_job = SyncJob(
        workspace_id=workspace_id,
        integration_id=integration.id,
        provider=integration.platform,
        status="pending",
        trigger_type=trigger_type,
        requested_by_user_id=requested_by_user_id,
        requested_at=datetime.now(timezone.utc),
    )
    db.add(sync_job)
    db.flush()
    return sync_job


def enqueue_sync_job(db: Session, sync_job: SyncJob) -> SyncJob:
    try:
        async_result = run_sync_job.delay(str(sync_job.id))
        sync_job.celery_task_id = async_result.id
        sync_job.status = "queued"
    except Exception as exc:
        sync_job.status = "failed"
        sync_job.latest_error = f"Unable to enqueue sync job: {exc}"
    db.commit()
    db.refresh(sync_job)
    return sync_job


def get_latest_sync_job(db: Session, integration_id: uuid.UUID) -> SyncJob | None:
    return (
        db.query(SyncJob)
        .filter(SyncJob.integration_id == integration_id)
        .order_by(SyncJob.requested_at.desc())
        .first()
    )
