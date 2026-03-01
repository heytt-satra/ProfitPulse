from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.notification_preference import NotificationPreference
from app.schemas.notifications import NotificationPreferencesResponse, NotificationPreferencesUpdate

router = APIRouter()


@router.get("/preferences", response_model=NotificationPreferencesResponse)
def get_notification_preferences(
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    """Get notification settings for the current user."""
    prefs = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == workspace_ctx.membership.user_id,
            NotificationPreference.workspace_id == workspace_ctx.workspace.id,
        )
        .first()
    )

    if not prefs:
        return NotificationPreferencesResponse()

    return NotificationPreferencesResponse(
        email_enabled=prefs.email_enabled,
        slack_enabled=prefs.slack_enabled,
        slack_webhook_url=prefs.slack_webhook_url,
        delivery_time=str(prefs.delivery_time)[:5] if prefs.delivery_time else "07:00",
        timezone=prefs.timezone or "UTC",
        include_insights=prefs.include_insights,
    )


@router.put("/preferences", response_model=NotificationPreferencesResponse)
def update_notification_preferences(
    prefs_in: NotificationPreferencesUpdate,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    """Update notification settings."""
    prefs = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == workspace_ctx.membership.user_id,
            NotificationPreference.workspace_id == workspace_ctx.workspace.id,
        )
        .first()
    )

    if not prefs:
        prefs = NotificationPreference(
            user_id=workspace_ctx.membership.user_id,
            workspace_id=workspace_ctx.workspace.id,
        )
        db.add(prefs)

    update_data = prefs_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(prefs, field, value)

    db.commit()
    db.refresh(prefs)

    return NotificationPreferencesResponse(
        email_enabled=prefs.email_enabled,
        slack_enabled=prefs.slack_enabled,
        slack_webhook_url=prefs.slack_webhook_url,
        delivery_time=str(prefs.delivery_time)[:5] if prefs.delivery_time else "07:00",
        timezone=prefs.timezone or "UTC",
        include_insights=prefs.include_insights,
    )
