from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field


class ChatTimeRange(BaseModel):
    start_date: Optional[str] = None
    end_date: Optional[str] = None


class ChatRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)
    workspace_id: Optional[str] = None
    time_range: Optional[ChatTimeRange] = None
    metric_context: Optional[Dict[str, Any]] = None


class ChatResponse(BaseModel):
    answer: str
    sql: str
    data_preview: Optional[List[Dict[str, Any]]] = None
    chart_spec: Optional[Dict[str, Any]] = None
    confidence: float = 0.0
    provenance: List[str] = []
    warnings: List[str] = []
    execution_ms: Optional[int] = None
    error: Optional[str] = None
