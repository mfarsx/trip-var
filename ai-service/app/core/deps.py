"""Dependencies for FastAPI."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError
from app.core.config import settings
from app.core.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    user_id = decode_access_token(token)
    if user_id is None:
        raise credentials_exception

    # Import here to avoid circular import
    from app.domain.services.auth import auth_service
    user = await auth_service.get_user_by_id(user_id)
    if user is None:
        raise credentials_exception
    return user 