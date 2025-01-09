"""AI Service Application Package."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.core.config import settings
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

def create_app() -> FastAPI:
    """Create FastAPI application."""
    app = FastAPI(title="AI Service API")
    
    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Include API router with prefix from settings
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    
    @app.get("/")
    async def root():
        return {"message": "Welcome to AI Service API"}
    
    return app
