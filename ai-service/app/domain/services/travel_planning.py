"""Travel planning service for generating personalized travel itineraries."""

import json
from datetime import datetime, date
from typing import Optional, List, Dict, Any
import httpx
from fastapi import HTTPException, status

from app.domain.models.travel import (
    TravelPlanningRequest,
    TravelPlanningResponse,
    TravelPlan,
    DayPlan
)
from app.core.config import get_settings
from app.core.exceptions import LLMServiceError, ValidationError
from app.core.logging import get_logger

logger = get_logger(__name__)
settings = get_settings()

class TravelPlanningService:
    """Service for generating personalized travel plans using LLM."""

    def __init__(self):
        """Initialize the service with configuration."""
        self.base_url = settings.LLM_STUDIO_URL
        logger.debug(f"Initializing TravelPlanningService with LLM URL: {self.base_url}")
        
        self.client = httpx.AsyncClient(
            base_url=self.base_url,
            timeout=120.0,  # 2 minutes timeout for LLM processing
            limits=httpx.Limits(max_keepalive_connections=5, max_connections=10)
        )

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Ensure client is closed on exit."""
        await self.client.aclose()
        logger.debug("Closed HTTP client connection")

    def _create_planning_prompt(self, request: TravelPlanningRequest) -> str:
        """
        Create a detailed prompt for the LLM based on travel preferences.
        
        Args:
            request: The travel planning request containing preferences
            
        Returns:
            str: Formatted prompt for the LLM
        """
        preferences = request.preferences
        days = (preferences.end_date - preferences.start_date).days + 1
        
        logger.debug(
            "Creating planning prompt",
            extra={
                "destination": preferences.destination,
                "days": days,
                "start_date": preferences.start_date.isoformat(),
                "end_date": preferences.end_date.isoformat(),
                "travelers": preferences.num_travelers
            }
        )
        
        # Build base prompt with required information
        prompt_parts = [
            f"Act as a travel planner. Create a {days}-day travel plan in JSON format.",
            "\nPREFERENCES:",
            f"- Destination: {preferences.destination}",
            f"- Dates: {preferences.start_date} to {preferences.end_date}",
            f"- Travelers: {preferences.num_travelers}"
        ]
        
        # Add optional preferences if provided
        optional_fields = {
            "Budget": preferences.budget.value if preferences.budget else None,
            "Interests": ", ".join(preferences.interests) if preferences.interests else None,
            "Accommodation": preferences.accommodation_type.value if preferences.accommodation_type else None,
            "Style": preferences.travel_style.value if preferences.travel_style else None,
            "Special Requests": request.special_requests
        }
        
        prompt_parts.extend(
            f"- {key}: {value}"
            for key, value in optional_fields.items()
            if value is not None
        )
        
        # Add instructions for response format
        prompt_parts.extend([
            "\nINSTRUCTIONS:",
            "1. Return ONLY a valid JSON object with the following structure:",
            "{\n  \"overview\": \"string\",",
            "  \"highlights\": [\"string\"],",
            "  \"daily_plans\": [{",
            "    \"day\": number,",
            "    \"date\": \"YYYY-MM-DD\",",
            "    \"morning\": \"string\",",
            "    \"afternoon\": \"string\",",
            "    \"evening\": \"string\",",
            "    \"accommodation\": \"string\",",
            "    \"transportation\": \"string\",",
            "    \"estimated_cost\": \"string\",",
            "    \"notes\": \"string\"",
            "  }],",
            "  \"total_estimated_cost\": \"string\",",
            "  \"packing_suggestions\": [\"string\"],",
            "  \"travel_tips\": [\"string\"]",
            "}"
        ])
        
        prompt = "\n".join(prompt_parts)
        logger.trace("Generated prompt", extra={"prompt": prompt})
        return prompt

    async def _call_llm_service(self, prompt: str) -> Dict[str, Any]:
        """
        Call the LLM service with the generated prompt.
        
        Args:
            prompt: The formatted prompt for the LLM
            
        Returns:
            Dict[str, Any]: The parsed JSON response from the LLM
            
        Raises:
            LLMServiceError: If there's an error calling the LLM service
            ValidationError: If the response cannot be parsed as JSON
        """
        try:
            logger.debug("Calling LLM service")
            response = await self.client.post(
                "/generate",
                json={"prompt": prompt, "max_tokens": 2000}
            )
            response.raise_for_status()
            
            result = response.json()
            if not isinstance(result, dict):
                logger.error("Invalid response format from LLM", extra={"response": result})
                raise ValidationError("LLM response is not a valid JSON object")
            
            logger.debug("Successfully received LLM response")
            return result
            
        except httpx.HTTPError as e:
            logger.error(
                "HTTP error while calling LLM service",
                extra={
                    "error": str(e),
                    "status_code": getattr(e.response, 'status_code', None),
                    "url": str(e.request.url) if e.request else None
                },
                exc_info=True
            )
            raise LLMServiceError(f"Failed to communicate with LLM service: {str(e)}")
            
        except json.JSONDecodeError as e:
            logger.error(
                "Failed to parse LLM response as JSON",
                extra={"error": str(e), "response_text": response.text},
                exc_info=True
            )
            raise ValidationError(f"Invalid JSON response from LLM: {str(e)}")
            
        except Exception as e:
            logger.error(
                "Unexpected error in LLM service call",
                extra={"error": str(e)},
                exc_info=True
            )
            raise LLMServiceError(f"Unexpected error: {str(e)}")

    async def create_travel_plan(
        self,
        request: TravelPlanningRequest,
        user_id: str
    ) -> TravelPlanningResponse:
        """
        Create a personalized travel plan based on user preferences.
        
        Args:
            request: The travel planning request
            user_id: ID of the requesting user
            
        Returns:
            TravelPlanningResponse: The generated travel plan
            
        Raises:
            HTTPException: If plan generation fails
        """
        try:
            logger.info(
                "Generating travel plan",
                extra={
                    "user_id": user_id,
                    "destination": request.preferences.destination,
                    "start_date": request.preferences.start_date.isoformat(),
                    "end_date": request.preferences.end_date.isoformat()
                }
            )
            
            # Generate and validate the prompt
            prompt = self._create_planning_prompt(request)
            
            # Call LLM service and parse response
            llm_response = await self._call_llm_service(prompt)
            
            # Create response model
            travel_plan = TravelPlan(**llm_response)
            response = TravelPlanningResponse(
                plan=travel_plan,
                message="Travel plan generated successfully"
            )
            
            logger.info(
                "Successfully generated travel plan",
                extra={
                    "user_id": user_id,
                    "destination": request.preferences.destination,
                    "num_days": len(travel_plan.daily_plans)
                }
            )
            return response
            
        except (LLMServiceError, ValidationError) as e:
            logger.error(
                "Failed to generate travel plan",
                extra={
                    "user_id": user_id,
                    "error": str(e),
                    "error_type": e.__class__.__name__
                },
                exc_info=True
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=str(e)
            )
            
        except Exception as e:
            logger.error(
                "Unexpected error in travel plan generation",
                extra={
                    "user_id": user_id,
                    "error": str(e),
                    "error_type": e.__class__.__name__
                },
                exc_info=True
            )
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="An unexpected error occurred while generating the travel plan"
            )