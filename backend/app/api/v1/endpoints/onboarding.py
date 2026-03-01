from typing import Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api import deps
from app.models.integration import Integration
from app.models.notification_preference import NotificationPreference
from app.models.user import User
from app.schemas.onboarding import OnboardingStatusResponse, OnboardingSteps, OnboardingCompleteResponse

router = APIRouter()


@router.get("/status", response_model=OnboardingStatusResponse)
def get_onboarding_status(
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    """Check onboarding completion status."""
    # Check integrations
    integrations_count = (
        db.query(Integration)
        .filter(
            Integration.workspace_id == workspace_ctx.workspace.id,
            Integration.status == "active",
        )
        .count()
    )
    integrations_connected = integrations_count > 0

    # Check currency (considered set if not default or if user explicitly chose USD)
    current_user = workspace_ctx.membership.user
    currency_set = current_user.base_currency is not None and current_user.base_currency != ""

    # Check notification preferences exist
    prefs = (
        db.query(NotificationPreference)
        .filter(
            NotificationPreference.user_id == current_user.id,
            NotificationPreference.workspace_id == workspace_ctx.workspace.id,
        )
        .first()
    )
    preferences_configured = prefs is not None

    return OnboardingStatusResponse(
        completed=current_user.onboarding_completed,
        steps=OnboardingSteps(
            integrations_connected=integrations_connected,
            currency_set=currency_set,
            preferences_configured=preferences_configured,
        ),
    )


@router.post("/complete", response_model=OnboardingCompleteResponse)
def complete_onboarding(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Mark onboarding as completed."""
    current_user.onboarding_completed = True
    db.commit()
    return OnboardingCompleteResponse(success=True)
