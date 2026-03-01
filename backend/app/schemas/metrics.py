from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import date


class TopExpense(BaseModel):
    category: str
    amount: float


class MetricsSummaryResponse(BaseModel):
    date: date
    net_profit: float
    net_profit_change_pct: Optional[float] = None
    revenue_gross: float
    revenue_net: float
    total_expenses: float
    top_expense: Optional[TopExpense] = None
    roas: Optional[float] = None
    transactions_count: int
    insight: Optional[str] = None


class DailyMetricRow(BaseModel):
    date: date
    net_profit: Optional[float] = None
    revenue_gross: Optional[float] = None
    revenue_net: Optional[float] = None
    cost_ads_meta: Optional[float] = None
    cost_ads_google: Optional[float] = None
    cost_transaction_fees: Optional[float] = None
    cost_fixed_allocated: Optional[float] = None
    cost_variable: Optional[float] = None


class DailyMetricsSummary(BaseModel):
    total_profit: float
    avg_daily_profit: float
    trend: str  # up / down / flat


class DailyMetricsResponse(BaseModel):
    data: List[DailyMetricRow]
    summary: DailyMetricsSummary
