"""Text generation repository."""

from typing import List
from app.domain.models.text import TextGenerationResponse
from app.core.mongodb import MongoDB
from bson import ObjectId

class TextGenerationRepository:
    """Text generation repository."""

    COLLECTION = "text_generations"

    async def create(self, generation: TextGenerationResponse) -> TextGenerationResponse:
        """Create new text generation record."""
        result = await MongoDB.db[self.COLLECTION].insert_one(generation.dict())
        generation.id = str(result.inserted_id)
        return generation

    async def get_by_user_id(self, user_id: str) -> List[TextGenerationResponse]:
        """Get text generations by user ID."""
        cursor = MongoDB.db[self.COLLECTION].find({"user_id": user_id})
        generations = await cursor.to_list(length=None)
        return [TextGenerationResponse(**gen) for gen in generations]

    async def get_by_id(self, generation_id: str) -> TextGenerationResponse:
        """Get text generation by ID."""
        result = await MongoDB.db[self.COLLECTION].find_one(
            {"_id": ObjectId(generation_id)}
        )
        if result:
            return TextGenerationResponse(**result)
        return None 