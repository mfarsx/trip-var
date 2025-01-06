from pydantic import BaseModel
from typing import Optional

class GenerationRequest(BaseModel):
    prompt: str
    model_id: Optional[str] = None
    max_tokens: Optional[int] = 1000
    temperature: Optional[float] = 0.7 