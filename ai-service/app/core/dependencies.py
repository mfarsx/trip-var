"""Core dependencies."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import get_settings
from app.core.mongodb import MongoDB
from app.core.security import verify_token
from app.domain.models.user import User
from app.domain.services.text_generation import TextGenerationService
from bson import ObjectId

settings = get_settings()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_PREFIX}/auth/login",
    scheme_name="JWT"
)

async def get_db():
    """Get database instance."""
    return MongoDB().db

async def get_text_generator() -> TextGenerationService:
    """Get text generation service instance."""
    return TextGenerationService()

async def get_current_user(token: str = Depends(oauth2_scheme)) -> User:
    """Get current authenticated user."""
    try:
        user_id = await verify_token(token)
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token"
            )
            
        # Get user from database
        db = MongoDB().db
        user_data = await db.users.find_one({"_id": ObjectId(user_id)})
        if not user_data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
            
        return User(**{**user_data, "id": str(user_data["_id"])})
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )

async def get_verified_user(current_user: User = Depends(get_current_user)) -> User:
    """Get verified user."""
    if not current_user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not verified"
        )
    return current_user

async def get_active_user(current_user: User = Depends(get_current_user)) -> User:
    """Get active user."""
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is not active"
        )
    return current_user 