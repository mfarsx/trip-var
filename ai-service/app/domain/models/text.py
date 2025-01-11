from pydantic import BaseModel, Field
from typing import Optional

class TextGenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    max_tokens: int = Field(default=100, ge=1, le=2000)
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    model: str = "phi-4"

class TextGenerationResponse(BaseModel):
    text: str
    tokens_used: int
    model: str

class GenerationHistoryEntry(BaseModel):
    id: str
    user_id: str
    prompt: str
    response: str
    model: str
    created_at: str 