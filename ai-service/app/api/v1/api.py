"""API router configuration."""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, health

# Initialize main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(
    users.router,
    prefix="/users",
    tags=["Users"]
)

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["Authentication"]
)

api_router.include_router(
    health.router,
    prefix="/health",
    tags=["Health"]
) 