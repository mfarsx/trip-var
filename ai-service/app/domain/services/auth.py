from datetime import datetime
from typing import Optional, Dict
from fastapi import HTTPException
from app.domain.models.user import UserCreate, UserInDB, UserResponse
from app.core.security import get_password_hash, verify_password, create_access_token
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import uuid
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)

class AuthService:
    def __init__(self):
        self.client: Optional[AsyncIOMotorClient] = None
        self.db = None
        self.users_collection = None
        self.initialized = False

    @retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
    async def init_db(self):
        if not self.initialized:
            try:
                self.client = AsyncIOMotorClient(settings.MONGODB_URL)
                await self.client.admin.command('ping')
                logger.info("MongoDB connection successful")
                
                self.db = self.client[settings.MONGODB_NAME]
                self.users_collection = self.db.users
                
                await self.users_collection.create_index(
                    [("email", 1)], 
                    unique=True
                )
                await self.users_collection.create_index(
                    [("id", 1)], 
                    unique=True
                )
                
                self.initialized = True
                logger.info(f"Database initialized: {settings.MONGODB_NAME}")
                
            except Exception as e:
                logger.error(f"Database initialization failed: {str(e)}")
                raise

    async def authenticate_user(self, email: str, password: str) -> Optional[UserInDB]:
        try:
            user = await self.get_user_by_email(email)
            if not user:
                logger.warning(f"User not found: {email}")
                return None
            
            if not verify_password(password, user.hashed_password):
                logger.warning(f"Invalid password for user: {email}")
                return None
            
            logger.info(f"User authenticated successfully: {email}")
            return user
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}", exc_info=True)
            raise

    async def create_user(self, user_data: UserCreate) -> Dict:
        try:
            await self.init_db()
            
            # Check if user exists
            existing_user = await self.users_collection.find_one({"email": user_data.email})
            if existing_user:
                raise HTTPException(status_code=400, detail="Email already registered")
            
            now = datetime.now()
            user_id = str(uuid.uuid4())
            user_doc = {
                "id": user_id,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "hashed_password": get_password_hash(user_data.password),
                "created_at": now,
                "updated_at": now,
                "is_active": True,
                "is_verified": False,
                "last_login": None,
                "last_logout": None,
                "failed_login_attempts": 0
            }
            
            result = await self.users_collection.insert_one(user_doc)
            if not result.inserted_id:
                raise HTTPException(status_code=500, detail="Failed to create user")
            
            # Create user response
            user_response = UserResponse(
                id=user_id,
                email=user_data.email,
                full_name=user_data.full_name,
                created_at=now,
                updated_at=now,
                is_active=True,
                is_verified=False
            )
            
            access_token = create_access_token(user_id)
            
            return {
                "user": user_response,
                "access_token": access_token,
                "token_type": "bearer"
            }
            
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}", exc_info=True)
            raise

    async def get_user_by_email(self, email: str) -> Optional[UserInDB]:
        try:
            await self.init_db()
            user_doc = await self.users_collection.find_one({"email": email})
            return UserInDB(**user_doc) if user_doc else None
        except Exception as e:
            logger.error(f"Error getting user by email: {str(e)}", exc_info=True)
            raise

    async def get_user_by_id(self, user_id: str) -> Optional[UserInDB]:
        """Get a user by their ID."""
        try:
            if not self.initialized:
                await self.init_db()

            user_dict = await self.users_collection.find_one({"id": user_id})
            if user_dict:
                return UserInDB(**user_dict)
            return None
            
        except Exception as e:
            logger.error(f"Error getting user by ID: {str(e)}")
            return None

    async def logout_user(self, user_id: str) -> bool:
        """
        Update user's last logout time and handle logout.
        Returns True if successful, False otherwise.
        """
        try:
            if not self.initialized:
                await self.init_db()

            # Update user's last logout time
            result = await self.users_collection.update_one(
                {"id": user_id},
                {
                    "$set": {
                        "last_logout": datetime.now(),
                        "updated_at": datetime.now()
                    }
                }
            )

            if result.modified_count == 0:
                logger.warning(f"No user found to logout with ID: {user_id}")
                return False

            logger.info(f"User logged out successfully: {user_id}")
            return True

        except Exception as e:
            logger.error(f"Error during logout: {str(e)}")
            return False

auth_service = AuthService() 