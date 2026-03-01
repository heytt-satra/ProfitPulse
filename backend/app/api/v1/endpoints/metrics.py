from typing import Any, Optional
from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api import deps
from app.models.financial_data import FinancialData
from app.schemas.metrics import (
    MetricsSummaryResponse,
    DailyMetricsResponse,
    DailyMetricRow,
    DailyMetricsSummary,
    TopExpense,
)

router = APIRouter()


def _compute_summary_for_date(db: Session, workspace_id: str, target_date: date) -> dict:
    """Compute financial summary for a single date."""
    record = (
        db.query(FinancialData)
        .filter(FinancialData.workspace_id == workspace_id, FinancialData.date == target_date)
        .first()
    )
    if not record:
        return None

    revenue_gross = float(record.revenue_gross or 0)
    revenue_net = float(record.revenue_net or 0)
    cost_ads_meta = float(record.cost_ads_meta or 0)
    cost_ads_google = float(record.cost_ads_google or 0)
    cost_transaction_fees = float(record.cost_transaction_fees or 0)
    cost_fixed_allocated = float(record.cost_fixed_allocated or 0)
    cost_variable = float(record.cost_variable or 0)

    total_expenses = cost_ads_meta + cost_ads_google + cost_transaction_fees + cost_fixed_allocated + cost_variable
    net_profit = revenue_net - total_expenses
    total_ads = cost_ads_meta + cost_ads_google
    roas = revenue_gross / total_ads if total_ads > 0 else None

    # Determine top expense
    expenses = {
        "Meta Ads": cost_ads_meta,
        "Google Ads": cost_ads_google,
        "Transaction Fees": cost_transaction_fees,
        "Fixed Costs": cost_fixed_allocated,
        "Variable Costs": cost_variable,
    }
    top_exp_category = max(expenses, key=expenses.get)
    top_exp_amount = expenses[top_exp_category]

    return {
        "date": target_date,
        "net_profit": round(net_profit, 2),
        "revenue_gross": round(revenue_gross, 2),
        "revenue_net": round(revenue_net, 2),
        "total_expenses": round(total_expenses, 2),
        "top_expense": TopExpense(category=top_exp_category, amount=round(top_exp_amount, 2)),
        "roas": round(roas, 2) if roas is not None else None,
        "transactions_count": record.transactions_count or 0,
    }


@router.get("/summary", response_model=MetricsSummaryResponse)
def get_metrics_summary(
    target_date: Optional[date] = Query(None, alias="date", description="Date to get summary for (default: yesterday)"),
    compare_to: Optional[date] = Query(None, description="Date to compare against"),
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    """Get daily financial summary with optional comparison."""
    if target_date is None:
        target_date = date.today() - timedelta(days=1)

    try:
        summary = _compute_summary_for_date(db, str(workspace_ctx.workspace.id), target_date)
    except Exception:
        summary = None

    if summary is None:
        # Return zeroed-out summary if no data exists for date
        return MetricsSummaryResponse(
            date=target_date,
            net_profit=0,
            revenue_gross=0,
            revenue_net=0,
            total_expenses=0,
            transactions_count=0,
            insight="No data available for this date. Connect your integrations to start tracking.",
        )

    # Compute change percentage if compare_to provided (or default to previous day)
    if compare_to is None:
        compare_to = target_date - timedelta(days=1)

    try:
        compare_summary = _compute_summary_for_date(db, str(workspace_ctx.workspace.id), compare_to)
    except Exception:
        compare_summary = None

    change_pct = None
    if compare_summary and compare_summary["net_profit"] != 0:
        change_pct = round(
            ((summary["net_profit"] - compare_summary["net_profit"]) / abs(compare_summary["net_profit"])) * 100,
            1,
        )

    # Generate a simple insight
    insight = None
    if change_pct is not None:
        if change_pct > 0:
            insight = f"Your net profit is up {change_pct}% compared to the previous day. Keep it up!"
        elif change_pct < 0:
            top = summary["top_expense"]
            insight = f"Profit dipped {abs(change_pct)}%. Your largest expense was {top.category} at ${top.amount:,.2f}."
        else:
            insight = "Profit is flat compared to the previous day."

    return MetricsSummaryResponse(
        **summary,
        net_profit_change_pct=change_pct,
        insight=insight,
    )


@router.get("/daily", response_model=DailyMetricsResponse)
def get_metrics_daily(
    start_date: date = Query(..., description="Start date (YYYY-MM-DD)"),
    end_date: date = Query(..., description="End date (YYYY-MM-DD)"),
    metrics: Optional[str] = Query(None, description="Comma-separated metric names to include"),
    db: Session = Depends(deps.get_db),
    workspace_ctx: deps.WorkspaceContext = Depends(deps.get_workspace_context),
) -> Any:
    """Get time-series financial data for charting."""
    if start_date > end_date:
        raise HTTPException(status_code=400, detail="start_date must be <= end_date")
    if (end_date - start_date).days > 366:
        raise HTTPException(status_code=400, detail="Date range cannot exceed 366 days")

    try:
        records = (
            db.query(FinancialData)
            .filter(
                FinancialData.workspace_id == workspace_ctx.workspace.id,
                FinancialData.date >= start_date,
                FinancialData.date <= end_date,
            )
            .order_by(FinancialData.date.asc())
            .all()
        )
    except Exception:
        records = []

    data = []
    total_profit = 0.0
    for r in records:
        revenue_net = float(r.revenue_net or 0)
        expenses = sum(
            float(getattr(r, c) or 0)
            for c in ["cost_ads_meta", "cost_ads_google", "cost_transaction_fees", "cost_fixed_allocated", "cost_variable"]
        )
        np = revenue_net - expenses
        total_profit += np

        row = DailyMetricRow(
            date=r.date,
            net_profit=round(np, 2),
            revenue_gross=round(float(r.revenue_gross or 0), 2),
            revenue_net=round(revenue_net, 2),
            cost_ads_meta=round(float(r.cost_ads_meta or 0), 2),
            cost_ads_google=round(float(r.cost_ads_google or 0), 2),
            cost_transaction_fees=round(float(r.cost_transaction_fees or 0), 2),
            cost_fixed_allocated=round(float(r.cost_fixed_allocated or 0), 2),
            cost_variable=round(float(r.cost_variable or 0), 2),
        )
        data.append(row)

    count = len(data)
    avg = round(total_profit / count, 2) if count > 0 else 0

    # Determine trend from first vs last half
    if count >= 2:
        mid = count // 2
        first_half_avg = sum(d.net_profit or 0 for d in data[:mid]) / mid
        second_half_avg = sum(d.net_profit or 0 for d in data[mid:]) / (count - mid)
        if second_half_avg > first_half_avg * 1.05:
            trend = "up"
        elif second_half_avg < first_half_avg * 0.95:
            trend = "down"
        else:
            trend = "flat"
    else:
        trend = "flat"

    return DailyMetricsResponse(
        data=data,
        summary=DailyMetricsSummary(
            total_profit=round(total_profit, 2),
            avg_daily_profit=avg,
            trend=trend,
        ),
    )
