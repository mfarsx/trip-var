"""Database schema models."""

from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List, Any, Annotated
from datetime import datetime
from bson import ObjectId

class PyObjectId(str):
    """Custom type for handling MongoDB ObjectId."""
    
    @classmethod
    def __get_validators__(cls):
        yield cls.validate

    @classmethod
    def validate(cls, v):
        if not ObjectId.is_valid(v):
            raise ValueError("Invalid ObjectId")
        return str(ObjectId(v))

    @classmethod
    def __get_pydantic_json_schema__(cls, _schema_generator):
        """Customize JSON schema for ObjectId."""
        return {
            "type": "string",
            "description": "MongoDB ObjectId",
            "pattern": "^[0-9a-fA-F]{24}$"
        }

class DBModelBase(BaseModel):
    """Base model for database models with ID handling."""
    id: Optional[Annotated[str, PyObjectId]] = Field(default=None, alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(
        populate_by_name=True,
        arbitrary_types_allowed=True,
        json_schema_extra={
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z"
            }
        }
    )

class UserInDB(DBModelBase):
    """User model for database storage."""
    email: EmailStr
    hashed_password: str
    full_name: str
    is_active: bool = True
    is_superuser: bool = False
    preferences: dict = Field(default_factory=dict)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "email": "user@example.com",
                "full_name": "John Doe",
                "is_active": True,
                "is_superuser": False,
                "preferences": {},
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z"
            }
        }
    )

class GenerationHistoryEntry(DBModelBase):
    """Text generation history entry for database storage."""
    user_id: Annotated[str, PyObjectId]
    prompt: str
    response: str
    model: str
    tokens_used: int
    metadata: dict = Field(default_factory=dict)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "user_id": "507f1f77bcf86cd799439012",
                "prompt": "What is the capital of France?",
                "response": "The capital of France is Paris.",
                "model": "phi-4",
                "tokens_used": 8,
                "metadata": {
                    "temperature": 0.7,
                    "max_tokens": 100
                },
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z"
            }
        }
    )

class TravelPlanInDB(DBModelBase):
    """Travel plan model for database storage."""
    user_id: Annotated[str, PyObjectId]
    destination: str
    start_date: datetime
    end_date: datetime
    plan_data: dict
    status: str = "draft"  # draft, confirmed, completed, cancelled
    metadata: dict = Field(default_factory=dict)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "id": "507f1f77bcf86cd799439011",
                "user_id": "507f1f77bcf86cd799439012",
                "destination": "Paris, France",
                "start_date": "2024-06-01T00:00:00Z",
                "end_date": "2024-06-07T00:00:00Z",
                "plan_data": {},
                "status": "draft",
                "metadata": {
                    "budget_level": "mid-range",
                    "num_travelers": 2
                },
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-01T00:00:00Z"
            }
        }
    ) 