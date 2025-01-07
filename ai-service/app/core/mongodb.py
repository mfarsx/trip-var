from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from tenacity import retry, stop_after_attempt, wait_exponential
from loguru import logger
from app.core.config import settings

class MongoDB:
    """MongoDB client manager class."""
    _instance = None
    _client: Optional[AsyncIOMotorClient] = None
    _is_connected: bool = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
        return cls._instance
    
    @property
    def client(self) -> AsyncIOMotorClient:
        """Get MongoDB client instance."""
        if not self._client:
            raise ConnectionError("MongoDB client not initialized")
        return self._client
    
    @property
    def is_connected(self) -> bool:
        """Get connection status."""
        return self._is_connected
    
    @property
    def db(self) -> AsyncIOMotorDatabase:
        """Get database instance with lazy loading."""
        if not self._client:
            raise ConnectionError("MongoDB client not initialized")
        return self._client[settings.MONGODB_NAME]

    async def verify_connection(self) -> bool:
        """Verify MongoDB connection with ping."""
        if not self._client:
            return False
        try:
            await self._client.admin.command('ping', timeout=5)
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError, TimeoutError) as e:
            logger.error(f"Connection verification failed: {str(e)}")
            return False

@retry(stop=stop_after_attempt(5), wait=wait_exponential(multiplier=1, min=4, max=20))
async def connect_to_mongo() -> None:
    """Connect to MongoDB with retry logic."""
    try:
        if not settings.MONGODB_URL:
            raise ValueError("MONGODB_URL is not set")
            
        mongo = MongoDB()
        mongo._client = AsyncIOMotorClient(
            settings.MONGODB_URL,
            maxPoolSize=settings.MONGODB_MAX_POOL_SIZE,
            minPoolSize=settings.MONGODB_MIN_POOL_SIZE,
            serverSelectionTimeoutMS=10000,
            connectTimeoutMS=10000,
            socketTimeoutMS=20000,
            waitQueueTimeoutMS=10000
        )
        await mongo._client.admin.command('ping')
        mongo._is_connected = True
        logger.info(f"Successfully connected to MongoDB at {settings.MONGODB_URL}")
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        mongo._is_connected = False
        logger.error(f"Failed to connect to MongoDB at {settings.MONGODB_URL}: {str(e)}")
        raise
    except Exception as e:
        mongo._is_connected = False
        logger.error(f"Unexpected error connecting to MongoDB: {str(e)}")
        raise

async def close_mongo_connection() -> None:
    """Close MongoDB connection safely."""
    mongo = MongoDB()
    if mongo._client:
        mongo._client.close()
        mongo._is_connected = False
        logger.info("MongoDB connection closed")

def get_database() -> AsyncIOMotorDatabase:
    """Get MongoDB database instance."""
    mongo = MongoDB()
    if not mongo._client:
        raise ConnectionError("MongoDB client not initialized")
    return mongo._client[settings.MONGODB_NAME] 