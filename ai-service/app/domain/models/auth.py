"""Authentication related models."""

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.domain.models.user import UserResponse

class ErrorResponse(BaseModel):
    """Base error response model."""
    success: bool = False
    message: str
    errors: Optional[List[Dict[str, Any]]] = None
    code: Optional[str] = None
    status_code: Optional[int] = None

class ValidationErrorResponse(ErrorResponse):
    """Validation error response model."""
    code: str = "VALIDATION_ERROR"
    status_code: int = 400

class LoginRequest(BaseModel):
    """Login request model."""
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    """Login response model."""
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenVerifyResponse(BaseModel):
    """Response model for token verification."""
    is_valid: bool
    user: Optional[UserResponse] = None

class LogoutResponse(BaseModel):
    """Response model for logout."""
    message: str
    status: str

class TokenPayload(BaseModel):
    """JWT token payload model."""
    sub: str
    exp: datetime 