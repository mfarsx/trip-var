"""Text generation service."""

from typing import List
from app.domain.models.text import TextGenerationRequest, TextGenerationResponse, GenerationHistory
from app.domain.models.user import User
from app.core.config import settings
from app.domain.repositories.text_generation import TextGenerationRepository
from app.core.llm import LLMClient

class TextGenerationService:
    """Text generation service."""

    def __init__(self):
        """Initialize service."""
        self.repo = TextGenerationRepository()
        self.llm_client = LLMClient(settings.LLM_STUDIO_URL, settings.HF_API_KEY)

    async def generate(
        self, request: TextGenerationRequest, user: User
    ) -> TextGenerationResponse:
        """Generate text and save to history."""
        # Generate text using LLM
        generated_text = await self.llm_client.generate(
            prompt=request.prompt,
            max_length=request.max_length,
            temperature=request.temperature,
            top_p=request.top_p,
            model=request.model
        )

        # Create response object
        response = TextGenerationResponse(
            prompt=request.prompt,
            generated_text=generated_text,
            model=request.model or "default",
            user_id=user.id,
            metadata={
                "max_length": request.max_length,
                "temperature": request.temperature,
                "top_p": request.top_p
            }
        )

        # Save to history
        await self.repo.create(response)
        return response

    async def get_history(self, user_id: str) -> GenerationHistory:
        """Get generation history for user."""
        items = await self.repo.get_by_user_id(user_id)
        return GenerationHistory(
            total=len(items),
            items=items
        ) 