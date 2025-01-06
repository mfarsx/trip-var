from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger
from app.core.config import settings

class MongoDB:
    """MongoDB client manager class."""
    client: Optional[AsyncIOMotorClient] = None
    is_connected: bool = False
    
    @property
    def db(self) -> AsyncIOMotorDatabase:
        """Get database instance with lazy loading."""
        if not self.client:
            raise ConnectionError("MongoDB client not initialized")
        return self.client[settings.MONGODB_NAME]

    @classmethod
    async def verify_connection(cls) -> bool:
        """Verify MongoDB connection with ping."""
        try:
            await cls.client.admin.command('ping', timeout=5)
            return True
        except (ConnectionFailure, TimeoutError) as e:
            logger.error(f"Connection verification failed: {str(e)}")
            return False

@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
async def connect_to_mongo() -> None:
    """Connect to MongoDB with retry logic."""
    try:
        MongoDB.client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            serverSelectionTimeoutMS=5000
        )
        await MongoDB.client.admin.command('ping')
        MongoDB.is_connected = True
        logger.info("Successfully connected to MongoDB")
    except ConnectionFailure as e:
        MongoDB.is_connected = False
        logger.error(f"Failed to connect to MongoDB: {str(e)}")
        raise

async def close_mongo_connection() -> None:
    """Close MongoDB connection safely."""
    if MongoDB.client:
        MongoDB.client.close()
        MongoDB.is_connected = False
        logger.info("MongoDB connection closed")

def get_database() -> AsyncIOMotorDatabase:
    """Get MongoDB database instance."""
    if not MongoDB.client:
        raise ConnectionError("MongoDB client not initialized")
    return MongoDB.client[settings.MONGODB_NAME] 