from datetime import datetime, timezone
import hashlib
from typing import Any, Optional
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from fastapi.responses import RedirectResponse
from pydantic import BaseModel, HttpUrl
from sqlalchemy.orm import Session

from app.api import deps
from app.core.config import settings
from app.models.integration import Integration
from app.models.sync_job import SyncJob
from app.services.demo_seeder import seed_demo_data
from app.services.oauth_service import (
    build_authorization_url,
    decode_oauth_state,
    exchange_code_for_token,
    generate_oauth_state,
    verify_shopify_oauth_callback_signature,
    verify_shopify_webhook_signature,
    verify_stripe_webhook_signature,
)
from app.services.sync_service import create_sync_job, enqueue_sync_job, get_latest_sync_job

router = APIRouter()

SUPPORTED_PROVIDERS = {"stripe", "meta", "shopify", "google_ads"}


class OAuthStartRequest(BaseModel):
    redirect_uri: Optional[HttpUrl] = None
    shop_domain: Optional[str] = None


class OAuthStartResponse(BaseModel):
    provider: str
    integration_id: str
    auth_url: str
    status: str


def _validate_provider(provider: str) -> str:
    provider_key = provider.lower()
    if provider_key not in SUPPORTED_PROVIDERS:
        raise HTTPException(status_code=400, detail=f"Unsupported provider: {provider}")
    return provider_key


def _hash_state(state_token: str) -> str:
    return hashlib.sha256(state_token.encode("utf-8")).hexdigest()


def _parse_uuid(value: str, field_name: str) -> uuid.UUID:
    try:
        return uuid.UUID(value)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=f"Invalid {field_name}") from exc


def _serialize_sync_job(sync_job: SyncJob | None) -> dict[str, Any] | None:
    if not sync_job:
        return None
    return {
        "id": str(sync_job.id),
        "status": sync_job.status,
        "trigger_type": sync_job.trigger_type,
        "requested_at": sync_job.requested_at.isoformat() if sync_job.requested_at else None,
        "started_at": sync_job.started_at.isoformat() if sync_job.started_at else None,
        "finished_at": sync_job.finished_at.isoformat() if sync_job.finished_at else None,
        "latest_error": sync_job.latest_error,
    }


def _sanitize_token_payload(raw_payload: dict[str, Any]) -> dict[str, Any]:
    redacted_keys = {"access_token", "refresh_token", "id_token"}
    return {k: v for k, v in raw_payload.items() if k not in redacted_keys}


def _append_query_params(url: str, params: dict[str, str]) -> str:
    parsed = urlparse(url)
    merged_params = dict(parse_qsl(parsed.query, keep_blank_values=True))
    merged_params.update(params)
    return urlunparse(parsed._replace(query=urlencode(merged_params)))


def _build_oauth_redirect(
    integration: Integration,
    provider: str,
    status: str,
    error_code: Optional[str] = None,
) -> Optional[RedirectResponse]:
    redirect_uri = (integration.metadata_config or {}).get("redirect_uri")
    if not redirect_uri:
        return None
    params = {
        "oauth_provider": provider,
        "oauth_status": status,
        "integration_id": str(integration.id),
    }
    if error_code:
        params["oauth_error"] = error_code
    return RedirectResponse(url=_append_query_params(redirect_uri, params), status_code=307)


@router.get("/")
def list_integrations(
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    integrations = (
        db.query(Integration)
        .filter(Integration.workspace_id == workspace_ctx.workspace.id)
        .order_by(Integration.connected_at.desc())
        .all()
    )
    payload = []
    for integration in integrations:
        latest_sync_job = get_latest_sync_job(db, integration.id)
        payload.append(
            {
                "id": str(integration.id),
                "platform": integration.platform,
                "status": integration.status,
                "connected_at": integration.connected_at.isoformat() if integration.connected_at else None,
                "last_sync_at": integration.last_sync_at.isoformat() if integration.last_sync_at else None,
                "account_id": integration.account_id,
                "latest_sync_job": _serialize_sync_job(latest_sync_job),
            }
        )
    return payload


@router.post("/{provider}/oauth/start", response_model=OAuthStartResponse)
def oauth_start(
    provider: str,
    payload: OAuthStartRequest,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    provider_key = _validate_provider(provider)
    redirect_uri = str(payload.redirect_uri) if payload.redirect_uri else None

    if redirect_uri:
        allowed_hosts = {
            urlparse(str(origin)).netloc
            for origin in settings.BACKEND_CORS_ORIGINS
            if str(origin).strip() != "*"
        }
        redirect_host = urlparse(redirect_uri).netloc
        if allowed_hosts and redirect_host not in allowed_hosts:
            raise HTTPException(status_code=400, detail="redirect_uri host is not allowed")

    integration = Integration(
        workspace_id=workspace_ctx.workspace.id,
        user_id=workspace_ctx.membership.user_id,
        platform=provider_key,
        status="oauth_pending",
        metadata_config={
            "redirect_uri": redirect_uri,
            "shop_domain": payload.shop_domain,
            "started_at": datetime.now(timezone.utc).isoformat(),
        },
    )
    db.add(integration)
    db.flush()

    state_token = generate_oauth_state(
        integration_id=integration.id,
        workspace_id=workspace_ctx.workspace.id,
        provider=provider_key,
    )
    integration.metadata_config = {
        **(integration.metadata_config or {}),
        "oauth_state_hash": _hash_state(state_token),
    }
    db.commit()
    db.refresh(integration)

    try:
        auth_url = build_authorization_url(
            provider_key,
            state_token=state_token,
            shop_domain=payload.shop_domain,
        )
    except ValueError as exc:
        integration.status = "oauth_error"
        integration.metadata_config = {
            **(integration.metadata_config or {}),
            "oauth_error": str(exc),
        }
        db.commit()
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    return OAuthStartResponse(
        provider=provider_key,
        integration_id=str(integration.id),
        auth_url=auth_url,
        status=integration.status or "oauth_pending",
    )


@router.get("/{provider}/oauth/callback")
async def oauth_callback(
    provider: str,
    request: Request,
    state: str = Query(..., description="OAuth state token"),
    code: Optional[str] = Query(default=None),
    shop: Optional[str] = Query(default=None),
    error: Optional[str] = Query(default=None),
    db: Session = Depends(deps.get_db),
) -> Any:
    provider_key = _validate_provider(provider)

    try:
        state_payload = decode_oauth_state(state, provider_key)
        integration_id = uuid.UUID(state_payload["sub"])
        workspace_id = uuid.UUID(state_payload["workspace_id"])
    except (ValueError, KeyError) as exc:
        raise HTTPException(status_code=400, detail="Invalid OAuth state token") from exc

    integration = (
        db.query(Integration)
        .filter(
            Integration.id == integration_id,
            Integration.workspace_id == workspace_id,
            Integration.platform == provider_key,
        )
        .first()
    )
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found for OAuth callback")

    if error:
        integration.status = "oauth_error"
        integration.metadata_config = {
            **(integration.metadata_config or {}),
            "oauth_error": f"provider_error:{error}",
        }
        db.commit()
        redirect_response = _build_oauth_redirect(
            integration,
            provider=provider_key,
            status="oauth_error",
            error_code="provider_error",
        )
        if redirect_response:
            return redirect_response
        raise HTTPException(status_code=400, detail=f"OAuth callback failed: {error}")
    if not code:
        raise HTTPException(status_code=400, detail="Missing OAuth authorization code")

    if provider_key == "shopify":
        client_secret = settings.SHOPIFY_CLIENT_SECRET
        if not client_secret:
            raise HTTPException(status_code=503, detail="Shopify OAuth is not configured")
        if not verify_shopify_oauth_callback_signature(dict(request.query_params), client_secret):
            integration.status = "oauth_error"
            integration.metadata_config = {
                **(integration.metadata_config or {}),
                "oauth_error": "Invalid Shopify OAuth callback signature",
            }
            db.commit()
            redirect_response = _build_oauth_redirect(
                integration,
                provider=provider_key,
                status="oauth_error",
                error_code="invalid_shopify_signature",
            )
            if redirect_response:
                return redirect_response
            raise HTTPException(status_code=400, detail="Invalid Shopify OAuth callback signature")

    state_hash = _hash_state(state)
    expected_state_hash = (integration.metadata_config or {}).get("oauth_state_hash")
    if not expected_state_hash or expected_state_hash != state_hash:
        integration.status = "oauth_error"
        integration.metadata_config = {
            **(integration.metadata_config or {}),
            "oauth_error": "State hash mismatch",
        }
        db.commit()
        redirect_response = _build_oauth_redirect(
            integration,
            provider=provider_key,
            status="oauth_error",
            error_code="state_validation_failed",
        )
        if redirect_response:
            return redirect_response
        raise HTTPException(status_code=400, detail="OAuth state validation failed")

    shop_domain = shop or (integration.metadata_config or {}).get("shop_domain")

    try:
        token_result = await exchange_code_for_token(
            provider_key,
            code=code,
            shop_domain=shop_domain,
        )
    except ValueError as exc:
        integration.status = "oauth_error"
        integration.metadata_config = {
            **(integration.metadata_config or {}),
            "oauth_error": str(exc),
        }
        db.commit()
        redirect_response = _build_oauth_redirect(
            integration,
            provider=provider_key,
            status="oauth_error",
            error_code="token_exchange_failed",
        )
        if redirect_response:
            return redirect_response
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    integration.access_token = token_result.access_token
    integration.refresh_token = token_result.refresh_token
    integration.token_expires_at = token_result.expires_at
    integration.account_id = token_result.account_id
    integration.status = "active"
    integration.connected_at = datetime.now(timezone.utc)
    integration.metadata_config = {
        **(integration.metadata_config or {}),
        "oauth_state_hash": None,
        "oauth_connected_at": integration.connected_at.isoformat(),
        "oauth_token_response": _sanitize_token_payload(token_result.raw),
        "shop_domain": shop_domain,
    }
    db.commit()

    redirect_response = _build_oauth_redirect(
        integration,
        provider=provider_key,
        status="active",
    )
    if redirect_response:
        return redirect_response

    return {
        "provider": provider_key,
        "integration_id": str(integration.id),
        "status": integration.status,
    }


@router.get("/{provider}/{integration_id}/status")
def integration_status(
    provider: str,
    integration_id: str,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    provider_key = _validate_provider(provider)
    integration_uuid = _parse_uuid(integration_id, "integration_id")
    integration = (
        db.query(Integration)
        .filter(
            Integration.id == integration_uuid,
            Integration.workspace_id == workspace_ctx.workspace.id,
            Integration.platform == provider_key,
        )
        .first()
    )
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    latest_sync_job = get_latest_sync_job(db, integration.id)

    return {
        "provider": provider_key,
        "integration_id": str(integration.id),
        "status": integration.status,
        "last_sync_at": integration.last_sync_at.isoformat() if integration.last_sync_at else None,
        "connected_at": integration.connected_at.isoformat() if integration.connected_at else None,
        "latest_sync_job": _serialize_sync_job(latest_sync_job),
    }


@router.post("/{provider}/{integration_id}/sync")
def trigger_sync(
    provider: str,
    integration_id: str,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    provider_key = _validate_provider(provider)
    integration_uuid = _parse_uuid(integration_id, "integration_id")
    integration = (
        db.query(Integration)
        .filter(
            Integration.id == integration_uuid,
            Integration.workspace_id == workspace_ctx.workspace.id,
            Integration.platform == provider_key,
        )
        .first()
    )
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    sync_job = create_sync_job(
        db=db,
        workspace_id=workspace_ctx.workspace.id,
        integration=integration,
        trigger_type="manual",
        requested_by_user_id=workspace_ctx.membership.user_id,
    )
    integration.status = "sync_queued"
    db.commit()
    db.refresh(integration)
    db.refresh(sync_job)

    sync_job = enqueue_sync_job(db, sync_job)
    response_status = "sync_started" if sync_job.status != "failed" else "sync_failed"

    return {
        "status": response_status,
        "provider": provider_key,
        "integration_id": str(integration.id),
        "sync_job": _serialize_sync_job(sync_job),
    }


@router.get("/sync-jobs/{sync_job_id}")
def get_sync_job(
    sync_job_id: str,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    sync_job_uuid = _parse_uuid(sync_job_id, "sync_job_id")
    sync_job = (
        db.query(SyncJob)
        .filter(
            SyncJob.id == sync_job_uuid,
            SyncJob.workspace_id == workspace_ctx.workspace.id,
        )
        .first()
    )
    if not sync_job:
        raise HTTPException(status_code=404, detail="Sync job not found")
    return _serialize_sync_job(sync_job)


@router.post("/webhooks/stripe")
async def stripe_webhook(
    request: Request,
    db: Session = Depends(deps.get_db),
) -> Any:
    payload = await request.body()
    signature = request.headers.get("Stripe-Signature", "")
    secret = settings.STRIPE_WEBHOOK_SECRET
    if not secret:
        raise HTTPException(status_code=503, detail="Stripe webhook secret not configured")
    if not verify_stripe_webhook_signature(payload, signature, secret):
        raise HTTPException(status_code=400, detail="Invalid Stripe webhook signature")

    event = await request.json()
    account = event.get("account")
    if not account:
        account = ((event.get("data") or {}).get("object") or {}).get("account")

    query = db.query(Integration).filter(
        Integration.platform == "stripe",
        Integration.status == "active",
    )
    if account:
        query = query.filter(Integration.account_id == account)
    integrations = query.all()

    queued_jobs = []
    for integration in integrations:
        if not integration.workspace_id:
            continue
        sync_job = create_sync_job(
            db=db,
            workspace_id=integration.workspace_id,
            integration=integration,
            trigger_type="webhook",
            requested_by_user_id=None,
        )
        db.commit()
        db.refresh(sync_job)
        sync_job = enqueue_sync_job(db, sync_job)
        queued_jobs.append(str(sync_job.id))

    return {"received": True, "queued_jobs": queued_jobs}


@router.post("/webhooks/shopify")
async def shopify_webhook(
    request: Request,
    db: Session = Depends(deps.get_db),
) -> Any:
    payload = await request.body()
    signature = request.headers.get("X-Shopify-Hmac-Sha256", "")
    secret = settings.SHOPIFY_WEBHOOK_SECRET
    if not secret:
        raise HTTPException(status_code=503, detail="Shopify webhook secret not configured")
    if not verify_shopify_webhook_signature(payload, signature, secret):
        raise HTTPException(status_code=400, detail="Invalid Shopify webhook signature")

    shop_domain = request.headers.get("X-Shopify-Shop-Domain")
    integrations = (
        db.query(Integration)
        .filter(
            Integration.platform == "shopify",
            Integration.status == "active",
        )
        .all()
    )

    queued_jobs = []
    for integration in integrations:
        metadata = integration.metadata_config or {}
        if shop_domain and integration.account_id != shop_domain and metadata.get("shop_domain") != shop_domain:
            continue
        if not integration.workspace_id:
            continue
        sync_job = create_sync_job(
            db=db,
            workspace_id=integration.workspace_id,
            integration=integration,
            trigger_type="webhook",
            requested_by_user_id=None,
        )
        db.commit()
        db.refresh(sync_job)
        sync_job = enqueue_sync_job(db, sync_job)
        queued_jobs.append(str(sync_job.id))

    return {"received": True, "queued_jobs": queued_jobs}


@router.post("/connect/{platform}")
def legacy_connect_alias(
    platform: str,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    # Backward-compatible alias while frontend migrates to OAuth redirect flow.
    provider_key = _validate_provider(platform)
    integration = (
        db.query(Integration)
        .filter(
            Integration.workspace_id == workspace_ctx.workspace.id,
            Integration.platform == provider_key,
        )
        .first()
    )
    if not integration:
        integration = Integration(
            workspace_id=workspace_ctx.workspace.id,
            user_id=workspace_ctx.membership.user_id,
            platform=provider_key,
            status="active",
            metadata_config={"legacy_connect": True},
        )
        db.add(integration)
    else:
        integration.status = "active"
    db.commit()
    seed_result = seed_demo_data(
        db,
        user_id=str(workspace_ctx.membership.user_id),
        workspace_id=str(workspace_ctx.workspace.id),
    )

    return {
        "status": "connected",
        "platform": provider_key,
        "integration_id": str(integration.id),
        "data_seeded": seed_result,
    }


@router.post("/connect-all")
def legacy_connect_all(
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    created: list[dict[str, str]] = []
    for provider_key in sorted(SUPPORTED_PROVIDERS):
        integration = (
            db.query(Integration)
            .filter(
                Integration.workspace_id == workspace_ctx.workspace.id,
                Integration.platform == provider_key,
            )
            .first()
        )
        if not integration:
            integration = Integration(
                workspace_id=workspace_ctx.workspace.id,
                user_id=workspace_ctx.membership.user_id,
                platform=provider_key,
                status="active",
                metadata_config={"legacy_connect_all": True},
            )
            db.add(integration)
            db.flush()
        else:
            integration.status = "active"
        created.append({"platform": provider_key, "integration_id": str(integration.id)})
    db.commit()
    seed_result = seed_demo_data(
        db,
        user_id=str(workspace_ctx.membership.user_id),
        workspace_id=str(workspace_ctx.workspace.id),
    )
    return {"status": "all_connected", "integrations": created, "data_seeded": seed_result}


@router.post("/sync/{integration_id}")
def legacy_sync(
    integration_id: str,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    integration_uuid = _parse_uuid(integration_id, "integration_id")
    integration = (
        db.query(Integration)
        .filter(
            Integration.id == integration_uuid,
            Integration.workspace_id == workspace_ctx.workspace.id,
        )
        .first()
    )
    if not integration:
        raise HTTPException(status_code=404, detail="Integration not found")

    sync_job = create_sync_job(
        db=db,
        workspace_id=workspace_ctx.workspace.id,
        integration=integration,
        trigger_type="manual",
        requested_by_user_id=workspace_ctx.membership.user_id,
    )
    db.commit()
    db.refresh(sync_job)
    sync_job = enqueue_sync_job(db, sync_job)
    response_status = "sync_started" if sync_job.status != "failed" else "sync_failed"
    return {
        "status": response_status,
        "integration_id": str(integration.id),
        "platform": integration.platform,
        "sync_job": _serialize_sync_job(sync_job),
    }
