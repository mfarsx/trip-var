"""Core domain models for business logic."""

from pydantic import BaseModel, Field, field_validator, ValidationInfo
from typing import List, Optional
from datetime import date as DateType
from enum import Enum

class Message(BaseModel):
    """Chat message model."""
    role: str
    content: str

class BudgetLevel(str, Enum):
    """Standardized budget levels for travel planning."""
    BUDGET = "budget"
    MID_RANGE = "mid-range"
    LUXURY = "luxury"

class AccommodationType(str, Enum):
    """Standardized accommodation types."""
    HOTEL = "hotel"
    HOSTEL = "hostel"
    APARTMENT = "apartment"
    RESORT = "resort"
    GUESTHOUSE = "guesthouse"

class TravelStyle(str, Enum):
    """Standardized travel styles."""
    RELAXED = "relaxed"
    ADVENTUROUS = "adventurous"
    CULTURAL = "cultural"
    LUXURY = "luxury"
    BUDGET = "budget"

class TravelPreferences(BaseModel):
    """Travel preferences model with validation."""
    destination: str = Field(
        ..., 
        min_length=2,
        max_length=100,
        description="Destination city or country"
    )
    start_date: DateType = Field(..., description="Start date of the trip")
    end_date: DateType = Field(..., description="End date of the trip")
    budget: Optional[BudgetLevel] = Field(None, description="Budget level for the trip")
    interests: List[str] = Field(
        default=[],
        max_items=10,
        description="List of interests (e.g., 'history', 'food', 'nature')"
    )
    accommodation_type: Optional[AccommodationType] = Field(
        None,
        description="Preferred accommodation type"
    )
    travel_style: Optional[TravelStyle] = Field(
        None,
        description="Preferred travel style"
    )
    num_travelers: int = Field(
        default=1,
        ge=1,
        le=20,
        description="Number of travelers (max 20)"
    )

    @field_validator('end_date')
    def validate_dates(cls, v: DateType, info: ValidationInfo) -> DateType:
        """Ensure end_date is after start_date."""
        if info.data.get('start_date') and v < info.data['start_date']:
            raise ValueError("End date must be after start date")
        return v

    @field_validator('interests')
    def validate_interests(cls, v: List[str]) -> List[str]:
        """Validate and clean interest tags."""
        return [interest.lower().strip() for interest in v if interest.strip()]

class DayPlan(BaseModel):
    """Detailed plan for a single day of the trip."""
    day: int = Field(..., ge=1, description="Day number of the trip")
    date: DateType = Field(..., description="Date of this day's activities")
    morning: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="Morning activities and recommendations"
    )
    afternoon: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="Afternoon activities and recommendations"
    )
    evening: str = Field(
        ...,
        min_length=10,
        max_length=500,
        description="Evening activities and recommendations"
    )
    accommodation: str = Field(
        ...,
        min_length=10,
        max_length=200,
        description="Accommodation recommendation for the night"
    )
    transportation: str = Field(
        ...,
        min_length=10,
        max_length=200,
        description="Transportation recommendations for the day"
    )
    estimated_cost: Optional[str] = Field(
        None,
        max_length=100,
        description="Estimated cost for the day's activities"
    )
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Additional notes or tips for the day"
    )

class TravelPlan(BaseModel):
    """Complete travel itinerary with daily plans and recommendations."""
    overview: str = Field(
        ...,
        min_length=50,
        max_length=1000,
        description="Overview of the entire trip"
    )
    highlights: List[str] = Field(
        ...,
        min_items=1,
        max_items=10,
        description="Key highlights of the trip"
    )
    daily_plans: List[DayPlan] = Field(
        ...,
        min_items=1,
        max_items=30,
        description="Detailed day-by-day plans"
    )
    total_estimated_cost: Optional[str] = Field(
        None,
        max_length=100,
        description="Total estimated cost for the trip"
    )
    packing_suggestions: List[str] = Field(
        default=[],
        max_items=20,
        description="Suggested items to pack"
    )
    travel_tips: List[str] = Field(
        default=[],
        max_items=10,
        description="General travel tips for the destination"
    )

    @field_validator('daily_plans')
    def validate_daily_plans(cls, v: List[DayPlan]) -> List[DayPlan]:
        """Ensure daily plans are in sequence and dates match."""
        if not v:
            return v
        for i, plan in enumerate(v, 1):
            if plan.day != i:
                raise ValueError(f"Day plans must be in sequence. Expected day {i}, got {plan.day}")
        return v 