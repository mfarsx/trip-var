"""Authentication endpoints with rate limiting and enhanced security."""

from typing import Annotated

from fastapi import APIRouter, Depends, Form, Header, HTTPException, Request, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel, EmailStr, Field, validator

from app.core.config import get_settings
from app.core.dependencies import get_current_user, oauth2_scheme
from app.core.rate_limit import rate_limiter
from app.core.security import validate_password
from app.domain.models import (
    DataResponse,
    LoginResponse,
    Token,
    UserCreate,
    UserResponse,
)
from app.domain.services.auth import auth_service

settings = get_settings()
router = APIRouter()


class LoginRequest(BaseModel):
    """Login request model with email validation."""

    email: EmailStr
    password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {"email": "user@example.com", "password": "strongpassword123"}
        }


class RefreshRequest(BaseModel):
    """Token refresh request model."""

    refresh_token: str

    class Config:
        json_schema_extra = {
            "example": {"refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."}
        }


class PasswordResetRequest(BaseModel):
    """Password reset request model."""

    email: EmailStr

    class Config:
        json_schema_extra = {"example": {"email": "user@example.com"}}


class PasswordResetConfirm(BaseModel):
    """Password reset confirmation model."""

    token: str
    new_password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "token": "reset-token-123",
                "new_password": "newStrongPassword123",
            }
        }


class ChangePasswordRequest(BaseModel):
    """Change password request model."""

    current_password: str
    new_password: str = Field(..., min_length=8)

    class Config:
        json_schema_extra = {
            "example": {
                "current_password": "oldPassword123",
                "new_password": "newStrongPassword123",
            }
        }


class EmailPasswordForm:
    """Custom form for email-based login."""

    def __init__(self, email: Annotated[str, Form()], password: Annotated[str, Form()]):
        self.email = email
        self.password = password


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "User successfully created"},
        400: {"description": "Invalid input or email already exists"},
        422: {"description": "Password validation failed"},
        429: {"description": "Too many requests"},
    },
)
@rate_limiter(max_requests=5, window_seconds=300)  # 5 requests per 5 minutes
async def register(request: Request, user_data: UserCreate) -> UserResponse:
    """Register a new user."""
    try:
        validate_password(user_data.password)
        user = await auth_service.register_user(user_data)
        # Send verification email
        await auth_service.send_verification_email(user.email)
        return user
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.post(
    "/verify-email/{token}",
    response_model=DataResponse[None],
    responses={
        200: {"description": "Email successfully verified"},
        400: {"description": "Invalid or expired token"},
    },
)
@rate_limiter(max_requests=5, window_seconds=300)
async def verify_email(token: str) -> DataResponse[None]:
    """Verify user's email address."""
    try:
        await auth_service.verify_email(token)
        return DataResponse(
            success=True, message="Email successfully verified", data=None
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/login",
    response_model=LoginResponse,
    responses={
        200: {"description": "Successfully authenticated"},
        401: {"description": "Invalid credentials"},
        403: {"description": "Email not verified"},
        429: {"description": "Too many requests"},
    },
)
@rate_limiter(max_requests=10, window_seconds=300)
async def login(request: Request, login_data: LoginRequest) -> LoginResponse:
    """Authenticate user and return tokens."""
    try:
        result = await auth_service.authenticate_user(
            email=login_data.email, password=login_data.password
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post(
    "/refresh",
    response_model=Token,
    responses={
        200: {"description": "Token successfully refreshed"},
        401: {"description": "Invalid or expired refresh token"},
    },
)
@rate_limiter(max_requests=20, window_seconds=300)
async def refresh_token(
    request: Request,
    refresh_data: RefreshRequest,
    current_token: Annotated[str, Depends(oauth2_scheme)],
) -> Token:
    """Refresh access token using refresh token."""
    try:
        new_token = await auth_service.refresh_token(
            refresh_token=refresh_data.refresh_token, current_token=current_token
        )
        return new_token
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


@router.post(
    "/forgot-password",
    response_model=DataResponse[None],
    responses={
        200: {"description": "Password reset email sent"},
        400: {"description": "Invalid email"},
        429: {"description": "Too many requests"},
    },
)
@rate_limiter(max_requests=5, window_seconds=3600)  # 5 requests per hour
async def forgot_password(
    request: Request, reset_data: PasswordResetRequest
) -> DataResponse[None]:
    """Request password reset email."""
    try:
        await auth_service.send_password_reset_email(reset_data.email)
        return DataResponse(
            success=True,
            message="Password reset instructions sent to your email",
            data=None,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post(
    "/reset-password",
    response_model=DataResponse[None],
    responses={
        200: {"description": "Password successfully reset"},
        400: {"description": "Invalid or expired token"},
        422: {"description": "Password validation failed"},
    },
)
@rate_limiter(max_requests=5, window_seconds=300)
async def reset_password(
    request: Request, reset_data: PasswordResetConfirm
) -> DataResponse[None]:
    """Reset password using reset token."""
    try:
        validate_password(reset_data.new_password)
        await auth_service.reset_password(
            token=reset_data.token, new_password=reset_data.new_password
        )
        return DataResponse(
            success=True, message="Password successfully reset", data=None
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.post(
    "/change-password",
    response_model=DataResponse[None],
    responses={
        200: {"description": "Password successfully changed"},
        401: {"description": "Current password is incorrect"},
        422: {"description": "Password validation failed"},
    },
)
@rate_limiter(max_requests=5, window_seconds=300)
async def change_password(
    request: Request,
    password_data: ChangePasswordRequest,
    current_user: Annotated[UserResponse, Depends(get_current_user)],
) -> DataResponse[None]:
    """Change password for logged-in user."""
    try:
        validate_password(password_data.new_password)
        await auth_service.change_password(
            user_id=current_user.id,
            current_password=password_data.current_password,
            new_password=password_data.new_password,
        )
        return DataResponse(
            success=True, message="Password successfully changed", data=None
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(e)
        )


@router.get(
    "/me",
    response_model=UserResponse,
    responses={
        200: {"description": "Current user information"},
        401: {"description": "Not authenticated"},
    },
)
async def get_current_user_info(
    current_user: Annotated[UserResponse, Depends(get_current_user)]
) -> UserResponse:
    """Get current user information."""
    return current_user


@router.post(
    "/logout",
    response_model=DataResponse[None],
    responses={
        200: {"description": "Successfully logged out"},
        401: {"description": "Not authenticated"},
    },
)
async def logout(
    current_user: Annotated[UserResponse, Depends(get_current_user)],
    authorization: str = Header(...),
) -> DataResponse[None]:
    """Logout current user and invalidate the token."""
    try:
        token = authorization.split(" ")[1]
        await auth_service.invalidate_token(token)
        return DataResponse(success=True, message="Successfully logged out", data=None)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))
