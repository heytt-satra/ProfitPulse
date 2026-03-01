"""
Demo data seeder for ProfitPulse.
Seeds realistic financial data so the dashboard and AI analyst have data to display/query.
"""
import random
from datetime import date, timedelta
from sqlalchemy.orm import Session
from app.models.financial_data import FinancialData
from app.models.integration import Integration


def seed_demo_data(db: Session, user_id: str, workspace_id: str | None = None) -> dict:
    """
    Seed 30 days of realistic financial data for the given user.
    Returns a summary of what was created.
    """
    today = date.today()
    start_date = today - timedelta(days=30)
    
    # Check if data already exists
    existing = db.query(FinancialData).filter(
        FinancialData.user_id == user_id,
        FinancialData.workspace_id == workspace_id,
    ).count()
    
    if existing > 0:
        return {"status": "already_seeded", "rows": existing}
    
    rows_created = 0
    
    # Base values that will vary day to day for realism
    base_revenue = 2500  # ~$2500/day gross
    
    for day_offset in range(31):
        current_date = start_date + timedelta(days=day_offset)
        
        # Add some randomness and a slight upward trend
        trend_factor = 1 + (day_offset * 0.005)  # 0.5% daily growth
        daily_noise = random.uniform(0.7, 1.4)
        
        # Weekend dip
        if current_date.weekday() in (5, 6):
            daily_noise *= 0.6
        
        revenue_gross = round(base_revenue * trend_factor * daily_noise, 2)
        refunds = round(revenue_gross * random.uniform(0.01, 0.05), 2)
        disputes = round(revenue_gross * random.uniform(0, 0.01), 2)
        revenue_net = round(revenue_gross - refunds - disputes, 2)
        
        # Costs
        cost_ads_meta = round(random.uniform(150, 500) * daily_noise, 2)
        cost_ads_google = round(random.uniform(100, 350) * daily_noise, 2)
        cost_transaction_fees = round(revenue_gross * 0.029 + 0.30, 2)  # ~2.9% + $0.30 (Stripe-like)
        cost_fixed_allocated = round(random.uniform(80, 150), 2)
        cost_variable = round(random.uniform(50, 200) * daily_noise, 2)
        
        transactions_count = int(random.uniform(15, 80) * daily_noise)
        orders_count = int(transactions_count * random.uniform(0.7, 1.0))
        
        record = FinancialData(
            workspace_id=workspace_id,
            user_id=user_id,
            date=current_date,
            revenue_gross=revenue_gross,
            revenue_net=revenue_net,
            refunds=refunds,
            disputes=disputes,
            cost_ads_meta=cost_ads_meta,
            cost_ads_google=cost_ads_google,
            cost_transaction_fees=cost_transaction_fees,
            cost_fixed_allocated=cost_fixed_allocated,
            cost_variable=cost_variable,
            currency="USD",
            transactions_count=transactions_count,
            orders_count=orders_count,
        )
        db.add(record)
        rows_created += 1
    
    db.commit()
    return {"status": "seeded", "rows": rows_created, "date_range": f"{start_date} to {today}"}


def seed_integrations(db: Session, user_id: str, workspace_id: str | None = None) -> dict:
    """
    Create mock integration records for Stripe and Meta.
    """
    platforms = [
        {"platform": "stripe", "account_id": "acct_demo_12345", "access_token": "sk_test_demo"},
        {"platform": "meta", "account_id": "act_demo_98765", "access_token": "EAAB_demo_token"},
    ]
    
    created = []
    for p in platforms:
        existing = db.query(Integration).filter(
            Integration.user_id == user_id,
            Integration.workspace_id == workspace_id,
            Integration.platform == p["platform"],
        ).first()
        
        if existing:
            existing.status = "active"
            existing.access_token = p["access_token"]
            existing.account_id = p["account_id"]
            created.append({"platform": p["platform"], "action": "updated"})
        else:
            new_int = Integration(
                workspace_id=workspace_id,
                user_id=user_id,
                platform=p["platform"],
                access_token=p["access_token"],
                account_id=p["account_id"],
                status="active",
                metadata_config={"demo": True},
            )
            db.add(new_int)
            created.append({"platform": p["platform"], "action": "created"})
    
    db.commit()
    return {"integrations": created}
