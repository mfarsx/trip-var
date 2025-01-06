from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings
from app.models.user import UserInDB, UserCreate
from app.core.mongodb import get_database
from fastapi import HTTPException, status

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    def __init__(self):
        self.db = get_database()
        self.users_collection = self.db.users

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return pwd_context.hash(password)

    def create_access_token(self, data: dict) -> str:
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        user = await self.users_collection.find_one({"email": email})
        if not user:
            return None
        if not self.verify_password(password, user["hashed_password"]):
            return None
        return UserInDB(**user)

    async def create_user(self, user: UserCreate) -> UserInDB:
        # Check if user already exists
        if await self.users_collection.find_one({"email": user.email}):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        user_dict = user.model_dump()
        hashed_password = self.get_password_hash(user_dict.pop("password"))
        user_db = UserInDB(
            **user_dict,
            hashed_password=hashed_password
        )
        
        result = await self.users_collection.insert_one(user_db.model_dump(by_alias=True))
        user_db.id = result.inserted_id
        return user_db

auth_service = AuthService() 