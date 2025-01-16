"""Middleware configuration."""

import json
import logging
import time
from typing import Any, Callable, Dict

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.core.config import settings
from app.core.exceptions import AppException

logger = logging.getLogger(__name__)


def get_client_ip(request: Request) -> str:
    """Get client IP from request headers or remote address."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0]
    return request.client.host if request.client else "unknown"


# Initialize rate limiter with custom key function
limiter = Limiter(
    key_func=get_client_ip,
    default_limits=[
        f"{settings.RATE_LIMIT_PER_SECOND}/second",
        f"{settings.RATE_LIMIT_PER_MINUTE}/minute",
        f"{settings.RATE_LIMIT_PER_HOUR}/hour",
    ],
)


class ResponseTimeMiddleware(BaseHTTPMiddleware):
    """Middleware to track response time."""

    def __init__(self, app: ASGIApp):
        super().__init__(app)
        self.app = app

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        start_time = time.time()

        try:
            response = await call_next(request)
            process_time = time.time() - start_time
            response.headers["X-Process-Time"] = f"{process_time:.4f}"
            return response
        except Exception as e:
            process_time = time.time() - start_time
            logger.error(
                "Request processing failed",
                extra={
                    "path": request.url.path,
                    "method": request.method,
                    "process_time": f"{process_time:.4f}",
                    "error": str(e),
                },
                exc_info=True,
            )
            raise


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log request and response details."""

    async def dispatch(self, request: Request, call_next: Callable) -> Response:
        request_id = request.headers.get("X-Request-ID", str(time.time()))
        client_ip = get_client_ip(request)

        # Log request
        logger.info(
            "Incoming request",
            extra={
                "request_id": request_id,
                "client_ip": client_ip,
                "method": request.method,
                "path": request.url.path,
                "headers": dict(request.headers),
                "query_params": dict(request.query_params),
            },
        )

        try:
            response = await call_next(request)

            # Log response
            logger.info(
                "Request completed",
                extra={
                    "request_id": request_id,
                    "status_code": response.status_code,
                    "process_time": response.headers.get("X-Process-Time"),
                },
            )

            response.headers["X-Request-ID"] = request_id
            return response

        except Exception as e:
            logger.error(
                "Request failed",
                extra={"request_id": request_id, "error": str(e)},
                exc_info=True,
            )

            if isinstance(e, AppException):
                return Response(
                    content=json.dumps(e.to_dict()),
                    status_code=e.status_code,
                    media_type="application/json",
                )

            return Response(
                content=json.dumps(
                    {"detail": "Internal server error", "request_id": request_id}
                ),
                status_code=500,
                media_type="application/json",
            )


def setup_middleware(app: FastAPI) -> None:
    """Setup middleware for the application."""
    logger.info("Setting up middleware...")

    # Add CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=settings.ALLOWED_METHODS,
        allow_headers=settings.ALLOWED_HEADERS,
        expose_headers=["X-Request-ID", "X-Process-Time"],
    )

    # Add custom middleware
    app.add_middleware(ResponseTimeMiddleware)
    app.add_middleware(RequestLoggingMiddleware)

    # Setup rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    logger.info(
        "Middleware setup complete",
        extra={
            "rate_limits": limiter._default_limits,
            "cors_origins": settings.ALLOWED_ORIGINS,
        },
    )
