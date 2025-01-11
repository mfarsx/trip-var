"""Authentication service."""

from datetime import datetime, timezone
from typing import Optional, Tuple
from bson import ObjectId
import logging

from app.core.security import create_access_token, get_password_hash, verify_password
from app.core.mongodb import MongoDB
from app.domain.models.user import User, UserCreate, UserInDB
from app.domain.models.auth import Token
from app.core.exceptions import ValidationError, DatabaseError, AuthenticationError

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.db = MongoDB().db
        self.users_collection = self.db.users

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        """Get user by email."""
        try:
            user_data = await self.users_collection.find_one({"email": email})
            if user_data:
                return UserInDB(**{**user_data, "id": str(user_data["_id"])})
            return None
        except Exception as e:
            logger.error(f"Database error while getting user by email: {str(e)}")
            raise DatabaseError(f"Failed to get user: {str(e)}")

    async def create_user(self, user_data: UserCreate) -> Tuple[User, Token]:
        """Create new user and return user object with token"""
        try:
            # Check existing user
            existing_user = await self.get_user_by_email(user_data.email)
            if existing_user:
                logger.warning(f"Registration attempted with existing email: {user_data.email}")
                raise ValidationError("Email already registered")
                
            # Create user document
            user_dict = user_data.model_dump()
            user_dict["hashed_password"] = get_password_hash(user_dict.pop("password"))
            user_dict["created_at"] = datetime.now(timezone.utc)
            user_dict["updated_at"] = user_dict["created_at"]
            user_dict["is_active"] = True
            user_dict["is_verified"] = False
            
            # Insert into database
            result = await self.users_collection.insert_one(user_dict)
            user_dict["id"] = str(result.inserted_id)
            
            # Create user object and token
            user = User(**user_dict)
            token = Token(
                access_token=create_access_token({"sub": user.id}),
                token_type="bearer"
            )
            
            logger.info(f"Successfully created new user with email: {user.email}")
            return user, token
            
        except ValidationError:
            raise
        except Exception as e:
            logger.error(f"User creation error: {str(e)}", exc_info=True)
            raise DatabaseError(f"Failed to create user: {str(e)}")

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user and return user object"""
        try:
            user = await self.get_user_by_email(email)
            if not user or not verify_password(password, user.hashed_password):
                logger.warning(f"Failed login attempt for email: {email}")
                return None
                
            return User.model_validate(user)
            
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}", exc_info=True)
            raise DatabaseError(f"Authentication failed: {str(e)}")

    async def login_user(self, email: str, password: str) -> Tuple[User, Token]:
        """Login user and return user object with token."""
        try:
            user = await self.authenticate_user(email, password)
            if not user:
                raise AuthenticationError("Invalid email or password")

            token = Token(
                access_token=create_access_token({"sub": user.id}),
                token_type="bearer"
            )
            
            logger.info(f"User logged in successfully: {email}")
            return user, token
            
        except AuthenticationError:
            raise
        except Exception as e:
            logger.error(f"Login failed: {str(e)}", exc_info=True)
            raise DatabaseError(f"Login failed: {str(e)}")

    async def logout_user(self, user_id: str) -> bool:
        """Logout user."""
        try:
            # Implement token blacklisting or user session management here
            return True
        except Exception as e:
            logger.error(f"Logout failed: {str(e)}")
            raise DatabaseError("Failed to logout user")

# Create singleton instance
auth_service = AuthService() 