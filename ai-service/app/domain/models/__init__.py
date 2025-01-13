"""Domain models package."""

from .domain import (
    Message,
    TravelPreferences,
    TravelPlan,
    DayPlan,
    BudgetLevel,
    AccommodationType,
    TravelStyle
)

from .api import (
    UserBase,
    UserCreate,
    UserUpdate,
    User,
    UserResponse,
    Token,
    TokenData,
    LoginResponse,
    TextGenerationRequest,
    TextGenerationResponse,
    TravelPlanningRequest,
    TravelPlanningResponse,
    DataResponse,
    ListResponse
)

from .db import (
    PyObjectId,
    DBModelBase,
    UserInDB,
    GenerationHistoryEntry,
    TravelPlanInDB
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
    "TravelPlanInDB"
] 