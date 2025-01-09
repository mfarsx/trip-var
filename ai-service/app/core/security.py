"""Security utilities."""

from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from jose import JWTError, jwt, ExpiredSignatureError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Security
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings
import logging
import secrets

logger = logging.getLogger(__name__)

# Configure password hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto",
    bcrypt__rounds=12  # Increase work factor for better security
)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against a hashed password."""
    try:
        return pwd_context.verify(plain_password, hashed_password)
    except Exception as e:
        logger.error(f"Password verification error: {str(e)}")
        return False

def get_password_hash(password: str) -> str:
    """Generate a hash from a plain password."""
    return pwd_context.hash(password)

def create_access_token(user_id: str, additional_data: Dict[str, Any] = None) -> str:
    """
    Create a new access token for a user.
    
    Args:
        user_id: The user's ID
        additional_data: Optional additional claims to include in the token
        
    Returns:
        str: The encoded JWT token
    """
    try:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode = {
            "exp": expire,
            "iat": datetime.utcnow(),
            "sub": str(user_id),
            "jti": secrets.token_hex(32)  # Add unique token ID
        }
        
        if additional_data:
            to_encode.update(additional_data)
            
        encoded_jwt = jwt.encode(
            to_encode,
            settings.SECRET_KEY,
            algorithm=settings.ALGORITHM
        )
        
        logger.debug(f"Created access token for user {user_id}")
        return encoded_jwt
        
    except Exception as e:
        logger.error(f"Token creation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Could not create access token"
        )

async def verify_token(token: str) -> Optional[str]:
    """
    Verify and decode access token.
    Returns the user_id if token is valid, None otherwise.
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        return user_id
    except JWTError:
        return None

def decode_token(token: str) -> Dict[str, Any]:
    """
    Decode and verify a JWT token.
    
    Args:
        token: The JWT token to decode
        
    Returns:
        dict: The decoded token payload
        
    Raises:
        HTTPException: If token is invalid or expired
    """
    try:
        payload = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
        return payload
        
    except ExpiredSignatureError:
        logger.warning("Attempt to use expired token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    except JWTError as e:
        logger.error(f"Token validation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

def generate_password_reset_token(email: str) -> str:
    """Generate a password reset token."""
    expire = datetime.utcnow() + timedelta(hours=24)
    return create_access_token(
        email,
        additional_data={
            "type": "password_reset",
            "exp": expire
        }
    )

def verify_password_reset_token(token: str) -> str:
    """Verify a password reset token and return the email."""
    payload = decode_token(token)
    if payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid token type"
        )
    return payload["sub"] 