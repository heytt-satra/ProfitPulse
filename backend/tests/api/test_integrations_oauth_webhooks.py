import base64
from datetime import datetime, timedelta, timezone
import hashlib
import hmac
from typing import Any
from urllib.parse import parse_qs, urlparse
import uuid

from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.api import deps
from app.api.v1.endpoints import integrations as integrations_endpoint
from app.core.config import settings
from app.core.database import Base
from app.main import app
from app.models.integration import Integration
from app.models.organization import Organization
from app.models.user import User
from app.models.workspace import Workspace
from app.models.workspace_membership import WorkspaceMembership
from app.services.oauth_service import OAuthTokenResult, generate_oauth_state


def _set_provider_credentials(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setattr(settings, "STRIPE_CLIENT_ID", "stripe-client-id")
    monkeypatch.setattr(settings, "STRIPE_CLIENT_SECRET", "stripe-client-secret")
    monkeypatch.setattr(settings, "META_CLIENT_ID", "meta-client-id")
    monkeypatch.setattr(settings, "META_CLIENT_SECRET", "meta-client-secret")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "google-client-id")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "google-client-secret")
    monkeypatch.setattr(settings, "SHOPIFY_CLIENT_ID", "shopify-client-id")
    monkeypatch.setattr(settings, "SHOPIFY_CLIENT_SECRET", "shopify-client-secret")


@pytest.fixture()
def integration_test_context(monkeypatch: pytest.MonkeyPatch):
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    db: Session = TestingSessionLocal()
    user = User(
        id=uuid.uuid4(),
        email="owner@example.com",
        hashed_password="x",
        full_name="Owner User",
        company_name="ProfitPulse",
    )
    db.add(user)
    db.flush()

    org = Organization(
        id=uuid.uuid4(),
        name="Test Org",
        owner_user_id=user.id,
    )
    db.add(org)
    db.flush()

    workspace = Workspace(
        id=uuid.uuid4(),
        organization_id=org.id,
        name="Test Workspace",
        slug="test-workspace",
    )
    db.add(workspace)
    db.flush()

    membership = WorkspaceMembership(
        id=uuid.uuid4(),
        workspace_id=workspace.id,
        user_id=user.id,
        role="owner",
    )
    db.add(membership)
    db.commit()
    db.refresh(workspace)
    db.refresh(membership)

    context = deps.WorkspaceContext(
        workspace=workspace,
        membership=membership,
        role="owner",
    )

    def override_get_db():
        local_db = TestingSessionLocal()
        try:
            yield local_db
        finally:
            local_db.close()

    app.dependency_overrides[deps.get_db] = override_get_db
    app.dependency_overrides[deps.get_workspace_context] = lambda: context

    with TestClient(app) as client:
        yield {
            "client": client,
            "session_factory": TestingSessionLocal,
            "workspace_id": workspace.id,
            "user_id": user.id,
        }

    app.dependency_overrides.clear()
    db.close()
    Base.metadata.drop_all(bind=engine)
    engine.dispose()


async def _fake_exchange_code_for_token(
    provider: str,
    code: str,
    shop_domain: str | None = None,
) -> OAuthTokenResult:
    return OAuthTokenResult(
        access_token=f"{provider}-access-token-{code}",
        refresh_token=f"{provider}-refresh-token-{code}",
        expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        account_id=shop_domain or f"{provider}-account",
        raw={
            "access_token": "should-not-be-persisted",
            "refresh_token": "should-not-be-persisted",
            "expires_in": 3600,
            "token_type": "bearer",
        },
    )


@pytest.mark.parametrize(
    "provider,shop_domain",
    [
        ("stripe", None),
        ("meta", None),
        ("google_ads", None),
        ("shopify", "demo-store.myshopify.com"),
    ],
)
def test_oauth_start_and_callback_smoke_for_each_provider(
    integration_test_context: dict[str, Any],
    monkeypatch: pytest.MonkeyPatch,
    provider: str,
    shop_domain: str | None,
):
    _set_provider_credentials(monkeypatch)
    monkeypatch.setattr(integrations_endpoint, "exchange_code_for_token", _fake_exchange_code_for_token)

    client: TestClient = integration_test_context["client"]
    session_factory = integration_test_context["session_factory"]
    workspace_id = integration_test_context["workspace_id"]
    redirect_uri = "http://localhost:3000/dashboard/onboarding"

    start_payload: dict[str, Any] = {"redirect_uri": redirect_uri}
    if shop_domain:
        start_payload["shop_domain"] = shop_domain

    start_response = client.post(f"/api/v1/integrations/{provider}/oauth/start", json=start_payload)
    assert start_response.status_code == 200
    data = start_response.json()
    assert data["provider"] == provider
    assert data["status"] == "oauth_pending"
    assert "auth_url" in data
    integration_id = uuid.UUID(data["integration_id"])

    with session_factory() as db:
        integration = db.query(Integration).filter(Integration.id == integration_id).first()
        assert integration is not None
        assert integration.workspace_id == workspace_id

        state_token = generate_oauth_state(
            integration_id=integration.id,
            workspace_id=workspace_id,
            provider=provider,
        )
        metadata = dict(integration.metadata_config or {})
        metadata["oauth_state_hash"] = integrations_endpoint._hash_state(state_token)
        if shop_domain:
            metadata["shop_domain"] = shop_domain
        integration.metadata_config = metadata
        db.commit()

    callback_params: dict[str, str] = {
        "state": state_token,
        "code": "callback-code",
    }
    if shop_domain:
        callback_params["shop"] = shop_domain
        callback_params["timestamp"] = "1700000000"
        shopify_sign_payload = "&".join(f"{k}={v}" for k, v in sorted(callback_params.items()))
        callback_params["hmac"] = hmac.new(
            settings.SHOPIFY_CLIENT_SECRET.encode("utf-8"),
            shopify_sign_payload.encode("utf-8"),
            hashlib.sha256,
        ).hexdigest()

    callback_response = client.get(
        f"/api/v1/integrations/{provider}/oauth/callback",
        params=callback_params,
        follow_redirects=False,
    )
    assert callback_response.status_code == 307
    location = callback_response.headers.get("location", "")
    query = parse_qs(urlparse(location).query)
    assert query["oauth_provider"][0] == provider
    assert query["oauth_status"][0] == "active"
    assert query["integration_id"][0] == str(integration_id)

    with session_factory() as db:
        updated = db.query(Integration).filter(Integration.id == integration_id).first()
        assert updated is not None
        assert updated.status == "active"
        assert updated.access_token is not None
        token_payload = (updated.metadata_config or {}).get("oauth_token_response") or {}
        assert "access_token" not in token_payload
        assert "refresh_token" not in token_payload


def test_oauth_callback_provider_error_redirect(
    integration_test_context: dict[str, Any],
):
    client: TestClient = integration_test_context["client"]
    session_factory = integration_test_context["session_factory"]
    workspace_id = integration_test_context["workspace_id"]
    user_id = integration_test_context["user_id"]

    integration_id = uuid.uuid4()
    with session_factory() as db:
        integration = Integration(
            id=integration_id,
            workspace_id=workspace_id,
            user_id=user_id,
            platform="stripe",
            status="oauth_pending",
            metadata_config={"redirect_uri": "http://localhost:3000/dashboard/onboarding"},
        )
        db.add(integration)

        state_token = generate_oauth_state(
            integration_id=integration_id,
            workspace_id=workspace_id,
            provider="stripe",
        )
        integration.metadata_config = {
            **(integration.metadata_config or {}),
            "oauth_state_hash": integrations_endpoint._hash_state(state_token),
        }
        db.commit()

    response = client.get(
        "/api/v1/integrations/stripe/oauth/callback",
        params={"state": state_token, "error": "access_denied"},
        follow_redirects=False,
    )
    assert response.status_code == 307
    query = parse_qs(urlparse(response.headers["location"]).query)
    assert query["oauth_provider"][0] == "stripe"
    assert query["oauth_status"][0] == "oauth_error"
    assert query["oauth_error"][0] == "provider_error"


def test_stripe_webhook_signature_validation(
    integration_test_context: dict[str, Any],
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(settings, "STRIPE_WEBHOOK_SECRET", "whsec_test_value")
    client: TestClient = integration_test_context["client"]
    payload = b'{"type":"account.updated"}'

    invalid_response = client.post(
        "/api/v1/integrations/webhooks/stripe",
        data=payload,
        headers={"Stripe-Signature": "t=1700000000,v1=deadbeef"},
    )
    assert invalid_response.status_code == 400
    assert "Invalid Stripe webhook signature" in invalid_response.text

    timestamp = str(int(datetime.now(timezone.utc).timestamp()))
    signed_payload = f"{timestamp}.".encode("utf-8") + payload
    signature = hmac.new(settings.STRIPE_WEBHOOK_SECRET.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    valid_response = client.post(
        "/api/v1/integrations/webhooks/stripe",
        data=payload,
        headers={
            "Stripe-Signature": f"t={timestamp},v1={signature}",
            "Content-Type": "application/json",
        },
    )
    assert valid_response.status_code == 200
    body = valid_response.json()
    assert body["received"] is True


def test_shopify_webhook_signature_validation(
    integration_test_context: dict[str, Any],
    monkeypatch: pytest.MonkeyPatch,
):
    monkeypatch.setattr(settings, "SHOPIFY_WEBHOOK_SECRET", "shopify_test_secret")
    client: TestClient = integration_test_context["client"]
    payload = b'{"id":123}'

    invalid_response = client.post(
        "/api/v1/integrations/webhooks/shopify",
        data=payload,
        headers={"X-Shopify-Hmac-Sha256": "invalid"},
    )
    assert invalid_response.status_code == 400
    assert "Invalid Shopify webhook signature" in invalid_response.text

    digest = hmac.new(settings.SHOPIFY_WEBHOOK_SECRET.encode("utf-8"), payload, hashlib.sha256).digest()
    signature = base64.b64encode(digest).decode("utf-8")
    valid_response = client.post(
        "/api/v1/integrations/webhooks/shopify",
        data=payload,
        headers={
            "X-Shopify-Hmac-Sha256": signature,
            "X-Shopify-Shop-Domain": "demo-store.myshopify.com",
            "Content-Type": "application/json",
        },
    )
    assert valid_response.status_code == 200
    body = valid_response.json()
    assert body["received"] is True
