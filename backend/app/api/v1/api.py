from fastapi import APIRouter
from app.api.v1.endpoints import (
    analytics,
    auth,
    chat,
    integrations,
    metrics,
    notifications,
    onboarding,
    system,
    user,
    workspaces,
)

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(integrations.router, prefix="/integrations", tags=["integrations"])
api_router.include_router(user.router, prefix="/user", tags=["user"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
api_router.include_router(analytics.router, tags=["analytics"])
api_router.include_router(system.router, prefix="/system", tags=["system"])
