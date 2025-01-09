"""Text generation models."""

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

class TextGenerationRequest(BaseModel):
    """Text generation request model."""
    prompt: str = Field(..., min_length=1)
    max_length: Optional[int] = Field(default=100, ge=1, le=1000)
    temperature: Optional[float] = Field(default=0.7, ge=0.1, le=1.0)
    top_p: Optional[float] = Field(default=0.9, ge=0.1, le=1.0)
    model: Optional[str] = None

class TextGenerationResponse(BaseModel):
    """Text generation response model."""
    id: str = Field(default_factory=lambda: str(ObjectId()))
    prompt: str
    generated_text: str
    model: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    user_id: str
    metadata: dict = Field(default_factory=dict)

    class Config:
        json_encoders = {ObjectId: str}

class GenerationHistory(BaseModel):
    """Generation history model."""
    total: int
    items: List[TextGenerationResponse] 