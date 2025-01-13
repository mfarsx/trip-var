"""User domain models for authentication and user management."""

from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional

class UserBase(BaseModel):
    """Base user model with common attributes."""
    email: EmailStr = Field(
        ..., 
        description="User's email address for authentication and communication"
    )
    full_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="User's full name (optional)"
    )

    @field_validator('full_name')
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        """Validate full name format if provided."""
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Full name must be at least 2 characters long")
        return v.strip() if v else None

class UserCreate(UserBase):
    """Model for user registration requests."""
    password: str = Field(
        ...,
        min_length=8,
        max_length=100,
        description="User's password (min 8 chars)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "password": "SecurePass123!"
            }
        }

class UserUpdate(UserBase):
    """Model for user profile update requests."""
    password: Optional[str] = Field(
        None,
        min_length=8,
        max_length=100,
        description="New password (optional)"
    )
    is_active: Optional[bool] = Field(
        None,
        description="User account status"
    )
    is_verified: Optional[bool] = Field(
        None,
        description="Email verification status"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe Updated",
                "password": "NewSecurePass123!",
                "is_active": True
            }
        }

class UserInDB(UserBase):
    """Internal user model with database-specific fields."""
    id: str = Field(..., description="Unique user identifier")
    hashed_password: str = Field(..., description="Securely hashed password")
    is_active: bool = Field(default=True, description="Account status")
    is_verified: bool = Field(default=False, description="Email verification status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class User(UserBase):
    """Public user model for API responses."""
    id: str = Field(..., description="Unique user identifier")
    is_active: bool = Field(default=True, description="Account status")
    is_verified: bool = Field(default=False, description="Email verification status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    """Standardized user response model."""
    id: str = Field(..., description="Unique user identifier")
    email: EmailStr = Field(..., description="User email address")
    full_name: Optional[str] = Field(None, description="User's full name")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    is_active: bool = Field(..., description="Account status")
    is_verified: bool = Field(..., description="Email verification status")

    @classmethod
    def from_user(cls, user: User) -> "UserResponse":
        """Create a response model from a User instance."""
        return cls(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            created_at=user.created_at,
            updated_at=user.updated_at,
            is_active=user.is_active,
            is_verified=user.is_verified
        )

    class Config:
        json_schema_extra = {
            "example": {
                "id": "user123",
                "email": "user@example.com",
                "full_name": "John Doe",
                "created_at": "2024-01-01T00:00:00Z",
                "updated_at": "2024-01-01T00:00:00Z",
                "is_active": True,
                "is_verified": True
            }
        } 