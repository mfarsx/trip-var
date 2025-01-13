"""Main application package."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.mongodb import MongoDB
from app.api.v1.api import api_router
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
# Passlib loglarını azalt
logging.getLogger("passlib").setLevel(logging.WARNING)
logger = logging.getLogger(__name__)
settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    try:
        # Startup
        logger.info("Starting up application...")
        mongodb = MongoDB()
        await mongodb.verify_connection()
        logger.info("MongoDB connection verified")
        yield
        # Shutdown
        if mongodb.client:
            mongodb.client.close()
            logger.info("MongoDB connection closed")
    except Exception as e:
        logger.error(f"Application lifecycle error: {str(e)}", exc_info=True)
        raise

# Create FastAPI app instance
app = FastAPI(
    title=settings.APP_NAME,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    docs_url="/docs" if settings.SHOW_DOCS else None,
    redoc_url="/redoc" if settings.SHOW_DOCS else None,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

__all__ = ["app"]
