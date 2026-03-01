from datetime import time
from typing import Optional
from zoneinfo import ZoneInfo

from pydantic import BaseModel, Field, field_validator


class NotificationPreferencesResponse(BaseModel):
    email_enabled: bool = True
    slack_enabled: bool = False
    slack_webhook_url: Optional[str] = None
    delivery_time: str = "07:00"
    timezone: str = "UTC"
    include_insights: bool = True

    class Config:
        from_attributes = True


class NotificationPreferencesUpdate(BaseModel):
    email_enabled: Optional[bool] = None
    slack_enabled: Optional[bool] = None
    slack_webhook_url: Optional[str] = None
    delivery_time: Optional[time] = Field(default=None, description="HH:MM[:SS] time format")
    timezone: Optional[str] = None
    include_insights: Optional[bool] = None

    @field_validator("timezone")
    @classmethod
    def validate_timezone(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return None
        try:
            ZoneInfo(value)
        except Exception as exc:
            raise ValueError(f"Invalid timezone: {value}") from exc
        return value
