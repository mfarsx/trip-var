from fastapi import FastAPI
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.middleware import setup_middleware
from app.api import health, generate

configure_logging()

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
    )
    
    setup_middleware(app)
    
    # Add routers with API prefix
    app.include_router(health, prefix=settings.API_V1_STR)
    app.include_router(generate, prefix=settings.API_V1_STR)
    
    return app

app = create_app() 