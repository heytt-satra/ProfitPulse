from sqlalchemy import Column, String, Boolean, Time, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base


class NotificationPreference(Base):
    __tablename__ = "notification_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    email_enabled = Column(Boolean, default=True)
    slack_enabled = Column(Boolean, default=False)
    slack_webhook_url = Column(String, nullable=True)
    delivery_time = Column(Time, default="07:00:00")
    timezone = Column(String, default="UTC")
    include_insights = Column(Boolean, default=True)

    user = relationship("User", backref="notification_preferences")
    workspace = relationship("Workspace", backref="notification_preferences")
