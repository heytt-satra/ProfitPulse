from typing import Any, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api import deps
from app.models.dashboard import Dashboard
from app.models.dashboard_widget import DashboardWidget
from app.models.saved_query import SavedQuery

router = APIRouter()


class SavedQueryCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=140)
    question: str
    generated_sql: str
    chart_spec: Optional[dict] = None


class DashboardCreateRequest(BaseModel):
    name: str = Field(min_length=2, max_length=140)


class DashboardWidgetCreateRequest(BaseModel):
    title: str
    widget_type: str = "chart"
    saved_query_id: Optional[str] = None
    position_x: int = 0
    position_y: int = 0
    width: int = 6
    height: int = 4
    config: Optional[dict] = None


@router.get("/saved-queries")
def list_saved_queries(
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    queries = (
        db.query(SavedQuery)
        .filter(SavedQuery.workspace_id == workspace_ctx.workspace.id)
        .order_by(SavedQuery.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(query.id),
            "name": query.name,
            "question": query.question,
            "generated_sql": query.generated_sql,
            "chart_spec": query.chart_spec,
            "created_at": query.created_at.isoformat() if query.created_at else None,
        }
        for query in queries
    ]


@router.post("/saved-queries")
def create_saved_query(
    payload: SavedQueryCreateRequest,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    saved_query = SavedQuery(
        workspace_id=workspace_ctx.workspace.id,
        user_id=workspace_ctx.membership.user_id,
        name=payload.name,
        question=payload.question,
        generated_sql=payload.generated_sql,
        chart_spec=payload.chart_spec,
    )
    db.add(saved_query)
    db.commit()
    db.refresh(saved_query)
    return {"id": str(saved_query.id)}


@router.get("/dashboards")
def list_dashboards(
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    dashboards = (
        db.query(Dashboard)
        .filter(Dashboard.workspace_id == workspace_ctx.workspace.id)
        .order_by(Dashboard.created_at.desc())
        .all()
    )
    return [
        {
            "id": str(dashboard.id),
            "name": dashboard.name,
            "created_at": dashboard.created_at.isoformat() if dashboard.created_at else None,
        }
        for dashboard in dashboards
    ]


@router.post("/dashboards")
def create_dashboard(
    payload: DashboardCreateRequest,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    dashboard = Dashboard(
        workspace_id=workspace_ctx.workspace.id,
        created_by_user_id=workspace_ctx.membership.user_id,
        name=payload.name,
    )
    db.add(dashboard)
    db.commit()
    db.refresh(dashboard)
    return {"id": str(dashboard.id)}


@router.get("/dashboards/{dashboard_id}/widgets")
def list_dashboard_widgets(
    dashboard_id: str,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    dashboard = (
        db.query(Dashboard)
        .filter(
            Dashboard.id == dashboard_id,
            Dashboard.workspace_id == workspace_ctx.workspace.id,
        )
        .first()
    )
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")

    widgets = (
        db.query(DashboardWidget)
        .filter(DashboardWidget.dashboard_id == dashboard.id)
        .order_by(DashboardWidget.position_y.asc(), DashboardWidget.position_x.asc())
        .all()
    )
    return [
        {
            "id": str(widget.id),
            "title": widget.title,
            "widget_type": widget.widget_type,
            "saved_query_id": str(widget.saved_query_id) if widget.saved_query_id else None,
            "position_x": widget.position_x,
            "position_y": widget.position_y,
            "width": widget.width,
            "height": widget.height,
            "config": widget.config,
        }
        for widget in widgets
    ]


@router.post("/dashboards/{dashboard_id}/widgets")
def create_dashboard_widget(
    dashboard_id: str,
    payload: DashboardWidgetCreateRequest,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    dashboard = (
        db.query(Dashboard)
        .filter(
            Dashboard.id == dashboard_id,
            Dashboard.workspace_id == workspace_ctx.workspace.id,
        )
        .first()
    )
    if not dashboard:
        raise HTTPException(status_code=404, detail="Dashboard not found")

    saved_query_id = None
    if payload.saved_query_id:
        try:
            saved_query_uuid = uuid.UUID(payload.saved_query_id)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail="Invalid saved_query_id") from exc
        saved_query = (
            db.query(SavedQuery)
            .filter(
                SavedQuery.id == saved_query_uuid,
                SavedQuery.workspace_id == workspace_ctx.workspace.id,
            )
            .first()
        )
        if not saved_query:
            raise HTTPException(status_code=404, detail="Saved query not found")
        saved_query_id = saved_query.id

    widget = DashboardWidget(
        dashboard_id=dashboard.id,
        saved_query_id=saved_query_id,
        title=payload.title,
        widget_type=payload.widget_type,
        position_x=payload.position_x,
        position_y=payload.position_y,
        width=payload.width,
        height=payload.height,
        config=payload.config,
    )
    db.add(widget)
    db.commit()
    db.refresh(widget)
    return {"id": str(widget.id)}
