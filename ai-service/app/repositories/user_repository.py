from datetime import datetime
from typing import Optional, List
from bson import ObjectId
from app.core.mongodb import MongoDB
from app.core.security import get_password_hash
from app.models.user import UserCreate, UserInDB, UserUpdate

class UserRepository:
    collection_name = "users"

    @classmethod
    async def create_user(cls, user: UserCreate) -> UserInDB:
        user_dict = user.model_dump()
        user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
        user_dict["created_at"] = datetime.utcnow()
        user_dict["updated_at"] = user_dict["created_at"]

        result = await MongoDB.db[cls.collection_name].insert_one(user_dict)
        user_dict["_id"] = result.inserted_id
        return UserInDB(**user_dict)

    @classmethod
    async def get_user_by_email(cls, email: str) -> Optional[UserInDB]:
        user_dict = await MongoDB.db[cls.collection_name].find_one({"email": email})
        if user_dict:
            return UserInDB(**user_dict)
        return None

    @classmethod
    async def get_user_by_id(cls, user_id: str) -> Optional[UserInDB]:
        try:
            user_dict = await MongoDB.db[cls.collection_name].find_one({"_id": ObjectId(user_id)})
            if user_dict:
                return UserInDB(**user_dict)
        except Exception:
            return None
        return None

    @classmethod
    async def update_user(cls, user_id: str, update_data: UserUpdate) -> Optional[UserInDB]:
        update_dict = update_data.model_dump(exclude_unset=True)
        if "password" in update_dict:
            update_dict["hashed_password"] = get_password_hash(update_dict.pop("password"))
        update_dict["updated_at"] = datetime.utcnow()

        result = await MongoDB.db[cls.collection_name].update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_dict}
        )

        if result.modified_count:
            return await cls.get_user_by_id(user_id)
        return None

    @classmethod
    async def delete_user(cls, user_id: str) -> bool:
        result = await MongoDB.db[cls.collection_name].delete_one({"_id": ObjectId(user_id)})
        return result.deleted_count > 0

    @classmethod
    async def get_users(cls, skip: int = 0, limit: int = 100) -> List[UserInDB]:
        cursor = MongoDB.db[cls.collection_name].find().skip(skip).limit(limit)
        users = await cursor.to_list(length=limit)
        return [UserInDB(**user) for user in users]

    @classmethod
    async def get_active_users_count(cls) -> int:
        return await MongoDB.db[cls.collection_name].count_documents({"is_active": True}) 