from typing import Annotated, Optional
from fastapi import Depends, Request, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.exceptions import AuthenticationError, NotFoundError
from app.domain.services.auth import auth_service
from app.core.security import verify_token
from app.domain.models.user import UserInDB
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    scheme_name="JWT"
)

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)]
) -> UserInDB:
    """Dependency to get the current authenticated user."""
    try:
        user_id = await verify_token(token)
        if not user_id:
            raise AuthenticationError("Invalid token")
            
        user = await auth_service.get_user_by_id(user_id)
        if not user:
            raise NotFoundError("User not found")
            
        return user
    except Exception as e:
        logger.error(f"Error getting current user: {str(e)}", exc_info=True)
        raise AuthenticationError("Failed to authenticate user")

async def get_optional_user(
    token: Annotated[Optional[str], Depends(oauth2_scheme)]
) -> Optional[UserInDB]:
    """Dependency to get the current user if authenticated, None otherwise."""
    try:
        if not token:
            return None
        return await get_current_user(token)
    except:
        return None

async def get_active_user(
    current_user: Annotated[UserInDB, Depends(get_current_user)]
) -> UserInDB:
    """Dependency to get the current user and verify they are active."""
    if not current_user.is_active:
        raise AuthenticationError("Inactive user")
    return current_user

async def get_verified_user(
    current_user: Annotated[UserInDB, Depends(get_active_user)]
) -> UserInDB:
    """Dependency to get the current user and verify they are verified."""
    if not current_user.is_verified:
        raise AuthenticationError("User not verified")
    return current_user 