"""Standard API response models for consistent response formatting."""

from typing import Generic, TypeVar, Optional, List, Dict, Any
from pydantic import BaseModel, Field

DataT = TypeVar('DataT')  # More descriptive type variable name

class ResponseBase(BaseModel):
    """Base response model for all API responses."""
    success: bool = Field(
        ...,
        description="Indicates if the request was successful"
    )
    message: str = Field(
        ...,
        description="Human-readable message about the response"
    )
    
class DataResponse(ResponseBase, Generic[DataT]):
    """Response model for single-item data responses."""
    data: Optional[DataT] = Field(
        default=None,
        description="The response payload data"
    )
    
class PaginationMeta(BaseModel):
    """Metadata for paginated responses."""
    page: int = Field(default=1, description="Current page number")
    per_page: int = Field(default=10, description="Items per page")
    total: int = Field(default=0, description="Total number of items")
    pages: int = Field(default=1, description="Total number of pages")
    
class ListResponse(ResponseBase, Generic[DataT]):
    """Response model for paginated list data."""
    data: List[DataT] = Field(
        ...,
        description="List of response items"
    )
    meta: PaginationMeta = Field(
        default_factory=PaginationMeta,
        description="Pagination metadata"
    ) 