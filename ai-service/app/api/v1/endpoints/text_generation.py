"""Text generation endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user
from app.domain.models.text import TextGenerationRequest, TextGenerationResponse
from app.domain.services.text_generation import TextGenerationService
from app.domain.models.user import User

router = APIRouter()

@router.post("/generate", response_model=TextGenerationResponse)
async def generate_text(
    request: TextGenerationRequest,
    current_user: User = Depends(get_current_user),
    text_service: TextGenerationService = Depends()
):
    """Generate text based on the input prompt."""
    try:
        response = await text_service.generate(request, current_user)
        return response
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/history")
async def get_generation_history(
    current_user: User = Depends(get_current_user),
    text_service: TextGenerationService = Depends()
):
    """Get text generation history for the current user."""
    try:
        history = await text_service.get_history(current_user.id)
        return history
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        ) 