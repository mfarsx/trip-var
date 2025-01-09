from fastapi import APIRouter, HTTPException, Depends, status, Request, Body
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.domain.models.user import UserCreate, UserResponse
from app.domain.models.auth import (
    LoginResponse, 
    ErrorResponse, 
    ValidationErrorResponse,
    TokenPayload,
    TokenVerifyResponse,
    LogoutResponse
)
from app.domain.services.auth import auth_service
from app.core.security import create_access_token, verify_token
import logging
from typing import Annotated, Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from pydantic import BaseModel

router = APIRouter()
logger = logging.getLogger(__name__)
limiter = Limiter(key_func=get_remote_address)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    scheme_name="JWT"
)

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/register", response_model=LoginResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/minute")
async def register(request: Request, user: UserCreate):
    """Register a new user."""
    try:
        logger.info(f"Starting registration process for email: {user.email}")
        
        # Enhanced validation
        if not user.full_name or len(user.full_name.strip()) < 2:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Full name must be at least 2 characters"
            )
        
        # Enhanced email validation
        if not user.email or '@' not in user.email:
            logger.warning(f"Invalid email format attempted: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid email format"
            )
        
        # Enhanced password validation
        if not user.password or len(user.password) < 8:
            logger.warning("Password validation failed - too short")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must be at least 8 characters"
            )
            
        if not any(c.isupper() for c in user.password):
            logger.warning("Password validation failed - no uppercase")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one uppercase letter"
            )
            
        if not any(c.isdigit() for c in user.password):
            logger.warning("Password validation failed - no number")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password must contain at least one number"
            )

        # Check if user already exists
        existing_user = await auth_service.get_user_by_email(user.email)
        if existing_user:
            logger.warning(f"Registration attempted with existing email: {user.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
            
        # Create user
        result = await auth_service.create_user(user)
        logger.info(f"Successfully registered user with email: {user.email}")
        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during registration: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred during registration"
        )

@router.post("/login", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    login_data: LoginRequest = Body(None)
):
    """Login endpoint that accepts JSON data."""
    try:
        if not login_data:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Request body is required"
            )

        # Authenticate user
        user = await auth_service.authenticate_user(login_data.email, login_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token = create_access_token(user.id)
        
        # Convert to UserResponse
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            created_at=user.created_at,
            updated_at=user.updated_at,
            is_active=user.is_active,
            is_verified=user.is_verified
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/login/form", response_model=LoginResponse)
@limiter.limit("5/minute")
async def login_form(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """Login endpoint that accepts form data."""
    try:
        # Authenticate user
        user = await auth_service.authenticate_user(form_data.username, form_data.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Create access token
        access_token = create_access_token(user.id)
        
        # Convert to UserResponse
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            created_at=user.created_at,
            updated_at=user.updated_at,
            is_active=user.is_active,
            is_verified=user.is_verified
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user(token: str = Depends(oauth2_scheme)):
    """Get current user information."""
    try:
        user = await auth_service.get_current_user(token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token or user not found"
            )
        return user
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error while fetching user data"
        ) 

@router.get("/verify", response_model=TokenVerifyResponse)
@router.post("/verify", response_model=TokenVerifyResponse)
async def verify_access_token(token: str = Depends(oauth2_scheme)):
    """Verify an access token and return the user information. Accepts both GET and POST methods."""
    try:
        # Verify the token and get user_id
        user_id = await verify_token(token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Get user information
        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Convert to UserResponse
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            created_at=user.created_at,
            updated_at=user.updated_at,
            is_active=user.is_active,
            is_verified=user.is_verified
        )

        return TokenVerifyResponse(
            is_valid=True,
            user=user_response
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Token verification error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while verifying the token"
        ) 

@router.get("/logout", response_model=LogoutResponse)
@router.post("/logout", response_model=LogoutResponse)
async def logout(token: str = Depends(oauth2_scheme)):
    """Logout a user and invalidate their token. Accepts both GET and POST methods."""
    try:
        # Verify the token and get user_id
        user_id = await verify_token(token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

        # Update user's last logout time and invalidate token
        success = await auth_service.logout_user(user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to logout user"
            )

        return LogoutResponse(
            message="Successfully logged out",
            status="success"
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Logout error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during logout"
        ) 