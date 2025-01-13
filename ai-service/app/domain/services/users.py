"""User service for handling user operations."""

from typing import Tuple, List
from app.domain.models import UserUpdate, UserResponse, UserInDB
from app.core.mongodb import get_db
from app.core.security import get_password_hash
from datetime import datetime, timezone
from bson import ObjectId

class UserService:
    """Service for user operations."""

    @staticmethod
    async def update_user(user_id: str, update_data: UserUpdate) -> UserResponse:
        """Update user information."""
        db = await get_db()
        
        # Prepare update data
        update_dict = update_data.model_dump(exclude_unset=True)
        if "password" in update_dict:
            update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))
        
        update_dict["updated_at"] = datetime.now(timezone.utc)
        
        # Update user
        await db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_dict}
        )
        
        # Get updated user
        user = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            raise ValueError("User not found")
            
        return UserResponse(
            id=str(user["_id"]),
            email=user["email"],
            full_name=user["full_name"],
            is_active=user["is_active"],
            is_superuser=user.get("is_superuser", False),
            preferences=user.get("preferences", {})
        )

    @staticmethod
    async def list_users(page: int = 1, per_page: int = 10) -> Tuple[List[UserResponse], int]:
        """List all users with pagination."""
        db = await get_db()
        
        # Calculate skip
        skip = (page - 1) * per_page
        
        # Get total count
        total = await db.users.count_documents({})
        
        # Get users
        users = []
        cursor = db.users.find().skip(skip).limit(per_page)
        
        async for user in cursor:
            users.append(UserResponse(
                id=str(user["_id"]),
                email=user["email"],
                full_name=user["full_name"],
                is_active=user["is_active"],
                is_superuser=user.get("is_superuser", False),
                preferences=user.get("preferences", {})
            ))
            
        return users, total 