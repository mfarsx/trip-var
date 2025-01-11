"""User CRUD operations endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from typing import List, Optional
from datetime import datetime
from bson import ObjectId, errors as bson_errors

from app.core.mongodb import get_db
from app.domain.models.user import UserCreate, UserUpdate, UserResponse, User
from app.domain.models.responses import DataResponse, ListResponse
from app.core.security import get_password_hash
from motor.motor_asyncio import AsyncIOMotorDatabase

# Initialize router with a prefix to handle trailing slashes
router = APIRouter(prefix="")

@router.post("", response_model=DataResponse[UserResponse], status_code=status.HTTP_201_CREATED)
async def create_user(user: UserCreate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Create a new user."""
    # Check if user already exists
    if await db.users.find_one({"email": user.email}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user document
    user_doc = {
        "email": user.email,
        "full_name": user.full_name,
        "hashed_password": get_password_hash(user.password),
        "is_active": True,
        "is_verified": False,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    
    return DataResponse(
        success=True,
        message="User created successfully",
        data=UserResponse(**user_doc)
    )

@router.get("", response_model=ListResponse[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get list of users."""
    users = []
    total = await db.users.count_documents({})
    cursor = db.users.find().skip(skip).limit(limit)
    
    async for user in cursor:
        user["id"] = str(user.pop("_id"))
        users.append(UserResponse(**user))
    
    return ListResponse(
        success=True,
        message="Users retrieved successfully",
        data=users,
        meta={
            "page": (skip // limit) + 1,
            "per_page": limit,
            "total": total,
            "pages": (total + limit - 1) // limit
        }
    )

@router.get("/{user_id}", response_model=DataResponse[UserResponse])
async def get_user(user_id: str, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Get a specific user by ID."""
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except bson_errors.InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    user["id"] = str(user.pop("_id"))
    return DataResponse(
        success=True,
        message="User retrieved successfully",
        data=UserResponse(**user)
    )

@router.put("/{user_id}", response_model=DataResponse[UserResponse])
async def update_user(user_id: str, user_update: UserUpdate, db: AsyncIOMotorDatabase = Depends(get_db)):
    """Update a user."""
    try:
        user = await db.users.find_one({"_id": ObjectId(user_id)})
    except bson_errors.InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    update_data = user_update.dict(exclude_unset=True)
    if "password" in update_data:
        update_data["hashed_password"] = get_password_hash(update_data.pop("password"))
    
    update_data["updated_at"] = datetime.utcnow()
    
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    updated_user["id"] = str(updated_user.pop("_id"))
    
    return DataResponse(
        success=True,
        message="User updated successfully",
        data=UserResponse(**updated_user)
    )

@router.delete("/{user_id}", response_model=DataResponse[None])
async def delete_user_by_path(
    user_id: str,
    response: Response,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a user using path parameter."""
    result = await _delete_user(user_id, db)
    response.status_code = status.HTTP_200_OK
    return DataResponse(
        success=True,
        message=f"User {result} deleted successfully",
        data=None
    )

@router.delete("", response_model=DataResponse[None])
async def delete_user_by_query(
    user_id: str = Query(..., description="User ID to delete"),
    response: Response = None,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete a user using query parameter."""
    result = await _delete_user(user_id, db)
    response.status_code = status.HTTP_200_OK
    return DataResponse(
        success=True,
        message=f"User {result} deleted successfully",
        data=None
    )

async def _delete_user(user_id: str, db: AsyncIOMotorDatabase) -> str:
    """Internal function to handle user deletion.
    
    Returns:
        str: The ID of the deleted user
    
    Raises:
        HTTPException: If user ID is invalid or user is not found
    """
    try:
        # First check if user exists
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        # Then delete the user
        result = await db.users.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        return user_id
        
    except bson_errors.InvalidId:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        ) 