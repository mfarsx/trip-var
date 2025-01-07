"""Main module for the FastAPI application."""

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import api_router
from app.core.config import settings
from app.core.middleware import setup_middleware
import logging
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug("Starting application lifecycle...")
    try:
        from app.services.auth import auth_service
        await auth_service.init_db()
        logger.info("Database initialized successfully")
        yield
        logger.debug("Shutting down application...")
    except Exception as e:
        logger.error(f"Startup error: {str(e)}")
        raise
    finally:
        logger.debug("Cleanup complete")

def create_app() -> FastAPI:
    logger.debug("Creating FastAPI application...")
    app = FastAPI(
        title=settings.PROJECT_NAME,
        lifespan=lifespan
    )
    
    # Setup CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["http://localhost:3000"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add API router
    app.include_router(api_router, prefix=settings.API_V1_STR)
    
    logger.debug("Application created successfully")
    return app

app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    ) 