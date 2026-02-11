import asyncio
from typing import Any
from celery import shared_task
from sqlalchemy.orm import Session
from datetime import date, timedelta
import random

from app.core.database import SessionLocal
from app.models.financial_data import FinancialData
from app.models.integration import Integration
from app.models.user import User

@shared_task
def ingest_financial_data(user_id: str, integration_id: str) -> str:
    """
    Simulates fetching data from an integration (e.g. Stripe via Airbyte) 
    and aggregating it into the FinancialData fact table.
    """
    db: Session = SessionLocal()
    try:
        # 1. Fetch Integration
        integration = db.query(Integration).filter(Integration.id == integration_id).first()
        if not integration:
            return "Integration not found"

        # 2. Simulate fetching raw data (e.g. from Airbyte destination or API)
        # For MVP, we generate mock daily data for the last 30 days
        
        start_date = date.today() - timedelta(days=30)
        records_processed = 0
        
        for i in range(31):
            current_date = start_date + timedelta(days=i)
            
            # Check if record exists
            fin_record = db.query(FinancialData).filter(
                FinancialData.user_id == user_id, 
                FinancialData.date == current_date
            ).first()
            
            if not fin_record:
                fin_record = FinancialData(
                    user_id=user_id,
                    date=current_date
                )
                db.add(fin_record)
            
            # Update with "fresh" data from "Stripe"
            # Randomize slightly to make charts look real
            daily_revenue = random.uniform(500, 2000)
            daily_ads = random.uniform(50, 300)
            
            fin_record.revenue_gross = daily_revenue
            fin_record.revenue_net = daily_revenue * 0.95 # minus fees
            fin_record.cost_ads_meta = daily_ads
            fin_record.transactions_count = int(daily_revenue / 50)
            
            records_processed += 1
        
        db.commit()
        return f"Successfully processed {records_processed} days of data for User {user_id}"
        
    except Exception as e:
        db.rollback()
        return f"Error processing data: {str(e)}"
    finally:
        db.close()
