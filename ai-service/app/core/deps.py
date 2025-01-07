"""Dependencies for FastAPI."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.services.user import UserService
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    user_service: UserService = Depends()
) -> User:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        user_id = decode_access_token(token)
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception
        
    user = await user_service.get_by_id(user_id)
    if user is None:
        raise credentials_exception
        
    return user 