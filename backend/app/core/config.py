from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "ProfitPulse"
    API_V1_STR: str = "/api/v1"
    APP_ENV: str = "development"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    # Database
    DATABASE_URL: str
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DEV_BYPASS_AUTH: bool = False
    
    # External Services
    GEMINI_API_KEY: str | None = None
    OPENAI_API_KEY: str | None = None
    OPENAI_MODEL: str = "gpt-4o-mini"
    REDIS_URL: str = "redis://localhost:6379/0"
    OAUTH_CALLBACK_BASE_URL: str = "http://localhost:8000/api/v1/integrations"

    # OAuth provider credentials
    STRIPE_CLIENT_ID: str | None = None
    STRIPE_CLIENT_SECRET: str | None = None
    META_CLIENT_ID: str | None = None
    META_CLIENT_SECRET: str | None = None
    GOOGLE_CLIENT_ID: str | None = None
    GOOGLE_CLIENT_SECRET: str | None = None
    SHOPIFY_CLIENT_ID: str | None = None
    SHOPIFY_CLIENT_SECRET: str | None = None

    # Webhook verification secrets
    STRIPE_WEBHOOK_SECRET: str | None = None
    SHOPIFY_WEBHOOK_SECRET: str | None = None

    # Airbyte orchestration
    AIRBYTE_URL: str = "http://localhost:8001/api/v1"
    AIRBYTE_USERNAME: str = "airbyte"
    AIRBYTE_PASSWORD: str = "password"
    AIRBYTE_WORKSPACE_ID: str | None = None
    AIRBYTE_DESTINATION_ID: str | None = None
    
    # Supabase (Optional if using Supabase Auth directly)
    SUPABASE_URL: str | None = None
    SUPABASE_KEY: str | None = None
    SUPABASE_ANON_KEY: str | None = None
    SUPABASE_SERVICE_ROLE_KEY: str | None = None
    
    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
