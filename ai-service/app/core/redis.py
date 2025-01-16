"""Redis connection module."""

from typing import Optional

from redis.asyncio import Redis

from app.core.config import get_settings

settings = get_settings()
_redis: Optional[Redis] = None


async def get_redis() -> Redis:
    """Get Redis connection."""
    global _redis
    if _redis is None:
        _redis = Redis.from_url(settings.REDIS_URL)
    return _redis
