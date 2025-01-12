"""Text generation service."""

import logging
import httpx
from typing import Optional
from app.domain.models.text import TextGenerationRequest, TextGenerationResponse
from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

class TextGenerationService:
    def __init__(self):
        self.base_url = settings.LLM_STUDIO_URL
        self.client = httpx.AsyncClient(base_url=self.base_url, timeout=60.0)

    async def generate(
        self,
        request: TextGenerationRequest,
        user_id: Optional[str] = None
    ) -> TextGenerationResponse:
        """Generate text using the specified model."""
        try:
            # Get formatted prompt from request
            prompt = request.get_formatted_prompt()
            
            # Call the LLM Studio completions endpoint
            response = await self.client.post(
                "/v1/completions",
                json={
                    "model": request.model,
                    "prompt": prompt,
                    "max_tokens": request.max_tokens,
                    "temperature": request.temperature,
                }
            )
            response.raise_for_status()
            result = response.json()

            # Extract the generated text from the response
            generated_text = result["choices"][0]["text"] if result.get("choices") else ""
            tokens_used = result.get("usage", {}).get("total_tokens", 0)

            return TextGenerationResponse(
                text=generated_text,
                tokens_used=tokens_used,
                model=request.model
            )
        except Exception as e:
            logger.error(f"Text generation failed: {str(e)}", exc_info=True)
            raise

    async def get_history(self, user_id: str):
        """Get generation history for a user."""
        # Implement history retrieval from database
        return []

    async def close(self):
        """Close the HTTP client."""
        await self.client.aclose() 