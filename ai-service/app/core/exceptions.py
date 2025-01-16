"""Custom exception classes."""

from fastapi import HTTPException, status


class AppException(Exception):
    """Base application exception."""

    def __init__(self, message: str):
        self.message = message
        super().__init__(self.message)


class ValidationError(AppException):
    """Validation error exception."""

    def __init__(self, message: str = "Validation error"):
        super().__init__(message)

    def to_http(self) -> HTTPException:
        """Convert to HTTPException."""
        return HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=self.message
        )


class LLMServiceError(AppException):
    """Exception for LLM service related errors."""

    def __init__(self, message: str = "LLM service error"):
        super().__init__(message)

    def to_http(self) -> HTTPException:
        """Convert to HTTPException."""
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=self.message
        )


class NotFoundError(AppException):
    """Not found error exception."""

    def __init__(self, message: str = "Resource not found"):
        super().__init__(message)

    def to_http(self) -> HTTPException:
        """Convert to HTTPException."""
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=self.message)


class AuthenticationError(AppException):
    """Authentication error exception."""

    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message)

    def to_http(self) -> HTTPException:
        """Convert to HTTPException."""
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=self.message
        )


class AuthorizationError(AppException):
    """Authorization error exception."""

    def __init__(self, message: str = "Not authorized"):
        super().__init__(message)

    def to_http(self) -> HTTPException:
        """Convert to HTTPException."""
        return HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=self.message)


class DatabaseError(AppException):
    """Database error exception."""

    def __init__(self, message: str = "Database error"):
        super().__init__(message)

    def to_http(self) -> HTTPException:
        """Convert to HTTPException."""
        return HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=self.message
        )
