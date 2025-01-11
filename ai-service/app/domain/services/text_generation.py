"""Text generation service."""

import logging
from typing import Optional
from app.domain.models.text import TextGenerationRequest, TextGenerationResponse

logger = logging.getLogger(__name__)

class TextGenerationService:
    async def generate(
        self,
        prompt: str,
        max_tokens: int = 100,
        temperature: float = 0.7,
        model: str = "phi-4",
        user_id: Optional[str] = None
    ) -> TextGenerationResponse:
        """Generate text using the specified model."""
        try:
            # Here you would integrate with your AI model
            # This is a mock implementation
            return TextGenerationResponse(
                text=f"Generated text for prompt: {prompt}",
                tokens_used=len(prompt.split()),
                model=model
            )
        except Exception as e:
            logger.error(f"Text generation failed: {str(e)}", exc_info=True)
            raise

    async def get_history(self, user_id: str):
        """Get generation history for a user."""
        # Implement history retrieval from database
        return [] 