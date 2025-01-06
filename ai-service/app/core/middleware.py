from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from slowapi import Limiter
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
import time
from fastapi.responses import JSONResponse
import logging

limiter = Limiter(key_func=get_remote_address)
logger = logging.getLogger(__name__)

def setup_middleware(app: FastAPI) -> None:
    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure this for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Trusted Host
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure this for production
    )

    # Rate Limiting
    app.state.limiter = limiter
    app.add_middleware(SlowAPIMiddleware)

    @app.middleware("http")
    async def add_process_time_header(request: Request, call_next):
        start_time = time.time()
        response = await call_next(request)
        process_time = time.time() - start_time
        response.headers["X-Process-Time"] = str(process_time)
        return response

    @app.exception_handler(RateLimitExceeded)
    async def rate_limit_handler(request: Request, exc: RateLimitExceeded):
        return HTTPException(
            status_code=429,
            detail="Too many requests"
        )

    @app.middleware("http")
    async def error_handler(request: Request, call_next):
        try:
            return await call_next(request)
        except Exception as e:
            logger.error(f"Unhandled error: {str(e)}")
            return JSONResponse(
                status_code=500,
                content={"detail": str(e)}
            ) 