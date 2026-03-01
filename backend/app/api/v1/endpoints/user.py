from typing import Any, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel

from app.api import deps
from app.models.user import User
from app.schemas.user import User as UserSchema

router = APIRouter()


class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    base_currency: Optional[str] = None


class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: Optional[str] = None
    company_name: Optional[str] = None
    base_currency: str
    subscription_tier: str
    onboarding_completed: bool

    class Config:
        from_attributes = True


@router.get("/profile", response_model=UserProfileResponse)
def get_user_profile(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Get current user profile."""
    return UserProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        company_name=current_user.company_name,
        base_currency=current_user.base_currency or "USD",
        subscription_tier=current_user.subscription_tier or "free",
        onboarding_completed=current_user.onboarding_completed or False,
    )


@router.put("/profile", response_model=UserProfileResponse)
def update_user_profile(
    profile_in: UserProfileUpdate,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Update user profile."""
    update_data = profile_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    return UserProfileResponse(
        id=str(current_user.id),
        email=current_user.email,
        full_name=current_user.full_name,
        company_name=current_user.company_name,
        base_currency=current_user.base_currency or "USD",
        subscription_tier=current_user.subscription_tier or "free",
        onboarding_completed=current_user.onboarding_completed or False,
    )
