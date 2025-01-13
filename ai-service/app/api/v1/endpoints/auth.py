"""Authentication endpoints with rate limiting and enhanced security."""

from fastapi import APIRouter, HTTPException, status, Form, Request
from app.domain.models import UserCreate, UserResponse, Token, LoginResponse, DataResponse
from app.domain.services.auth import auth_service
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import Depends
from typing import Annotated
from pydantic import BaseModel, EmailStr
from app.core.dependencies import get_current_user
from app.core.rate_limit import rate_limiter

router = APIRouter()

class LoginRequest(BaseModel):
    """Login request model with email validation."""
    email: EmailStr
    password: str

    class Config:
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "password": "strongpassword123"
            }
        }

@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        201: {"description": "User successfully created"},
        400: {"description": "Invalid input or email already exists"},
        429: {"description": "Too many requests"}
    }
)
@rate_limiter(max_requests=5, window_seconds=300)  # 5 requests per 5 minutes
async def register(
    request: Request,
    user_data: UserCreate
) -> UserResponse:
    """
    Register a new user.
    
    Args:
        user_data: User registration data including email and password
        
    Returns:
        UserResponse: Created user information
        
    Raises:
        HTTPException: If email already exists or invalid input
    """
    try:
        user = await auth_service.register_user(user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post(
    "/login/token",
    response_model=LoginResponse,
    responses={
        200: {"description": "Successfully authenticated"},
        401: {"description": "Invalid credentials"},
        429: {"description": "Too many requests"}
    }
)
@rate_limiter(max_requests=10, window_seconds=300)  # 10 requests per 5 minutes
async def login_form(
    request: Request,
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
) -> LoginResponse:
    """
    Login using form data (for OAuth2 compatibility).
    
    Args:
        form_data: OAuth2 form data with username (email) and password
        
    Returns:
        LoginResponse: Authentication token and user information
        
    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        result = await auth_service.authenticate_user(
            email=form_data.username,  # OAuth2 form uses username field for email
            password=form_data.password
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post(
    "/login",
    response_model=LoginResponse,
    responses={
        200: {"description": "Successfully authenticated"},
        401: {"description": "Invalid credentials"},
        429: {"description": "Too many requests"}
    }
)
@rate_limiter(max_requests=10, window_seconds=300)  # 10 requests per 5 minutes
async def login(
    request: Request,
    login_data: LoginRequest
) -> LoginResponse:
    """
    Login using JSON request.
    
    Args:
        login_data: Login credentials including email and password
        
    Returns:
        LoginResponse: Authentication token and user information
        
    Raises:
        HTTPException: If credentials are invalid
    """
    try:
        result = await auth_service.authenticate_user(
            email=login_data.email,
            password=login_data.password
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.get(
    "/me",
    response_model=UserResponse,
    responses={
        200: {"description": "Current user information"},
        401: {"description": "Not authenticated"}
    }
)
async def get_current_user_info(
    current_user: Annotated[UserResponse, Depends(get_current_user)]
) -> UserResponse:
    """
    Get current authenticated user information.
    
    Args:
        current_user: Current authenticated user (injected by dependency)
        
    Returns:
        UserResponse: Current user information
    """
    return current_user

@router.post(
    "/logout",
    response_model=DataResponse[None],
    responses={
        200: {"description": "Successfully logged out"},
        401: {"description": "Not authenticated"}
    }
)
async def logout(
    current_user: Annotated[UserResponse, Depends(get_current_user)]
) -> DataResponse[None]:
    """
    Logout current user.
    
    Args:
        current_user: Current authenticated user (injected by dependency)
        
    Returns:
        DataResponse: Success message
    """
    # In a stateless JWT setup, we don't need to do anything server-side
    # The client will remove the token
    return DataResponse(
        success=True,
        message="Successfully logged out",
        data=None
    ) 