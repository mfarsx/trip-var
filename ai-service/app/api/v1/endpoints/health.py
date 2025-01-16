"""Health check endpoints."""

import logging

from fastapi import APIRouter, Depends, Response, status

from app.core.config import get_settings
from app.core.mongodb import MongoDB

logger = logging.getLogger(__name__)
router = APIRouter()
settings = get_settings()


@router.get("")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
    }


@router.get("/db")
async def db_health_check():
    """Database connection health check"""
    try:
        mongodb = MongoDB()
        is_connected = await mongodb.verify_connection()

        if not is_connected:
            logger.error("Database health check failed - could not connect")
            return Response(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                content="Database connection failed",
            )

        return {
            "status": "healthy",
            "database": "connected",
            "database_name": settings.DATABASE_NAME,
        }

    except Exception as e:
        logger.error(f"Database health check failed: {str(e)}", exc_info=True)
        return Response(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content=f"Database error: {str(e)}",
        )
