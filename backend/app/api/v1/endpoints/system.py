from datetime import datetime, timezone
from typing import Any
from fastapi import APIRouter

from app.core.config import settings

router = APIRouter()


@router.get("/health")
def health() -> Any:
    return {
        "status": "ok",
        "project": settings.PROJECT_NAME,
        "environment": settings.APP_ENV,
        "version": "v1",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
