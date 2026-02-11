from typing import Optional, Any
from pydantic import BaseModel, EmailStr
from uuid import UUID

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    company_name: Optional[str] = None

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str

# Properties to return via API
class User(UserBase):
    id: UUID
    onboarding_completed: bool
    subscription_tier: str

    class Config:
        from_attributes = True
