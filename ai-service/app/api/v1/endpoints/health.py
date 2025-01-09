from fastapi import APIRouter, HTTPException, status
from app.domain.services.auth import auth_service
from typing import Dict

router = APIRouter()

@router.get("/db", response_model=Dict[str, str])
async def check_db_health():
    """Check database connection health."""
    try:
        await auth_service.init_db()
        return {"status": "healthy"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Database health check failed: {str(e)}"
        ) 