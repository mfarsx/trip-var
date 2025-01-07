from fastapi import APIRouter, Response
from app.core.config import settings
from app.core.mongodb import MongoDB
import time
import asyncio
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

async def check_database() -> bool:
    try:
        return await asyncio.wait_for(MongoDB.verify_connection(), timeout=5.0)
    except asyncio.TimeoutError:
        logger.error("Database health check timed out")
        return False

async def check_external_services() -> bool:
    # Add external service checks here
    return True

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "api_key_configured": bool(settings.DEFAULT_HF_API_KEY)
    }

@router.get("/health/ready")
async def readiness_check(response: Response):
    checks = {
        "database": await check_database(),
        "external_services": await check_external_services()
    }
    
    is_ready = all(checks.values())
    response.status_code = 200 if is_ready else 503
    
    return {
        "status": "ready" if is_ready else "not_ready",
        "checks": checks
    } 