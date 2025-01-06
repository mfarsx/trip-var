from fastapi import APIRouter, Response
from app.core.config import settings
import psutil
import time

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "version": "1.0.0",
        "system": {
            "cpu_percent": psutil.cpu_percent(),
            "memory_percent": psutil.virtual_memory().percent
        }
    }

@router.get("/health/ready")
async def readiness_check(response: Response):
    # Add your readiness checks here
    checks = {
        "database": check_database(),
        "external_services": check_external_services()
    }
    
    is_ready = all(checks.values())
    response.status_code = 200 if is_ready else 503
    
    return {
        "status": "ready" if is_ready else "not_ready",
        "checks": checks
    } 