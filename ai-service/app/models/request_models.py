from pydantic import BaseModel, Field
from typing import Optional

class GenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="Text prompt to generate from")
    model_id: Optional[str] = None
    max_tokens: Optional[int] = 1000
    conversation_id: Optional[str] = None
    include_history: Optional[bool] = True

    class Config:
        json_schema_extra = {
            "example": {
                "prompt": "Write a story about",
                "model_id": "gpt2",
                "max_tokens": 100,
                "conversation_id": "conv_123",
                "include_history": True
            }
        } 