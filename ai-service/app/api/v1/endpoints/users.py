"""User CRUD operations endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from app.domain.models import (
    UserCreate,
    UserUpdate,
    UserResponse,
    User,
    DataResponse,
    ListResponse
)
from app.domain.services.users import UserService
from app.core.dependencies import get_current_user

router = APIRouter()

@router.get("/me", response_model=DataResponse[UserResponse])
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    """Get current user information."""
    return DataResponse(
        success=True,
        message="User information retrieved successfully",
        data=current_user
    )

@router.put("/me", response_model=DataResponse[UserResponse])
async def update_user_info(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user)
):
    """Update current user information."""
    try:
        updated_user = await UserService.update_user(current_user.id, update_data)
        return DataResponse(
            success=True,
            message="User information updated successfully",
            data=updated_user
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/", response_model=ListResponse[UserResponse])
async def list_users(
    page: int = 1,
    per_page: int = 10,
    current_user: User = Depends(get_current_user)
):
    """List all users (admin only)."""
    if not current_user.is_superuser:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        users, total = await UserService.list_users(page, per_page)
        return ListResponse(
            success=True,
            message="Users retrieved successfully",
            data=users,
            total=total,
            page=page,
            per_page=per_page,
            pages=(total + per_page - 1) // per_page
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 