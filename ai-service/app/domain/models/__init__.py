"""Domain models package."""

from .api import (
    DataResponse,
    ListResponse,
    LoginResponse,
    TextGenerationRequest,
    TextGenerationResponse,
    Token,
    TokenData,
    TravelPlanningRequest,
    TravelPlanningResponse,
    User,
    UserBase,
    UserCreate,
    UserResponse,
    UserUpdate,
)
from .db import (
    DBModelBase,
    GenerationHistoryEntry,
    PyObjectId,
    TravelPlanInDB,
    UserInDB,
)
from .domain import (
    AccommodationType,
    BudgetLevel,
    DayPlan,
    Message,
    TravelPlan,
    TravelPreferences,
    TravelStyle,
)

__all__ = [
    # Domain Models
    "Message",
    "TravelPreferences",
    "TravelPlan",
    "DayPlan",
    "BudgetLevel",
    "AccommodationType",
    "TravelStyle",
    # API Models
    "UserBase",
    "UserCreate",
    "UserUpdate",
    "User",
    "UserResponse",
    "Token",
    "TokenData",
    "LoginResponse",
    "TextGenerationRequest",
    "TextGenerationResponse",
    "TravelPlanningRequest",
    "TravelPlanningResponse",
    "DataResponse",
    "ListResponse",
    # Database Models
    "PyObjectId",
    "DBModelBase",
    "UserInDB",
    "GenerationHistoryEntry",
    "TravelPlanInDB",
]
