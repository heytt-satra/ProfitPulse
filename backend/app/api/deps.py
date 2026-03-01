from dataclasses import dataclass
from typing import Optional
import uuid

import httpx
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core import security
from app.core.config import settings
from app.core.database import get_db
from app.models.organization import Organization
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_membership import WorkspaceMembership

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/session",
    auto_error=False,
)

WORKSPACE_ROLES = {"owner", "admin", "analyst", "viewer"}


@dataclass
class WorkspaceContext:
    workspace: Workspace
    membership: WorkspaceMembership
    role: str


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _get_or_create_dev_user(db: Session) -> User:
    dev_email = "bypass@example.com"
    user = db.query(User).filter(User.email == dev_email).first()
    if user:
        return user

    user = User(
        email=dev_email,
        hashed_password=security.get_password_hash("dev123"),
        full_name="Dev User",
        company_name="ProfitPulse",
        base_currency="USD",
        subscription_tier="pro",
        onboarding_completed=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _is_local_env() -> bool:
    return settings.APP_ENV.lower() in {"development", "local"}


def _fetch_supabase_identity(token: str) -> dict:
    if not settings.SUPABASE_URL:
        raise _credentials_exception()

    api_key = (
        settings.SUPABASE_SERVICE_ROLE_KEY
        or settings.SUPABASE_KEY
        or settings.SUPABASE_ANON_KEY
    )
    if not api_key:
        raise _credentials_exception()

    try:
        response = httpx.get(
            f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
            headers={
                "Authorization": f"Bearer {token}",
                "apikey": api_key,
            },
            timeout=8.0,
        )
    except httpx.HTTPError:
        raise _credentials_exception()

    if response.status_code != 200:
        raise _credentials_exception()

    payload = response.json()
    if not payload.get("id"):
        raise _credentials_exception()

    return payload


def _ensure_default_workspace(db: Session, user: User) -> None:
    existing = (
        db.query(WorkspaceMembership)
        .filter(WorkspaceMembership.user_id == user.id)
        .first()
    )
    if existing:
        return

    company_or_slug = user.company_name or user.email.split("@")[0]
    organization = Organization(
        name=f"{company_or_slug}'s Org",
        owner_user_id=user.id,
    )
    db.add(organization)
    db.flush()

    workspace = Workspace(
        organization_id=organization.id,
        name=user.company_name or "Default Workspace",
        slug=company_or_slug.lower().replace(" ", "-").replace("_", "-")[:48] or "workspace",
    )
    db.add(workspace)
    db.flush()

    db.add(
        WorkspaceMembership(
            workspace_id=workspace.id,
            user_id=user.id,
            role="owner",
        )
    )
    db.commit()


def get_current_user(
    db: Session = Depends(get_db),
    token: Optional[str] = Depends(reusable_oauth2),
) -> User:
    if settings.DEV_BYPASS_AUTH and _is_local_env() and not token:
        return _get_or_create_dev_user(db)

    if not token:
        raise _credentials_exception()

    try:
        identity = _fetch_supabase_identity(token)
        user_id = uuid.UUID(identity["id"])
    except ValueError:
        raise _credentials_exception()

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        metadata = identity.get("user_metadata") or {}
        user = User(
            id=user_id,  # Keep IDs aligned with Supabase auth subject
            email=identity.get("email") or f"{user_id}@supabase.local",
            full_name=metadata.get("full_name"),
            company_name=metadata.get("company_name"),
        )
        db.add(user)
        db.commit()
        db.refresh(user)

    _ensure_default_workspace(db, user)
    return user


def get_workspace_context(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    x_workspace_id: Optional[str] = Header(default=None, alias="X-Workspace-Id"),
) -> WorkspaceContext:
    membership_query = db.query(WorkspaceMembership).filter(
        WorkspaceMembership.user_id == current_user.id
    )

    membership: Optional[WorkspaceMembership]
    if x_workspace_id:
        try:
            workspace_id = uuid.UUID(x_workspace_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid X-Workspace-Id header")

        membership = membership_query.filter(
            WorkspaceMembership.workspace_id == workspace_id
        ).first()
    else:
        membership = membership_query.order_by(WorkspaceMembership.created_at.asc()).first()

    if not membership:
        raise HTTPException(status_code=403, detail="No workspace membership found for user")

    workspace = db.query(Workspace).filter(Workspace.id == membership.workspace_id).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")

    role = (membership.role or "viewer").lower()
    if role not in WORKSPACE_ROLES:
        role = "viewer"

    return WorkspaceContext(workspace=workspace, membership=membership, role=role)
