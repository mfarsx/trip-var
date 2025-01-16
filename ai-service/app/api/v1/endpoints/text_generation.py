"""Text generation endpoints."""

from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user
from app.core.exceptions import LLMServiceError
from app.domain.models import (
    DataResponse,
    TextGenerationRequest,
    TextGenerationResponse,
    User,
)
from app.domain.services.text_generation import TextGenerationService

router = APIRouter()


@router.post("/generate", response_model=DataResponse[TextGenerationResponse])
async def generate_text(
    request: TextGenerationRequest, current_user: User = Depends(get_current_user)
):
    """Generate text based on the provided prompt."""
    try:
        response = await TextGenerationService.generate_text(request)
        return DataResponse(
            success=True, message="Text generated successfully", data=response
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except LLMServiceError as e:
        raise HTTPException(status_code=e.status_code, detail=str(e))
