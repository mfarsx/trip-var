"""API router configuration."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, text_generation, travel, users

# Initialize main API router
api_router = APIRouter()

# Include all endpoint routers
api_router.include_router(users.router, prefix="/users", tags=["Users"])

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])

api_router.include_router(health.router, prefix="/health", tags=["Health"])

api_router.include_router(
    text_generation.router, prefix="/text-generation", tags=["Text Generation"]
)

api_router.include_router(travel.router, prefix="/travel", tags=["Travel Planning"])
