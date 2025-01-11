from fastapi import APIRouter, HTTPException, Depends, status, Request, Body
from fastapi.security import OAuth2PasswordBearer
from app.domain.models.user import UserCreate, UserResponse
from app.domain.models.auth import (
    LoginRequest,
    LoginResponse, 
    TokenVerifyResponse,
    LogoutResponse
)
from app.domain.services.auth import auth_service
from app.core.exceptions import ValidationError, DatabaseError, AuthenticationError
from app.core.dependencies import get_current_user
import logging
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter()
logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user: UserCreate):
    """Register a new user."""
    try:
        logger.info(f"Starting registration process for email: {user.email}")
        new_user, token = await auth_service.create_user(user)
        
        user_response = UserResponse.from_user(new_user)
        logger.info(f"Successfully registered user with email: {user.email}")
        
        return LoginResponse(
            access_token=token.access_token,
            token_type=token.token_type,
            user=user_response
        )
    except (ValidationError, DatabaseError, AuthenticationError) as e:
        raise e.to_http()
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration"
        )

@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(request: Request, login_data: LoginRequest = Body(...)):
    """Login endpoint that accepts JSON data."""
    try:
        user, token = await auth_service.login_user(
            email=login_data.email,
            password=login_data.password
        )
        
        return LoginResponse(
            access_token=token.access_token,
            token_type=token.token_type,
            user=UserResponse.from_user(user)
        )
    except (ValidationError, DatabaseError, AuthenticationError) as e:
        raise e.to_http()
    except Exception as e:
        logger.error(f"Login failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during login"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """Get current user information."""
    return UserResponse.from_user(current_user)

@router.get("/verify", response_model=TokenVerifyResponse)
@router.post("/verify", response_model=TokenVerifyResponse)
async def verify_access_token(token: str = Depends(get_current_user)):
    """Verify an access token and return the user information."""
    return TokenVerifyResponse(
        is_valid=True,
        user=UserResponse.from_user(token)
    )

@router.post("/logout", response_model=LogoutResponse)
async def logout(current_user = Depends(get_current_user)):
    """Logout current user."""
    try:
        await auth_service.logout_user(current_user.id)
        return LogoutResponse(
            message="Successfully logged out",
            status="success"
        )
    except (ValidationError, DatabaseError) as e:
        raise e.to_http()
    except Exception as e:
        logger.error(f"Logout failed: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during logout"
        ) 