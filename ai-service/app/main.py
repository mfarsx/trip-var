"""Main module for the FastAPI application."""

import uvicorn
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.core.config import settings
from app.core.exceptions import CustomException
from app.api import api_router
from app.domain.services.auth import auth_service
import logging
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.debug("Starting application lifecycle...")
    try:
        from app.domain.services.auth import auth_service
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
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        lifespan=lifespan
    )
    
    # Setup CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    
    # Add API router
    app.include_router(api_router, prefix=settings.API_V1_PREFIX)
    
    logger.debug("Application created successfully")
    return app

app = create_app()

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    ) 