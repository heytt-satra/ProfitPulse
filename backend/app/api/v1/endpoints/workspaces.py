from typing import Any, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api import deps
from app.models.organization import Organization
from app.models.workspace import Workspace
from app.models.workspace_membership import WorkspaceMembership

router = APIRouter()


class WorkspaceCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    slug: Optional[str] = Field(default=None, max_length=64)


class WorkspaceUpdateRequest(BaseModel):
    name: Optional[str] = Field(default=None, min_length=2, max_length=120)


class WorkspaceMemberAddRequest(BaseModel):
    user_id: str
    role: str = "viewer"


@router.get("/")
def list_workspaces(
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
) -> Any:
    memberships = (
        db.query(WorkspaceMembership)
        .filter(WorkspaceMembership.user_id == current_user.id)
        .all()
    )
    workspace_ids = [m.workspace_id for m in memberships]
    if not workspace_ids:
        return []

    workspaces = db.query(Workspace).filter(Workspace.id.in_(workspace_ids)).all()
    role_map = {str(m.workspace_id): m.role for m in memberships}

    return [
        {
            "id": str(workspace.id),
            "organization_id": str(workspace.organization_id),
            "name": workspace.name,
            "slug": workspace.slug,
            "role": role_map.get(str(workspace.id), "viewer"),
        }
        for workspace in workspaces
    ]


@router.post("/")
def create_workspace(
    payload: WorkspaceCreateRequest,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
) -> Any:
    org = Organization(
        name=f"{payload.name} Org",
        owner_user_id=current_user.id,
    )
    db.add(org)
    db.flush()

    slug = payload.slug or payload.name.lower().replace(" ", "-").replace("_", "-")
    workspace = Workspace(
        organization_id=org.id,
        name=payload.name,
        slug=slug[:64],
    )
    db.add(workspace)
    db.flush()

    db.add(
        WorkspaceMembership(
            workspace_id=workspace.id,
            user_id=current_user.id,
            role="owner",
        )
    )
    db.commit()

    return {
        "id": str(workspace.id),
        "organization_id": str(workspace.organization_id),
        "name": workspace.name,
        "slug": workspace.slug,
        "role": "owner",
    }


@router.put("/{workspace_id}")
def update_workspace(
    workspace_id: str,
    payload: WorkspaceUpdateRequest,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    if str(workspace_ctx.workspace.id) != workspace_id:
        raise HTTPException(status_code=403, detail="Can only update selected workspace")
    if workspace_ctx.role not in {"owner", "admin"}:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    if payload.name:
        workspace_ctx.workspace.name = payload.name

    db.commit()
    db.refresh(workspace_ctx.workspace)

    return {
        "id": str(workspace_ctx.workspace.id),
        "name": workspace_ctx.workspace.name,
        "slug": workspace_ctx.workspace.slug,
    }


@router.delete("/{workspace_id}")
def delete_workspace(
    workspace_id: str,
    db: Session = Depends(deps.get_db),
    current_user=Depends(deps.get_current_user),
) -> Any:
    try:
        workspace_uuid = uuid.UUID(workspace_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid workspace id") from exc

    membership = (
        db.query(WorkspaceMembership)
        .filter(
            WorkspaceMembership.workspace_id == workspace_uuid,
            WorkspaceMembership.user_id == current_user.id,
        )
        .first()
    )
    if not membership or (membership.role or "").lower() != "owner":
        raise HTTPException(status_code=403, detail="Only workspace owners can delete workspaces")

    workspace = db.query(Workspace).filter(Workspace.id == workspace_uuid).first()
    if not workspace:
        raise HTTPException(status_code=404, detail="Workspace not found")
    db.delete(workspace)
    db.commit()
    return {"deleted": True}


@router.get("/{workspace_id}/members")
def list_workspace_members(
    workspace_id: str,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    if str(workspace_ctx.workspace.id) != workspace_id:
        raise HTTPException(status_code=403, detail="Can only list members for selected workspace")

    members = (
        db.query(WorkspaceMembership)
        .filter(WorkspaceMembership.workspace_id == workspace_ctx.workspace.id)
        .all()
    )
    return [
        {
            "id": str(member.id),
            "user_id": str(member.user_id),
            "role": member.role,
            "created_at": member.created_at.isoformat() if member.created_at else None,
        }
        for member in members
    ]


@router.post("/{workspace_id}/members")
def add_workspace_member(
    workspace_id: str,
    payload: WorkspaceMemberAddRequest,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    if str(workspace_ctx.workspace.id) != workspace_id:
        raise HTTPException(status_code=403, detail="Can only add members for selected workspace")
    if workspace_ctx.role not in {"owner", "admin"}:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    role = payload.role.lower()
    if role not in deps.WORKSPACE_ROLES:
        raise HTTPException(status_code=400, detail=f"Invalid role: {payload.role}")

    try:
        user_uuid = uuid.UUID(payload.user_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail="Invalid user_id") from exc

    existing = (
        db.query(WorkspaceMembership)
        .filter(
            WorkspaceMembership.workspace_id == workspace_ctx.workspace.id,
            WorkspaceMembership.user_id == user_uuid,
        )
        .first()
    )
    if existing:
        existing.role = role
        db.commit()
        db.refresh(existing)
        return {"id": str(existing.id), "user_id": str(existing.user_id), "role": existing.role}

    membership = WorkspaceMembership(
        workspace_id=workspace_ctx.workspace.id,
        user_id=user_uuid,
        role=role,
    )
    db.add(membership)
    db.commit()
    db.refresh(membership)
    return {"id": str(membership.id), "user_id": str(membership.user_id), "role": membership.role}
