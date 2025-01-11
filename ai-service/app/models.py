from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Base models
class BaseResponse(BaseModel):
    success: bool = True
    message: Optional[str] = None

# User models
class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class User(UserBase):
    id: str
    is_active: bool = True
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserResponse(BaseResponse):
    data: User

# Auth models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenResponse(BaseResponse):
    data: Token

# Text generation models
class TextGenerationRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    max_tokens: int = Field(default=100, ge=1, le=2000)
    temperature: float = Field(default=0.7, ge=0.0, le=1.0)
    model: str = "gpt-3.5-turbo"

class TextGenerationResult(BaseModel):
    text: str
    tokens_used: int
    model: str

class TextGenerationResponse(BaseResponse):
    data: TextGenerationResult 