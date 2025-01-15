"""Authentication service for handling user authentication."""

from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.domain.models import UserCreate, UserResponse, Token, LoginResponse, UserInDB
from app.core.mongodb import get_db
from app.core.config import get_settings

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    """Service for authentication operations."""

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Get password hash."""
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=15)
            
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        return encoded_jwt

    @classmethod
    async def register_user(cls, user_data: UserCreate) -> UserResponse:
        """Register a new user."""
        db = await get_db()
        
        # Check if user exists
        if await db.users.find_one({"email": user_data.email}):
            raise ValueError("Email already registered")
        
        # Create user
        user_dict = user_data.model_dump()
        user_dict["hashed_password"] = cls.get_password_hash(user_dict.pop("password"))
        user_dict["created_at"] = datetime.now(timezone.utc)
        user_dict["updated_at"] = user_dict["created_at"]
        user_dict["is_active"] = True
        user_dict["is_superuser"] = False
        
        result = await db.users.insert_one(user_dict)
        user_dict["id"] = str(result.inserted_id)
        
        # Create access token
        access_token = cls.create_access_token(
            data={"sub": user_dict["email"]},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Create response with token
        user_response = UserResponse(**user_dict)
        user_response.access_token = access_token
        
        return user_response

    @classmethod
    async def authenticate_user(cls, email: str, password: str) -> LoginResponse:
        """Authenticate user and return token with user data."""
        db = await get_db()
        user_dict = await db.users.find_one({"email": email})
        
        if not user_dict:
            raise ValueError("Incorrect email or password")
            
        user = UserInDB(
            id=str(user_dict["_id"]),
            email=user_dict["email"],
            full_name=user_dict["full_name"],
            hashed_password=user_dict["hashed_password"],
            is_active=user_dict["is_active"],
            is_superuser=user_dict.get("is_superuser", False),
            preferences=user_dict.get("preferences", {})
        )
        
        if not cls.verify_password(password, user.hashed_password):
            raise ValueError("Incorrect email or password")
            
        if not user.is_active:
            raise ValueError("User is inactive")
            
        access_token = cls.create_access_token(
            data={"sub": user.email},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        )
        
        # Create user response without hashed password
        user_response = UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            is_superuser=user.is_superuser,
            preferences=user.preferences
        )
        
        return LoginResponse(
            access_token=access_token,
            token_type="bearer",
            user=user_response
        )

# Create and export service instance
auth_service = AuthService() 