from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TextGenerationRequest(BaseModel):
    prompt: str
    system_prompt: Optional[str] = None

class TextGenerationResponse(BaseModel):
    text: str

class HistoryResponse(BaseModel):
    id: str
    prompt: str
    response: str
    created_at: datetime
    
    class Config:
        from_attributes = True 