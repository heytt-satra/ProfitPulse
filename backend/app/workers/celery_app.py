from celery import Celery
from app.core.config import settings

# Use Redis as broker and backend
# Default to localhost if not set (though docker-compose sets it)
BROKER_URL = "redis://localhost:6379/0" 
BACKEND_URL = "redis://localhost:6379/0"

# If running in Docker, env vars should override these, but let's be explicit if settings has them
if hasattr(settings, "REDIS_URL") and settings.REDIS_URL:
    BROKER_URL = settings.REDIS_URL
    BACKEND_URL = settings.REDIS_URL

celery_app = Celery("profitpulse_worker", broker=BROKER_URL, backend=BACKEND_URL)

celery_app.conf.task_routes = {
    "app.workers.tasks.*": {"queue": "main-queue"},
}

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)
