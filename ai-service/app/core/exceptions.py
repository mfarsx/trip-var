from typing import Optional, List, Dict, Any
from fastapi import HTTPException, status
from pydantic import BaseModel

class ErrorCode:
    """Error codes for the application."""
    VALIDATION_ERROR = "VALIDATION_ERROR"
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR"
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    INVALID_TOKEN = "INVALID_TOKEN"
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED"

class AppException(HTTPException):
    """Base exception for application-specific errors."""
    def __init__(
        self,
        status_code: int,
        message: str,
        code: str,
        errors: Optional[List[Dict[str, Any]]] = None
    ):
        self.status_code = status_code
        self.message = message
        self.code = code
        self.errors = errors or []
        super().__init__(status_code=status_code, detail=self.to_dict())

    def to_dict(self) -> Dict[str, Any]:
        """Convert exception to dictionary format."""
        return {
            "success": False,
            "message": self.message,
            "errors": self.errors,
            "code": self.code,
            "status_code": self.status_code
        }

# Alias for backward compatibility
CustomException = AppException

class ValidationError(AppException):
    """Exception for validation errors."""
    def __init__(self, message: str, errors: Optional[List[Dict[str, Any]]] = None):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            message=message,
            code=ErrorCode.VALIDATION_ERROR,
            errors=errors
        )

class AuthenticationError(AppException):
    """Exception for authentication errors."""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            message=message,
            code=ErrorCode.AUTHENTICATION_ERROR
        )

class AuthorizationError(AppException):
    """Exception for authorization errors."""
    def __init__(self, message: str = "Not authorized"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            message=message,
            code=ErrorCode.AUTHORIZATION_ERROR
        )

class NotFoundError(AppException):
    """Exception for not found errors."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            message=message,
            code=ErrorCode.NOT_FOUND
        )

class ConflictError(AppException):
    """Exception for conflict errors."""
    def __init__(self, message: str = "Resource conflict"):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            message=message,
            code=ErrorCode.CONFLICT
        )

class RateLimitExceeded(AppException):
    """Exception for rate limit exceeded."""
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            message=message,
            code=ErrorCode.RATE_LIMIT_EXCEEDED
        ) 