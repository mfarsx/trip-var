from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import date as DateType

class TravelPreferences(BaseModel):
    destination: str = Field(..., description="Destination city or country")
    start_date: DateType = Field(..., description="Start date of the trip")
    end_date: DateType = Field(..., description="End date of the trip")
    budget: Optional[str] = Field(None, description="Budget range (e.g., 'budget', 'mid-range', 'luxury')")
    interests: List[str] = Field(default=[], description="List of interests (e.g., 'history', 'food', 'nature')")
    accommodation_type: Optional[str] = Field(None, description="Preferred accommodation type (e.g., 'hotel', 'hostel', 'apartment')")
    travel_style: Optional[str] = Field(None, description="Travel style (e.g., 'relaxed', 'adventurous', 'cultural')")
    num_travelers: int = Field(default=1, ge=1, description="Number of travelers")

class DayPlan(BaseModel):
    day: int = Field(..., description="Day number of the trip")
    date: DateType = Field(..., description="Date of this day's activities")
    morning: str = Field(..., description="Morning activities and recommendations")
    afternoon: str = Field(..., description="Afternoon activities and recommendations")
    evening: str = Field(..., description="Evening activities and recommendations")
    accommodation: str = Field(..., description="Accommodation recommendation for the night")
    transportation: str = Field(..., description="Transportation recommendations for the day")
    estimated_cost: Optional[str] = Field(None, description="Estimated cost for the day's activities")
    notes: Optional[str] = Field(None, description="Additional notes or tips for the day")

class TravelPlan(BaseModel):
    overview: str = Field(..., description="Overview of the entire trip")
    highlights: List[str] = Field(..., description="Key highlights of the trip")
    daily_plans: List[DayPlan] = Field(..., description="Detailed day-by-day plans")
    total_estimated_cost: Optional[str] = Field(None, description="Total estimated cost for the trip")
    packing_suggestions: List[str] = Field(default=[], description="Suggested items to pack")
    travel_tips: List[str] = Field(default=[], description="General travel tips for the destination")

class TravelPlanningRequest(BaseModel):
    preferences: TravelPreferences = Field(..., description="Travel preferences and requirements")
    special_requests: Optional[str] = Field(None, description="Any special requests or considerations")

class TravelPlanningResponse(BaseModel):
    plan: TravelPlan = Field(..., description="Generated travel plan")
    message: Optional[str] = Field(None, description="Additional message or notes about the plan") 