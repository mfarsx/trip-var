"""Text generation endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.core.dependencies import get_current_user, get_text_generator
from app.domain.services.text_generation import TextGenerationService
from app.domain.models.text import TextGenerationRequest, TextGenerationResponse
from app.domain.models.responses import DataResponse
from app.domain.models.user import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()

@router.post("/generate", response_model=DataResponse[TextGenerationResponse])
async def generate_text(
    request: TextGenerationRequest,
    current_user: User = Depends(get_current_user),
    text_generator: TextGenerationService = Depends(get_text_generator)
):
    """Generate text based on prompt"""
    try:
        result = await text_generator.generate(
            prompt=request.prompt,
            max_tokens=request.max_tokens,
            temperature=request.temperature,
            model=request.model,
            user_id=current_user.id
        )
        
        return DataResponse(
            data=result,
            message="Text generated successfully",
            success=True
        )
    except Exception as e:
        logger.error(f"Error generating text: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate text: {str(e)}"
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
        logger.error(f"Error fetching history: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error fetching history: {str(e)}"
        )

@router.get("/models")
async def list_models():
    """List available models for text generation."""
    return {
        "models": {
            "phi-4": {
                "name": "Phi-4",
                "provider": "local_llm",
                "max_tokens": -1,
                "description": "Microsoft's Phi-4 model running locally"
            }
        }
    } 