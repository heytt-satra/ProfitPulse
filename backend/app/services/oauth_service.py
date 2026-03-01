from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
import base64
import hashlib
import hmac
import secrets
from collections.abc import Mapping
from typing import Any, Optional
from urllib.parse import urlencode
import uuid

import httpx
from jose import JWTError, jwt

from app.core.config import settings


@dataclass
class OAuthProviderConfig:
    provider: str
    client_id: str
    client_secret: str
    auth_url: str
    token_url: str
    scopes: str


@dataclass
class OAuthTokenResult:
    access_token: str
    refresh_token: Optional[str]
    expires_at: Optional[datetime]
    account_id: Optional[str]
    raw: dict[str, Any]


SUPPORTED_PROVIDER_CONFIGS = {
    "stripe": {
        "auth_url": "https://connect.stripe.com/oauth/authorize",
        "token_url": "https://connect.stripe.com/oauth/token",
        "scopes": "read_write",
    },
    "meta": {
        "auth_url": "https://www.facebook.com/v19.0/dialog/oauth",
        "token_url": "https://graph.facebook.com/v19.0/oauth/access_token",
        "scopes": "ads_read,business_management",
    },
    "google_ads": {
        "auth_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scopes": "https://www.googleapis.com/auth/adwords",
    },
    # Shopify auth/token URL is shop-domain specific and composed dynamically.
    "shopify": {
        "auth_url": "",
        "token_url": "",
        "scopes": "read_orders,read_products,read_analytics",
    },
}


def _get_client_credentials(provider: str) -> tuple[str, str]:
    if provider == "stripe":
        return settings.STRIPE_CLIENT_ID or "", settings.STRIPE_CLIENT_SECRET or ""
    if provider == "meta":
        return settings.META_CLIENT_ID or "", settings.META_CLIENT_SECRET or ""
    if provider == "google_ads":
        return settings.GOOGLE_CLIENT_ID or "", settings.GOOGLE_CLIENT_SECRET or ""
    if provider == "shopify":
        return settings.SHOPIFY_CLIENT_ID or "", settings.SHOPIFY_CLIENT_SECRET or ""
    return "", ""


def _ensure_provider(provider: str) -> str:
    key = provider.lower()
    if key not in SUPPORTED_PROVIDER_CONFIGS:
        raise ValueError(f"Unsupported provider: {provider}")
    return key


def _normalize_shop_domain(shop_domain: Optional[str]) -> str:
    if not shop_domain:
        raise ValueError("shop_domain is required for Shopify OAuth.")
    domain = shop_domain.strip().lower()
    if domain.startswith("https://"):
        domain = domain[len("https://") :]
    if domain.startswith("http://"):
        domain = domain[len("http://") :]
    domain = domain.split("/")[0]
    if not domain.endswith(".myshopify.com"):
        raise ValueError("Shopify shop_domain must end with .myshopify.com")
    return domain


def build_provider_config(provider: str, shop_domain: Optional[str] = None) -> OAuthProviderConfig:
    provider_key = _ensure_provider(provider)
    client_id, client_secret = _get_client_credentials(provider_key)
    if not client_id or not client_secret:
        raise ValueError(f"Missing OAuth credentials for provider: {provider_key}")

    config_data = SUPPORTED_PROVIDER_CONFIGS[provider_key]
    auth_url = config_data["auth_url"]
    token_url = config_data["token_url"]
    if provider_key == "shopify":
        domain = _normalize_shop_domain(shop_domain)
        auth_url = f"https://{domain}/admin/oauth/authorize"
        token_url = f"https://{domain}/admin/oauth/access_token"

    return OAuthProviderConfig(
        provider=provider_key,
        client_id=client_id,
        client_secret=client_secret,
        auth_url=auth_url,
        token_url=token_url,
        scopes=config_data["scopes"],
    )


def build_redirect_uri(provider: str) -> str:
    base = settings.OAUTH_CALLBACK_BASE_URL.rstrip("/")
    return f"{base}/{provider}/oauth/callback"


def generate_oauth_state(integration_id: uuid.UUID, workspace_id: uuid.UUID, provider: str) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(integration_id),
        "workspace_id": str(workspace_id),
        "provider": provider,
        "nonce": secrets.token_urlsafe(16),
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(minutes=15)).timestamp()),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def decode_oauth_state(state_token: str, provider: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(state_token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except JWTError as exc:
        raise ValueError("Invalid OAuth state token.") from exc

    if payload.get("provider") != provider:
        raise ValueError("OAuth state provider mismatch.")
    if not payload.get("sub") or not payload.get("workspace_id"):
        raise ValueError("OAuth state token is missing required claims.")
    return payload


def build_authorization_url(provider: str, state_token: str, shop_domain: Optional[str] = None) -> str:
    config = build_provider_config(provider, shop_domain=shop_domain)
    redirect_uri = build_redirect_uri(config.provider)

    if config.provider == "stripe":
        params = {
            "response_type": "code",
            "client_id": config.client_id,
            "scope": config.scopes,
            "state": state_token,
            "redirect_uri": redirect_uri,
        }
    elif config.provider == "meta":
        params = {
            "client_id": config.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": config.scopes,
            "state": state_token,
        }
    elif config.provider == "google_ads":
        params = {
            "client_id": config.client_id,
            "redirect_uri": redirect_uri,
            "response_type": "code",
            "scope": config.scopes,
            "access_type": "offline",
            "include_granted_scopes": "true",
            "prompt": "consent",
            "state": state_token,
        }
    else:  # shopify
        params = {
            "client_id": config.client_id,
            "scope": config.scopes,
            "redirect_uri": redirect_uri,
            "state": state_token,
        }

    return f"{config.auth_url}?{urlencode(params)}"


def _compute_expiry(token_payload: dict[str, Any]) -> Optional[datetime]:
    expires_in = token_payload.get("expires_in")
    if not expires_in:
        return None
    try:
        expires_seconds = int(expires_in)
    except (TypeError, ValueError):
        return None
    return datetime.now(timezone.utc) + timedelta(seconds=expires_seconds)


async def exchange_code_for_token(
    provider: str,
    code: str,
    shop_domain: Optional[str] = None,
) -> OAuthTokenResult:
    config = build_provider_config(provider, shop_domain=shop_domain)
    redirect_uri = build_redirect_uri(config.provider)

    if config.provider == "stripe":
        payload = {
            "grant_type": "authorization_code",
            "code": code,
            "client_secret": config.client_secret,
            "client_id": config.client_id,
        }
    elif config.provider == "meta":
        payload = {
            "client_id": config.client_id,
            "client_secret": config.client_secret,
            "redirect_uri": redirect_uri,
            "code": code,
        }
    elif config.provider == "google_ads":
        payload = {
            "code": code,
            "client_id": config.client_id,
            "client_secret": config.client_secret,
            "redirect_uri": redirect_uri,
            "grant_type": "authorization_code",
        }
    else:  # shopify
        payload = {
            "client_id": config.client_id,
            "client_secret": config.client_secret,
            "code": code,
        }

    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.post(config.token_url, data=payload)
    if response.status_code >= 300:
        raise ValueError(f"OAuth token exchange failed with status {response.status_code}: {response.text}")

    body = response.json()
    access_token = body.get("access_token")
    if not access_token:
        raise ValueError("OAuth token exchange did not return access_token.")

    account_id = None
    if config.provider == "stripe":
        account_id = body.get("stripe_user_id")
    elif config.provider == "shopify":
        account_id = _normalize_shop_domain(shop_domain)
    elif config.provider == "google_ads":
        account_id = body.get("id_token")
    elif config.provider == "meta":
        account_id = body.get("user_id")

    return OAuthTokenResult(
        access_token=access_token,
        refresh_token=body.get("refresh_token"),
        expires_at=_compute_expiry(body),
        account_id=account_id,
        raw=body,
    )


def verify_stripe_webhook_signature(payload: bytes, signature_header: str, secret: str, tolerance_seconds: int = 300) -> bool:
    # Header format: t=timestamp,v1=signature
    parts = {}
    for chunk in signature_header.split(","):
        if "=" in chunk:
            key, value = chunk.split("=", 1)
            parts[key.strip()] = value.strip()

    timestamp = parts.get("t")
    signature = parts.get("v1")
    if not timestamp or not signature:
        return False

    try:
        ts_int = int(timestamp)
    except ValueError:
        return False

    now = int(datetime.now(timezone.utc).timestamp())
    if abs(now - ts_int) > tolerance_seconds:
        return False

    signed_payload = f"{timestamp}.".encode("utf-8") + payload
    computed = hmac.new(secret.encode("utf-8"), signed_payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(computed, signature)


def verify_shopify_webhook_signature(payload: bytes, signature_header: str, secret: str) -> bool:
    digest = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).digest()
    computed_b64 = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(computed_b64, signature_header)


def verify_shopify_oauth_callback_signature(query_params: Mapping[str, str], client_secret: str) -> bool:
    provided_hmac = query_params.get("hmac")
    if not provided_hmac:
        return False

    filtered = {
        key: value
        for key, value in query_params.items()
        if key not in {"hmac", "signature"}
    }
    encoded_pairs = [f"{key}={value}" for key, value in sorted(filtered.items())]
    message = "&".join(encoded_pairs)

    computed_hmac = hmac.new(
        client_secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(computed_hmac, provided_hmac)
