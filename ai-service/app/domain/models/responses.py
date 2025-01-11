"""Standard API response models."""

from typing import Generic, TypeVar, Optional, List, Dict, Any
from pydantic import BaseModel

T = TypeVar('T')

class ResponseBase(BaseModel):
    """Base response model."""
    success: bool
    message: str
    
class DataResponse(ResponseBase, Generic[T]):
    """Response model with data."""
    data: Optional[T] = None
    
class ListResponse(ResponseBase, Generic[T]):
    """Response model for list data with pagination."""
    data: List[T]
    meta: Dict[str, Any] = {
        "page": 1,
        "per_page": 10,
        "total": 0,
        "pages": 1
    } 