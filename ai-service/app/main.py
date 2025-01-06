from fastapi import FastAPI
from app.core.config import settings
from app.core.middleware import setup_middleware
from app.core.logging_config import setup_logging
from app.api.routes import router
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Setup
    setup_logging()
    yield
    # Cleanup
    pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan
)

# Setup middleware
setup_middleware(app)

# Include routers
app.include_router(router, prefix=settings.API_V1_STR) 