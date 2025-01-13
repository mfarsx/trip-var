"""API request and response models."""

from pydantic import BaseModel, Field, EmailStr, ConfigDict, model_validator
from typing import Optional, List, Generic, TypeVar, Dict, Any
from datetime import datetime
from .domain import Message, TravelPreferences, TravelPlan

# Generic type variable for response data
T = TypeVar('T')

class UserBase(BaseModel):
    """Base user model."""
    email: EmailStr
    full_name: str

class UserCreate(UserBase):
    """User creation request model."""
    password: str

class UserUpdate(BaseModel):
    """User update request model."""
    password: Optional[str] = None
    full_name: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class User(UserBase):
    """User model."""
    id: str
    is_active: bool
    is_superuser: bool = False

    model_config = ConfigDict(from_attributes=True)

class UserResponse(User):
    """User response model."""
    preferences: Dict[str, Any] = Field(default_factory=dict)

class Token(BaseModel):
    """Token response model."""
    access_token: str
    token_type: str

class LoginResponse(BaseModel):
    """Login response model."""
    access_token: str
    token_type: str
    user: UserResponse

class TokenData(BaseModel):
    """Token data model."""
    email: str

class Message(BaseModel):
    """Chat message model."""
    role: str
    content: str

class TextGenerationRequest(BaseModel):
    """Text generation request model."""
    prompt: Optional[str] = None
    messages: Optional[List[Message]] = None
    max_tokens: int = Field(default=2000, ge=1, le=4000)
    temperature: float = Field(default=0.7, ge=0.1, le=1.0)
    model: str = "phi-4"

    def get_formatted_prompt(self) -> str:
        """Get formatted prompt from messages or prompt."""
        if self.messages:
            return "\n".join([f"{msg.role}: {msg.content}" for msg in self.messages])
        if not self.prompt:
            raise ValueError("Either prompt or messages must be provided")
        return self.prompt

    @model_validator(mode='after')
    def check_prompt_or_messages(self):
        """Validate that either prompt or messages is provided."""
        if not self.prompt and not self.messages:
            raise ValueError("Either prompt or messages must be provided")
        return self

class TextGenerationResponse(BaseModel):
    """Text generation response model."""
    text: str
    tokens_used: int
    model: str
    finish_reason: str

class TravelPlanningRequest(BaseModel):
    """Travel planning request model."""
    preferences: TravelPreferences
    special_requests: Optional[str] = None

class TravelPlanningResponse(BaseModel):
    """Travel planning response model."""
    plan: TravelPlan
    message: str

class DataResponse(BaseModel, Generic[T]):
    """Generic data response model."""
    success: bool = True
    message: str
    data: Optional[T] = None

class ListResponse(BaseModel, Generic[T]):
    """Generic list response model with pagination."""
    success: bool = True
    message: str
    data: List[T]
    total: int
    page: int
    per_page: int 