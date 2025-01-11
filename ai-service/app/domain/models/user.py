"""User related models."""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional

# Base Models
class UserBase(BaseModel):
    """Base user model."""
    email: EmailStr = Field(..., description="User email address")
    full_name: Optional[str] = Field(None, description="User's full name")

# Request Models
class UserCreate(UserBase):
    """User creation model."""
    password: str = Field(..., min_length=8, description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "full_name": "John Doe",
                "password": "strongpassword123"
            }
        }

class UserUpdate(UserBase):
    """User update model."""
    password: Optional[str] = Field(None, min_length=8, description="New password")
    is_active: Optional[bool] = Field(None, description="User active status")
    is_verified: Optional[bool] = Field(None, description="User verification status")

    class Config:
        json_schema_extra = {
            "example": {
                "full_name": "John Doe Updated",
                "password": "newpassword123",
                "is_active": True
            }
        }

# Database Models
class UserInDB(UserBase):
    """Database user model."""
    id: str = Field(..., description="User ID")
    hashed_password: str = Field(..., description="Hashed password")
    is_active: bool = Field(default=True, description="User active status")
    is_verified: bool = Field(default=False, description="User verification status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

# API Models
class User(UserBase):
    """API user model."""
    id: str = Field(..., description="User ID")
    is_active: bool = Field(default=True, description="User active status")
    is_verified: bool = Field(default=False, description="User verification status")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")

    class Config:
        from_attributes = True

class UserResponse(BaseModel):
    """User response model."""
    id: str = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email address")
    full_name: Optional[str] = Field(None, description="User's full name")
    created_at: datetime = Field(..., description="Account creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    is_active: bool = Field(..., description="User active status")
    is_verified: bool = Field(..., description="User verification status")

    @classmethod
    def from_user(cls, user: User) -> "UserResponse":
        """Create UserResponse from User model."""
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
                "id": "123",
                "email": "user@example.com",
                "full_name": "John Doe",
                "created_at": "2024-01-10T00:00:00Z",
                "updated_at": "2024-01-10T00:00:00Z",
                "is_active": True,
                "is_verified": False
            }
        } 