"""User models."""

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime
from bson import ObjectId

class UserBase(BaseModel):
    """Base user model."""
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    """User creation model."""
    password: str

class UserInDB(UserBase):
    """User database model."""
    id: str = Field(default_factory=lambda: str(ObjectId()))
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        json_encoders = {ObjectId: str}

class User(UserBase):
    """User response model."""
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        json_encoders = {ObjectId: str} 