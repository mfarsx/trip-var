"""Rate limiting middleware using Redis."""

from fastapi import HTTPException, status, Request
from functools import wraps
import time
from app.core.redis import get_redis
from typing import Callable

def rate_limiter(max_requests: int, window_seconds: int):
    """Rate limiting decorator using Redis."""
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(request: Request, *args, **kwargs):
            client_ip = request.client.host
            redis = await get_redis()
            key = f"rate_limit:{client_ip}:{func.__name__}"
            
            # Get current count
            current = await redis.get(key)
            if current is None:
                await redis.setex(key, window_seconds, 1)
            elif int(current) >= max_requests:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests"
                )
            else:
                await redis.incr(key)
            
            return await func(request, *args, **kwargs)
        return wrapper
    return decorator 