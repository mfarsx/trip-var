"""MongoDB database connection and management."""

import logging
from contextlib import asynccontextmanager

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from tenacity import retry, stop_after_attempt, wait_exponential

from app.core.config import get_settings
from app.core.exceptions import AppException

logger = logging.getLogger(__name__)
settings = get_settings()


class MongoDB:
    """MongoDB client manager."""

    _instance = None
    _client: AsyncIOMotorClient = None  # Initialize as None
    _db: AsyncIOMotorDatabase = None  # Initialize as None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoDB, cls).__new__(cls)
            # Initialize instance attributes
            cls._instance._client = None
            cls._instance._db = None
        return cls._instance

    @property
    def client(self) -> AsyncIOMotorClient:
        """Get MongoDB client instance."""
        if self._client is None:
            self._init_client()
        return self._client

    @property
    def db(self) -> AsyncIOMotorDatabase:
        """Get database instance."""
        if self._db is None:
            self._init_client()
        return self._db

    @retry(
        stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    def _init_client(self) -> None:
        """Initialize MongoDB client."""
        try:
            self._client = AsyncIOMotorClient(
                settings.MONGODB_URL,
                maxPoolSize=settings.MAX_CONNECTIONS_COUNT,
                minPoolSize=settings.MIN_CONNECTIONS_COUNT,
                serverSelectionTimeoutMS=5000,
            )
            self._db = self._client[settings.DATABASE_NAME]
            logger.info("MongoDB connection initialized")
        except Exception as e:
            logger.error(f"Failed to initialize MongoDB: {str(e)}")
            raise AppException("Database connection failed")

    async def verify_connection(self) -> bool:
        """Verify database connection is alive."""
        try:
            await self.db.command("ping")
            return True
        except Exception as e:
            logger.error(f"MongoDB connection verification failed: {str(e)}")
            return False


# Convenience functions
async def get_db() -> AsyncIOMotorDatabase:
    """Get database instance."""
    return MongoDB().db


@asynccontextmanager
async def get_db_session():
    """Get database session context manager."""
    try:
        yield await get_db()
    except Exception as e:
        logger.error(f"Database session error: {str(e)}")
        raise
