"""AI Service Application Package."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.mongodb import connect_to_mongo, close_mongo_connection

def create_app() -> FastAPI:
    """Create FastAPI application."""
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json"
    )

    # Set up CORS
    if settings.BACKEND_CORS_ORIGINS:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    # Event handlers
    @app.on_event("startup")
    async def startup_event():
        print("Connecting to MongoDB...")
        await connect_to_mongo()

    @app.on_event("shutdown")
    async def shutdown_event():
        await close_mongo_connection()

    # Health check
    @app.get(f"{settings.API_V1_STR}/health")
    async def health_check():
        """Health check endpoint."""
        return {"status": "ok"}

    # Include routers
    from app.api.v1 import api_router
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app
