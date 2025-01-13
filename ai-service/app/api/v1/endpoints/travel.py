"""Travel planning endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from app.domain.models import (
    TravelPlanningRequest,
    TravelPlanningResponse,
    DataResponse,
    User
)
from app.domain.services.travel_planning import TravelPlanningService
from app.core.dependencies import get_current_user

router = APIRouter()

@router.post("/plan", response_model=DataResponse[TravelPlanningResponse])
async def create_travel_plan(
    request: TravelPlanningRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a travel plan based on user preferences."""
    try:
        plan = await TravelPlanningService.create_plan(request, current_user)
        return DataResponse(
            success=True,
            message="Travel plan created successfully",
            data=plan
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 