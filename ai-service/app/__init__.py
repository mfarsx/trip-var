"""Main application package."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.core.config import get_settings
from app.core.mongodb import MongoDB
from app.api.v1.api import api_router
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# Reduce Passlib logs
logging.getLogger("passlib").setLevel(logging.WARNING)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan."""
    mongodb = MongoDB()
    try:
        await mongodb.verify_connection()
        yield
    except Exception as e:
        logger.error(f"Application lifecycle error: {str(e)}", exc_info=True)
        raise
    finally:
        if mongodb.client:
            mongodb.client.close()

# Create FastAPI app instance
app = FastAPI(
    title=get_settings().APP_NAME,
    description=get_settings().APP_DESCRIPTION,
    version=get_settings().APP_VERSION,
    docs_url="/docs" if get_settings().SHOW_DOCS else None,
    redoc_url="/redoc" if get_settings().SHOW_DOCS else None,
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API router
app.include_router(api_router, prefix="/api/v1")

__all__ = ["app"]
