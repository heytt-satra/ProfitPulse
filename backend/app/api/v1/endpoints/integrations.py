from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.models.user import User
from app.models.integration import Integration
from app.services.airbyte import airbyte_service

router = APIRouter()

@router.get("/", response_model=List[Any]) # Replace Any with Integration Schema
def list_integrations(
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Retrieve all integrations for the current user.
    """
    integrations = db.query(Integration).filter(Integration.user_id == current_user.id).all()
    # We should define an Integration Schema for response, but for now Any/dict is fine for MVP speed
    return integrations

@router.post("/connect/stripe")
async def connect_stripe(
    code: str, # OAuth code from frontend
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Connect Stripe account. 
    1. Authenticate with Stripe using `code` to get access_token.
    2. Create Integration record in DB.
    3. (Optional) Configure Airbyte Source for this Stripe account.
    """
    # TODO: Implement actual Stripe implementation exchange
    # stripe_response = stripe.OAuth.token(...)
    
    # Mocking successful connection
    mock_stripe_account_id = "acct_12345"
    mock_access_token = "sk_test_123"
    
    existing = db.query(Integration).filter(
        Integration.user_id == current_user.id, 
        Integration.platform == "stripe"
    ).first()
    
    if existing:
        existing.status = "active"
        existing.access_token = mock_access_token
        existing.account_id = mock_stripe_account_id
    else:
        new_integration = Integration(
            user_id=current_user.id,
            platform="stripe",
            access_token=mock_access_token,
            account_id=mock_stripe_account_id,
            status="active",
            metadata_config={"airbyte_source_id": None}
        )
        db.add(new_integration)
    
    db.commit()
    
    return {"status": "connected", "platform": "stripe"}

@router.post("/connect/meta")
async def connect_meta(
    code: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Connect Meta Ads account.
    """
    # Mocking successful connection
    mock_meta_account_id = "act_98765"
    mock_access_token = "EAAB..."
    
    existing = db.query(Integration).filter(
        Integration.user_id == current_user.id, 
        Integration.platform == "meta"
    ).first()
    
    if existing:
        existing.status = "active"
        existing.access_token = mock_access_token
        existing.account_id = mock_meta_account_id
    else:
        new_integration = Integration(
            user_id=current_user.id,
            platform="meta",
            access_token=mock_access_token,
            account_id=mock_meta_account_id,
            status="active",
            metadata_config={"airbyte_source_id": None}
        )
        db.add(new_integration)
    
    db.commit()
    
    return {"status": "connected", "platform": "meta"}

@router.post("/sync/{integration_id}")
async def trigger_sync(
    integration_id: str,
    db: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user),
) -> Any:
    """
    Manually trigger an Airbyte sync for the given integration.
    """
    # In real app, check if integration belongs to user
    # integration = db.query(Integration).get(integration_id) ...
    
    # Mock trigger
    return {"status": "sync_started", "job_id": "job_mock_999"}
