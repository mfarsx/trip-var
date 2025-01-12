"""Travel planning service."""

import logging
import json
from datetime import datetime, date
from typing import Optional, List
import httpx
from app.domain.models.travel import (
    TravelPlanningRequest,
    TravelPlanningResponse,
    TravelPlan,
    DayPlan
)
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class TravelPlanningService:
    def __init__(self):
        self.base_url = settings.LLM_STUDIO_URL
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=120.0)  # Increased timeout for longer responses

    def _create_planning_prompt(self, request: TravelPlanningRequest) -> str:
        """Create a detailed prompt for the LLM based on travel preferences."""
        preferences = request.preferences
        days = (preferences.end_date - preferences.start_date).days + 1

        prompt = f"""Act as a travel planner. Create a {days}-day travel plan in JSON format.

PREFERENCES:
- Destination: {preferences.destination}
- Dates: {preferences.start_date} to {preferences.end_date}
- Travelers: {preferences.num_travelers}"""

        if preferences.budget:
            prompt += f"\n- Budget: {preferences.budget}"
        if preferences.interests:
            prompt += f"\n- Interests: {', '.join(preferences.interests)}"
        if preferences.accommodation_type:
            prompt += f"\n- Accommodation: {preferences.accommodation_type}"
        if preferences.travel_style:
            prompt += f"\n- Style: {preferences.travel_style}"
        if request.special_requests:
            prompt += f"\n- Special Requests: {request.special_requests}"

        prompt += """

INSTRUCTIONS:
1. Return ONLY a valid JSON object
2. Follow this exact format:
{
    "overview": "Brief overview of the trip",
    "highlights": ["Key highlight 1", "Key highlight 2"],
    "daily_plans": [
        {
            "day": 1,
            "date": "YYYY-MM-DD",
            "morning": "Morning activities",
            "afternoon": "Afternoon activities",
            "evening": "Evening activities",
            "accommodation": "Accommodation details",
            "transportation": "Transportation details",
            "estimated_cost": "Cost estimate",
            "notes": "Additional notes"
        }
    ],
    "total_estimated_cost": "Total trip cost",
    "packing_suggestions": ["Item 1", "Item 2"],
    "travel_tips": ["Tip 1", "Tip 2"]
}

Remember to:
- Include realistic activities and times
- Provide specific recommendations
- Keep JSON format valid
- Use actual dates starting from the provided start date"""

        return prompt

    def _parse_llm_response(self, text: str) -> TravelPlan:
        """Parse the LLM's JSON response into a TravelPlan object."""
        try:
            # Remove any markdown code block markers and find the first complete JSON
            text = text.replace("```json", "```").strip()
            json_blocks = text.split("```")
            
            # Find the first valid JSON block
            valid_json = None
            parse_error = None
            
            for block in json_blocks:
                try:
                    # Skip empty blocks or non-JSON content
                    if not block.strip() or "Solution" in block:
                        continue
                        
                    # Find JSON content
                    start = block.find('{')
                    end = block.rfind('}') + 1
                    if start == -1 or end == 0:
                        continue
                        
                    json_content = block[start:end]
                    data = json.loads(json_content)
                    
                    # If we found valid JSON with required fields, use it
                    if all(field in data for field in ["overview", "highlights", "daily_plans"]):
                        valid_json = data
                        break
                except Exception as e:
                    parse_error = e
                    continue
            
            if not valid_json:
                if parse_error:
                    raise ValueError(f"Failed to parse any JSON block: {str(parse_error)}")
                raise ValueError("No valid JSON content found in response")
            
            # Convert date strings to date objects in daily plans
            for day_plan in valid_json.get("daily_plans", []):
                if "date" in day_plan:
                    try:
                        day_plan["date"] = datetime.strptime(day_plan["date"], "%Y-%m-%d").date()
                    except ValueError as e:
                        logger.error(f"Date parsing error: {str(e)}")
                        raise ValueError(f"Invalid date format in day plan: {str(e)}")
            
            return TravelPlan(**valid_json)
        except Exception as e:
            logger.error(f"Failed to parse LLM response: {str(e)}\nResponse text: {text}", exc_info=True)
            raise ValueError(f"Failed to create travel plan: {str(e)}")

    async def create_travel_plan(
        self,
        request: TravelPlanningRequest,
        user_id: Optional[str] = None
    ) -> TravelPlanningResponse:
        """Generate a travel plan based on the given preferences."""
        try:
            prompt = self._create_planning_prompt(request)
            
            # Call the LLM Studio completions endpoint
            response = await self.client.post(
                "/v1/completions",
                json={
                    "model": "phi-4",
                    "prompt": prompt,
                    "max_tokens": 2000,
                    "temperature": 0.3,  # Lower temperature for more focused output
                    "top_p": 1,
                    "frequency_penalty": 0,
                    "presence_penalty": 0,
                    "stop": None  # Remove stop tokens to get complete response
                }
            )
            response.raise_for_status()
            result = response.json()
            
            # Log the raw response for debugging
            logger.debug(f"LLM Response: {result}")
            
            # Extract and validate the generated text
            if not result.get("choices"):
                logger.error("No choices in LLM response")
                raise ValueError("Invalid response from language model")
                
            generated_text = result["choices"][0].get("text", "").strip()
            if not generated_text:
                logger.error("Empty text in LLM response")
                raise ValueError("No content generated by language model")
                
            # Log the generated text for debugging
            logger.debug(f"Generated text: {generated_text}")

            # Parse the response into a TravelPlan
            travel_plan = self._parse_llm_response(generated_text)
            
            return TravelPlanningResponse(
                plan=travel_plan,
                message="Travel plan created successfully"
            )
        except Exception as e:
            logger.error(f"Travel planning failed: {str(e)}", exc_info=True)
            if isinstance(e, httpx.HTTPError):
                raise ValueError(f"Failed to communicate with language model: {str(e)}")
            raise ValueError(f"Failed to create travel plan: {str(e)}")

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose() 