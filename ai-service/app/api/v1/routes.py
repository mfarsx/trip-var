"""API routes configuration."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, health, text_generation, users

# Create main router
router = APIRouter()

# Include endpoint routers
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(health.router, prefix="/health", tags=["Health"])
router.include_router(text_generation.router, prefix="/text", tags=["Text Generation"])
router.include_router(users.router, prefix="/users", tags=["Users"])

__all__ = ["router"]
