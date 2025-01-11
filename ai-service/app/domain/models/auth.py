"""Authentication related models."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from app.domain.models.user import UserResponse

# Request Models
class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="User password")

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "strongpassword123"
            }
        }

# Response Models
class Token(BaseModel):
    """JWT token model."""
    access_token: str
    token_type: str = Field(default="bearer", description="Token type")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer"
            }
        }

class LoginResponse(BaseModel):
    """Login response model."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(..., description="Token type")
    user: UserResponse = Field(..., description="User information")

    class Config:
        json_schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "user": {
                    "id": "123",
                    "email": "user@example.com",
                    "full_name": "John Doe",
                    "created_at": "2024-01-10T00:00:00Z",
                    "updated_at": "2024-01-10T00:00:00Z",
                    "is_active": True,
                    "is_verified": False
                }
            }
        }

class TokenVerifyResponse(BaseModel):
    """Token verification response model."""
    is_valid: bool = Field(..., description="Token validity status")
    user: Optional[UserResponse] = Field(None, description="User information if token is valid")

    class Config:
        json_schema_extra = {
            "example": {
                "is_valid": True,
                "user": {
                    "id": "123",
                    "email": "user@example.com",
                    "full_name": "John Doe",
                    "created_at": "2024-01-10T00:00:00Z",
                    "updated_at": "2024-01-10T00:00:00Z",
                    "is_active": True,
                    "is_verified": False
                }
            }
        }

class LogoutResponse(BaseModel):
    """Logout response model."""
    message: str = Field(..., description="Logout status message")
    status: str = Field(..., description="Operation status")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Successfully logged out",
                "status": "success"
            }
        }

# Internal Models
class TokenPayload(BaseModel):
    """JWT token payload model."""
    sub: str = Field(..., description="Subject (user ID)")
    exp: Optional[int] = Field(None, description="Expiration timestamp")

# Error Models
class ErrorResponse(BaseModel):
    """Generic error response model."""
    detail: str = Field(..., description="Error message")

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "An error occurred"
            }
        }

class ValidationErrorResponse(BaseModel):
    """Validation error response model."""
    detail: list[dict] = Field(..., description="List of validation errors")

    class Config:
        json_schema_extra = {
            "example": {
                "detail": [
                    {
                        "loc": ["body", "email"],
                        "msg": "field required",
                        "type": "value_error.missing"
                    }
                ]
            }
        } 