"""Dependencies for FastAPI endpoints."""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from app.domain.models import UserResponse, TokenData
from app.core.config import get_settings
from app.core.mongodb import get_db

settings = get_settings()
oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_PREFIX}/auth/login",
    auto_error=True
)

async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserResponse:
    """Get current authenticated user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Decode JWT
        payload = jwt.decode(
            token,
            settings.AUTH_SECRET_KEY,
            algorithms=[settings.AUTH_ALGORITHM]
        )
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
        
    # Get user from database
    db = await get_db()
    user_dict = await db.users.find_one({"email": token_data.email})
    if user_dict is None:
        raise credentials_exception
        
    return UserResponse(
        id=str(user_dict["_id"]),
        email=user_dict["email"],
        full_name=user_dict["full_name"],
        is_active=user_dict["is_active"],
        is_superuser=user_dict.get("is_superuser", False),
        preferences=user_dict.get("preferences", {}),
        access_token=token
    )