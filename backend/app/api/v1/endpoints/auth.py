from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api import deps
from app.models.user import User
from app.models.workspace_membership import WorkspaceMembership
from app.schemas.user import User as UserSchema

router = APIRouter()


@router.get("/session")
def get_auth_session(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """Return authenticated session context derived from Supabase bearer token."""
    memberships = (
        db.query(WorkspaceMembership)
        .filter(WorkspaceMembership.user_id == current_user.id)
        .all()
    )

    return {
        "authenticated": True,
        "user": {
            "id": str(current_user.id),
            "email": current_user.email,
            "full_name": current_user.full_name,
            "company_name": current_user.company_name,
            "subscription_tier": current_user.subscription_tier,
        },
        "workspaces": [
            {
                "workspace_id": str(m.workspace_id),
                "role": m.role,
            }
            for m in memberships
        ],
    }


@router.get("/me", response_model=UserSchema)
def get_current_user_profile(
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    return current_user


@router.post("/login")
def deprecated_login_endpoint() -> Any:
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Password login is deprecated. Use Supabase Auth on the client and send Bearer token.",
    )


@router.post("/signup")
def deprecated_signup_endpoint() -> Any:
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Signup is managed by Supabase Auth. Use Supabase signUp on the client.",
    )


@router.post("/refresh")
def deprecated_refresh_endpoint() -> Any:
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Token refresh is managed by Supabase Auth SDK.",
    )
