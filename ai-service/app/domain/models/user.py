"""User models."""

from typing import Optional
from pydantic import BaseModel, EmailStr, Field, validator
from datetime import datetime

class UserBase(BaseModel):
    """Base user model with common attributes."""
    email: EmailStr = Field(..., description="User's email address")
    full_name: str = Field(..., min_length=2, description="User's full name")

    @validator('full_name')
    def validate_full_name(cls, v):
        if not v or len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v.strip()

class UserCreate(UserBase):
    """Model for creating a new user."""
    password: str = Field(
        ...,
        min_length=8,
        description="User's password (min 8 chars, 1 uppercase, 1 number)"
    )

    @validator('password')
    def validate_password(cls, v):
        if not v or len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one number")
        return v

class UserUpdate(BaseModel):
    """Model for updating user information."""
    full_name: Optional[str] = Field(None, min_length=2)
    password: Optional[str] = Field(None, min_length=8)

    @validator('full_name')
    def validate_full_name(cls, v):
        if v and len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v.strip() if v else v

    @validator('password')
    def validate_password(cls, v):
        if v:
            if len(v) < 8:
                raise ValueError("Password must be at least 8 characters")
            if not any(c.isupper() for c in v):
                raise ValueError("Password must contain at least one uppercase letter")
            if not any(c.isdigit() for c in v):
                raise ValueError("Password must contain at least one number")
        return v

class UserInDB(UserBase):
    """Model for user data stored in database."""
    id: str = Field(..., description="User's unique identifier")
    hashed_password: str
    created_at: datetime
    updated_at: datetime
    is_active: bool = True
    is_verified: bool = False
    last_login: Optional[datetime] = None
    last_logout: Optional[datetime] = None
    failed_login_attempts: int = 0

    class Config:
        from_attributes = True

class User(UserInDB):
    """Main user model for application use."""
    class Config:
        from_attributes = True

class UserResponse(UserBase):
    """Model for user data in responses."""
    id: str = Field(..., description="User's unique identifier")
    created_at: datetime
    updated_at: datetime
    is_active: bool
    is_verified: bool

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": "550e8400-e29b-41d4-a716-446655440000",
                "email": "user@example.com",
                "full_name": "John Doe",
                "created_at": "2024-01-20T12:34:56.789Z",
                "updated_at": "2024-01-20T12:34:56.789Z",
                "is_active": True,
                "is_verified": False
            }
        } 