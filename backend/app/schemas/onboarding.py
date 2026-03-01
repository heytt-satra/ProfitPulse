from pydantic import BaseModel


class OnboardingSteps(BaseModel):
    integrations_connected: bool
    currency_set: bool
    preferences_configured: bool


class OnboardingStatusResponse(BaseModel):
    completed: bool
    steps: OnboardingSteps


class OnboardingCompleteResponse(BaseModel):
    success: bool
