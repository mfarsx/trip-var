"""Travel planning endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.domain.services.travel_planning import TravelPlanningService
from app.domain.models.travel import TravelPlanningRequest, TravelPlanningResponse
from app.domain.models.responses import DataResponse
from app.domain.models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/plan", response_model=DataResponse[TravelPlanningResponse])
async def create_travel_plan(
    request: TravelPlanningRequest,
    current_user: User = Depends(get_current_user),
    travel_planner: TravelPlanningService = Depends()
):
    """Create a personalized travel plan based on preferences."""
    try:
        result = await travel_planner.create_travel_plan(
            request=request,
            user_id=current_user.id
        )
        
        return DataResponse(
            data=result,
            message="Travel plan created successfully",
            success=True
        )
    except Exception as e:
        logger.error(f"Error creating travel plan: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create travel plan: {str(e)}"
        ) 