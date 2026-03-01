import time
from typing import Any, Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api import deps
from app.models.chat_history import ChatHistory
from app.models.user import User
from app.schemas.chat import ChatRequest, ChatResponse
from app.services.vanna_service import vn
from app.utils.sql_validator import SQLValidationError, validate_and_normalize_sql

router = APIRouter()

ALLOWED_ANALYTICS_TABLES = {
    "fact_daily_financials",
    "chat_history",
    "integrations",
    "saved_queries",
    "dashboards",
    "dashboard_widgets",
}


def _build_chart_spec(data: list[dict[str, Any]]) -> Optional[dict[str, Any]]:
    if not data:
        return None

    first_row = data[0]
    if "date" in first_row and any(k for k in first_row.keys() if k != "date"):
        value_keys = [k for k in first_row.keys() if k != "date"]
        return {
            "type": "line",
            "x": "date",
            "series": value_keys[:3],
        }
    return None


def _save_chat_history(
    db: Session,
    workspace_id: uuid.UUID,
    user_id: uuid.UUID,
    query: str,
    sql: str,
    data: Any,
    response: str,
    execution_ms: int,
):
    try:
        db.add(
            ChatHistory(
                workspace_id=workspace_id,
                user_id=user_id,
                query=query,
                generated_sql=sql,
                sql_results=data if data else None,
                ai_response=response,
                execution_time_ms=execution_ms,
            )
        )
        db.commit()
    except Exception:
        db.rollback()


@router.post("/query", response_model=ChatResponse)
def chat_query(
    request: ChatRequest,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    question = request.question.strip()
    start_time = time.time()

    if request.workspace_id and request.workspace_id != str(workspace_ctx.workspace.id):
        raise HTTPException(status_code=403, detail="workspace_id does not match selected workspace context")
    workspace_id = request.workspace_id or str(workspace_ctx.workspace.id)

    # Keep prompt constraints explicit for better SQL generation determinism.
    scoped_question = (
        f"{question}\n"
        f"Use workspace_id = '{workspace_id}'. "
        "Only query known analytics tables and produce read-only SQL."
    )

    try:
        sql_query = vn.generate_sql(scoped_question)
        if not sql_query or not sql_query.strip():
            raise HTTPException(status_code=422, detail="Unable to generate SQL for this question.")

        validated = validate_and_normalize_sql(
            sql_query,
            allow_tables=ALLOWED_ANALYTICS_TABLES,
            max_rows=200,
        )

        rows = db.execute(
            text(validated.sql),
            {"workspace_id": workspace_id},
        ).mappings().all()
        data_preview = [dict(row) for row in rows]
        execution_ms = int((time.time() - start_time) * 1000)

        answer = (
            "No rows matched this question for the selected workspace."
            if not data_preview
            else f"Found {len(data_preview)} row(s) for your question."
        )

        provenance = [f"table:{name}" for name in validated.source_tables]
        confidence = 0.9 if data_preview else 0.75

        _save_chat_history(
            db=db,
            workspace_id=workspace_ctx.workspace.id,
            user_id=current_user.id,
            query=question,
            sql=validated.sql,
            data=data_preview,
            response=answer,
            execution_ms=execution_ms,
        )

        return ChatResponse(
            answer=answer,
            sql=validated.sql,
            data_preview=data_preview[:50],
            chart_spec=_build_chart_spec(data_preview),
            confidence=confidence,
            provenance=provenance,
            warnings=validated.warnings,
            execution_ms=execution_ms,
        )
    except SQLValidationError as exc:
        execution_ms = int((time.time() - start_time) * 1000)
        message = str(exc)
        _save_chat_history(
            db=db,
            workspace_id=workspace_ctx.workspace.id,
            user_id=current_user.id,
            query=question,
            sql=sql_query if "sql_query" in locals() else "",
            data=None,
            response=message,
            execution_ms=execution_ms,
        )
        return ChatResponse(
            answer="I couldn't safely execute that query.",
            sql=sql_query if "sql_query" in locals() else "",
            confidence=0.0,
            provenance=[],
            warnings=[],
            execution_ms=execution_ms,
            error=message,
        )
    except Exception as exc:
        execution_ms = int((time.time() - start_time) * 1000)
        message = str(exc)
        _save_chat_history(
            db=db,
            workspace_id=workspace_ctx.workspace.id,
            user_id=current_user.id,
            query=question,
            sql=sql_query if "sql_query" in locals() else "",
            data=None,
            response=message,
            execution_ms=execution_ms,
        )
        return ChatResponse(
            answer="I couldn't complete that query right now.",
            sql=sql_query if "sql_query" in locals() else "",
            confidence=0.0,
            provenance=[],
            warnings=[],
            execution_ms=execution_ms,
            error=message,
        )


class ChatHistoryItem(BaseModel):
    id: str
    query: str
    answer: Optional[str] = None
    created_at: Optional[str] = None


class ChatHistoryResponse(BaseModel):
    queries: list[ChatHistoryItem]
    total: int
    has_more: bool


@router.get("/history", response_model=ChatHistoryResponse)
def get_chat_history(
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    total = (
        db.query(ChatHistory)
        .filter(ChatHistory.workspace_id == workspace_ctx.workspace.id)
        .count()
    )

    records = (
        db.query(ChatHistory)
        .filter(ChatHistory.workspace_id == workspace_ctx.workspace.id)
        .order_by(ChatHistory.created_at.desc())
        .offset(offset)
        .limit(limit)
        .all()
    )

    queries = [
        ChatHistoryItem(
            id=str(record.id),
            query=record.query,
            answer=record.ai_response,
            created_at=record.created_at.isoformat() if record.created_at else None,
        )
        for record in records
    ]

    return ChatHistoryResponse(
        queries=queries,
        total=total,
        has_more=(offset + limit) < total,
    )
