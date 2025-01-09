"""API v1 router configuration."""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, text_generation, health

api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(text_generation.router, prefix="/text-generation", tags=["text-generation"])
api_router.include_router(health.router, prefix="/health", tags=["health"]) 