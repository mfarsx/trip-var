"""API v1 router initialization."""

from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.text import router as text_router

api_router = APIRouter()
api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(text_router, prefix="/text", tags=["text"]) 