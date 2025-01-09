"""User management endpoints."""

from fastapi import APIRouter, Depends, status
from app.core.dependencies import get_current_user, get_verified_user, get_active_user
from app.domain.models.user import UserResponse, UserUpdate, UserInDB
from app.domain.models.responses import DataResponse, PaginatedResponse
from app.core.exceptions import ValidationError, NotFoundError
from app.domain.services.auth import auth_service
import logging
from typing import Annotated, List

logger = logging.getLogger(__name__)
router = APIRouter()

@router.get(
    "/me",
    response_model=DataResponse[UserResponse],
    responses={
        200: {
            "description": "Successfully retrieved user details",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User details retrieved successfully",
                        "data": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "email": "user@example.com",
                            "full_name": "John Doe",
                            "created_at": "2024-01-20T12:34:56.789Z",
                            "updated_at": "2024-01-20T12:34:56.789Z",
                            "is_active": True,
                            "is_verified": False
                        }
                    }
                }
            }
        },
        401: {
            "description": "Invalid or missing token",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Invalid token",
                        "code": "AUTHENTICATION_ERROR",
                        "status_code": 401
                    }
                }
            }
        }
    }
)
async def get_current_user_info(
    current_user: Annotated[UserInDB, Depends(get_active_user)]
) -> DataResponse[UserResponse]:
    """
    Get current user information.
    
    Args:
        current_user: Current authenticated user from dependency
        
    Returns:
        DataResponse containing user data
    """
    user_response = UserResponse.model_validate(current_user)
    return DataResponse(
        success=True,
        message="User details retrieved successfully",
        data=user_response
    )

@router.patch(
    "/me",
    response_model=DataResponse[UserResponse],
    responses={
        200: {
            "description": "Successfully updated user details",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User details updated successfully",
                        "data": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "email": "user@example.com",
                            "full_name": "John Doe",
                            "created_at": "2024-01-20T12:34:56.789Z",
                            "updated_at": "2024-01-20T12:34:56.789Z",
                            "is_active": True,
                            "is_verified": False
                        }
                    }
                }
            }
        },
        400: {
            "description": "Validation error",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "Validation failed",
                        "errors": [
                            {
                                "field": "full_name",
                                "message": "Full name must be at least 2 characters"
                            }
                        ],
                        "code": "VALIDATION_ERROR",
                        "status_code": 400
                    }
                }
            }
        }
    }
)
async def update_current_user(
    user_update: UserUpdate,
    current_user: Annotated[UserInDB, Depends(get_active_user)]
) -> DataResponse[UserResponse]:
    """
    Update current user information.
    
    Args:
        user_update: User data to update
        current_user: Current authenticated user from dependency
        
    Returns:
        DataResponse containing updated user data
        
    Raises:
        ValidationError: If update data is invalid
    """
    try:
        updated_user = await auth_service.update_user(current_user.id, user_update)
        user_response = UserResponse.model_validate(updated_user)
        
        return DataResponse(
            success=True,
            message="User details updated successfully",
            data=user_response
        )
    except Exception as e:
        logger.error(f"Error updating user: {str(e)}", exc_info=True)
        raise ValidationError("Failed to update user details")

@router.get(
    "",
    response_model=PaginatedResponse[UserResponse],
    dependencies=[Depends(get_verified_user)],
    responses={
        200: {
            "description": "Successfully retrieved users list",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "Users retrieved successfully",
                        "data": [
                            {
                                "id": "550e8400-e29b-41d4-a716-446655440000",
                                "email": "user@example.com",
                                "full_name": "John Doe",
                                "created_at": "2024-01-20T12:34:56.789Z",
                                "updated_at": "2024-01-20T12:34:56.789Z",
                                "is_active": True,
                                "is_verified": False
                            }
                        ],
                        "meta": {
                            "page": 1,
                            "per_page": 10,
                            "total": 1,
                            "pages": 1
                        }
                    }
                }
            }
        }
    }
)
async def list_users(
    page: int = 1,
    per_page: int = 10
) -> PaginatedResponse[UserResponse]:
    """
    List all users (requires verified user).
    
    Args:
        page: Page number
        per_page: Items per page
        
    Returns:
        PaginatedResponse containing list of users
    """
    users, total = await auth_service.list_users(page, per_page)
    user_responses = [UserResponse.model_validate(user) for user in users]
    
    return PaginatedResponse(
        success=True,
        message="Users retrieved successfully",
        data=user_responses,
        meta={
            "page": page,
            "per_page": per_page,
            "total": total,
            "pages": (total + per_page - 1) // per_page
        }
    )

@router.get(
    "/{user_id}",
    response_model=DataResponse[UserResponse],
    dependencies=[Depends(get_verified_user)],
    responses={
        200: {
            "description": "Successfully retrieved user details",
            "content": {
                "application/json": {
                    "example": {
                        "success": True,
                        "message": "User details retrieved successfully",
                        "data": {
                            "id": "550e8400-e29b-41d4-a716-446655440000",
                            "email": "user@example.com",
                            "full_name": "John Doe",
                            "created_at": "2024-01-20T12:34:56.789Z",
                            "updated_at": "2024-01-20T12:34:56.789Z",
                            "is_active": True,
                            "is_verified": False
                        }
                    }
                }
            }
        },
        404: {
            "description": "User not found",
            "content": {
                "application/json": {
                    "example": {
                        "success": False,
                        "message": "User not found",
                        "code": "NOT_FOUND",
                        "status_code": 404
                    }
                }
            }
        }
    }
)
async def get_user(user_id: str) -> DataResponse[UserResponse]:
    """
    Get user by ID (requires verified user).
    
    Args:
        user_id: User's unique identifier
        
    Returns:
        DataResponse containing user data
        
    Raises:
        NotFoundError: If user is not found
    """
    user = await auth_service.get_user_by_id(user_id)
    if not user:
        raise NotFoundError("User not found")
        
    user_response = UserResponse.model_validate(user)
    return DataResponse(
        success=True,
        message="User details retrieved successfully",
        data=user_response
    ) 