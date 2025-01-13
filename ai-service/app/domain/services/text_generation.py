"""Text generation service for handling text generation requests."""

from app.domain.models import TextGenerationRequest, TextGenerationResponse
from app.core.config import get_settings
import httpx
import logging
from tenacity import retry, stop_after_attempt, wait_exponential

logger = logging.getLogger(__name__)
settings = get_settings()

class TextGenerationService:
    """Service for text generation operations."""
    
    @staticmethod
    @retry(
        stop=stop_after_attempt(settings.LLM_MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=4, max=10)
    )
    async def generate_text(request: TextGenerationRequest) -> TextGenerationResponse:
        """Generate text using the local LLM."""
        llm_url = f"{settings.LLM_STUDIO_URL}/v1/chat/completions"
        
        try:
            messages = [msg.model_dump() for msg in request.messages] if request.messages else [{"role": "user", "content": request.prompt}]
            
            # Add system message for better context if not present
            if not any(msg.get("role") == "system" for msg in messages):
                messages.insert(0, {
                    "role": "system",
                    "content": "You are a helpful AI assistant. Provide detailed, well-structured responses."
                })
            
            async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT) as client:
                response = await client.post(
                    llm_url,
                    json={
                        "model": request.model,
                        "messages": messages,
                        "temperature": request.temperature,
                        "max_tokens": request.max_tokens,
                        "stop": ["\n\n\n"],  # Prevent excessive newlines
                        "frequency_penalty": 0.3,  # Reduce repetition
                        "presence_penalty": 0.3    # Encourage diversity
                    }
                )
                response.raise_for_status()
                result = response.json()
                
                # Handle potential streaming response
                generated_text = result["choices"][0]["message"]["content"]
                
                # Clean up the response
                generated_text = generated_text.strip()
                
                return TextGenerationResponse(
                    text=generated_text,
                    tokens_used=result["usage"]["total_tokens"],
                    model=request.model,
                    finish_reason=result["choices"][0].get("finish_reason", "unknown")
                )
                
        except Exception as e:
            logger.error(f"Error calling local LLM service: {str(e)}")
            raise 