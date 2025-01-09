"""User repository."""

from typing import Optional
from bson import ObjectId
from app.domain.models.user import UserInDB, User
from app.core.mongodb import MongoDB

class UserRepository:
    COLLECTION = "users"

    def __init__(self):
        self.mongodb = MongoDB()

    async def create(self, user: UserInDB) -> User:
        """Create new user."""
        result = await self.mongodb.db[self.COLLECTION].insert_one(user.dict())
        user.id = str(result.inserted_id)
        return User(**user.dict())

    async def get_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get user by ID."""
        result = await self.mongodb.db[self.COLLECTION].find_one({"_id": ObjectId(user_id)})
        return UserInDB(**result) if result else None

    async def get_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email."""
        result = await self.mongodb.db[self.COLLECTION].find_one({"email": email})
        return UserInDB(**result) if result else None 