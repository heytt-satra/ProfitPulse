from sqlalchemy import Column, String, Date, Numeric, Integer, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class FinancialData(Base):
    __tablename__ = "fact_daily_financials"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    date = Column(Date, nullable=False)
    
    revenue_gross = Column(Numeric(12, 2), default=0)
    revenue_net = Column(Numeric(12, 2), default=0)
    refunds = Column(Numeric(12, 2), default=0)
    disputes = Column(Numeric(12, 2), default=0)
    
    cost_ads_meta = Column(Numeric(12, 2), default=0)
    cost_ads_google = Column(Numeric(12, 2), default=0)
    cost_transaction_fees = Column(Numeric(12, 2), default=0)
    cost_fixed_allocated = Column(Numeric(12, 2), default=0)
    cost_variable = Column(Numeric(12, 2), default=0)
    
    currency = Column(String, default="USD")
    transactions_count = Column(Integer, default=0)
    orders_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        UniqueConstraint('workspace_id', 'user_id', 'date', name='idx_financials_workspace_user_date_unique'),
    )
