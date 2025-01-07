"""API v1 router initialization."""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, text_generation

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(text_generation.router, prefix="/text", tags=["text-generation"]) 