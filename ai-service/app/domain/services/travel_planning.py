"""Travel planning service for handling travel plan generation."""

from datetime import datetime, timezone

import httpx

from app.core.config import get_settings
from app.core.mongodb import get_db
from app.domain.models import (
    TravelPlan,
    TravelPlanInDB,
    TravelPlanningRequest,
    TravelPlanningResponse,
    User,
)

settings = get_settings()


class TravelPlanningService:
    """Service for travel planning operations."""

    @staticmethod
    async def create_plan(
        request: TravelPlanningRequest, user: User
    ) -> TravelPlanningResponse:
        """Create a travel plan based on user preferences."""
        # Call LLM API to generate plan
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{settings.LLM_STUDIO_URL}/travel/plan",
                json={
                    "preferences": request.preferences.model_dump(),
                    "special_requests": request.special_requests,
                },
                timeout=settings.LLM_TIMEOUT,
            )
            response.raise_for_status()
            result = response.json()

        # Create travel plan
        plan = TravelPlan(**result["plan"])

        # Save to database
        db = await get_db()
        plan_db = TravelPlanInDB(
            user_id=user.id,
            destination=request.preferences.destination,
            start_date=request.preferences.start_date,
            end_date=request.preferences.end_date,
            plan_data=plan.model_dump(),
            status="draft",
            metadata={
                "budget_level": (
                    request.preferences.budget.value
                    if request.preferences.budget
                    else None
                ),
                "num_travelers": request.preferences.num_travelers,
                "special_requests": request.special_requests,
            },
        )
        await db.travel_plans.insert_one(plan_db.model_dump(by_alias=True))

        # Create response
        return TravelPlanningResponse(
            plan=plan, message="Travel plan created successfully"
        )
