from datetime import datetime
from typing import Optional
from fastapi import HTTPException
from app.models.user import UserCreate, UserInDB, UserResponse
from app.core.security import get_password_hash, verify_password
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
                # Connect to MongoDB
                self.client = AsyncIOMotorClient(settings.MONGODB_URL)
                
                # Test connection
                await self.client.admin.command('ping')
                logger.info("MongoDB connection successful")
                
                # Get database and collection
                self.db = self.client[settings.MONGODB_NAME]
                self.users_collection = self.db.users
                
                # Create indexes
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

    async def create_user(self, user: UserCreate) -> UserResponse:
        try:
            await self.init_db()
            logger.debug(f"Creating user: {user.email}")
            
            # Check if user exists
            existing_user = await self.users_collection.find_one({"email": user.email})
            if existing_user:
                logger.warning(f"User already exists: {user.email}")
                raise HTTPException(status_code=400, detail="Email already registered")
            
            # Create user document
            user_id = str(uuid.uuid4())
            now = datetime.utcnow()
            user_doc = {
                "id": user_id,
                "email": user.email,
                "full_name": user.full_name,
                "hashed_password": get_password_hash(user.password),
                "created_at": now,
                "updated_at": now
            }
            
            # Insert into database
            logger.debug(f"Inserting user document: {user.email}")
            result = await self.users_collection.insert_one(user_doc)
            
            if not result.inserted_id:
                raise HTTPException(status_code=500, detail="Failed to create user")
            
            logger.info(f"User created successfully: {user.email}")
            
            return UserResponse(
                id=user_id,
                email=user.email,
                full_name=user.full_name,
                created_at=now,
                updated_at=now
            )
            
        except Exception as e:
            logger.error(f"Error creating user: {str(e)}", exc_info=True)
            raise

    async def authenticate_user(self, email: str, password: str):
        try:
            await self.init_db()
            logger.debug(f"Attempting to authenticate user: {email}")
            
            user = await self.users_collection.find_one({"email": email})
            if user is None:
                logger.warning(f"User not found: {email}")
                return None
            
            if not verify_password(password, user["hashed_password"]):
                logger.warning(f"Invalid password for user: {email}")
                return None
            
            logger.info(f"User authenticated successfully: {email}")
            return UserInDB(**user)
        except Exception as e:
            logger.error(f"Authentication error: {str(e)}", exc_info=True)
            raise

    async def get_user_by_id(self, user_id: str):
        await self.init_db()
        user = await self.users_collection.find_one({"id": user_id})
        if user:
            return UserInDB(**user)
        return None

auth_service = AuthService() 