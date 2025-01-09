from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class Message(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime = datetime.utcnow()

class ChatHistory(BaseModel):
    id: str
    messages: List[Message]
    model_id: Optional[str]
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow() 