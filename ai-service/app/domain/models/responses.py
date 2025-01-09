"""Common response models."""

from typing import TypeVar, Generic, Optional, List, Dict, Any
from pydantic import BaseModel

T = TypeVar('T')

class TokenData(BaseModel):
    """Token data model."""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 3600  # 1 hour in seconds

class DataResponse(BaseModel, Generic[T]):
    """Generic data response model."""
    success: bool = True
    message: str
    data: T
    errors: Optional[List[Dict[str, Any]]] = None
    code: Optional[str] = None
    status_code: Optional[int] = None

class PaginatedResponse(BaseModel, Generic[T]):
    """Generic paginated response model."""
    success: bool = True
    message: str
    data: List[T]
    total: int
    page: int
    size: int
    pages: int
    errors: Optional[List[Dict[str, Any]]] = None
    code: Optional[str] = None
    status_code: Optional[int] = None

class AuthResponse(BaseModel, Generic[T]):
    """Generic authentication response model."""
    success: bool = True
    message: str
    data: T
    token: Optional[TokenData] = None
    errors: Optional[List[Dict[str, Any]]] = None
    code: Optional[str] = None
    status_code: Optional[int] = None 