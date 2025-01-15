"""Text generation service for handling text generation requests."""

from fastapi import HTTPException
from app.domain.models import TextGenerationRequest, TextGenerationResponse
from app.core.config import get_settings
import httpx
import logging
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
import json
import asyncio

logger = logging.getLogger(__name__)
settings = get_settings()

class TextGenerationService:
    """Service for text generation operations."""
    
    @staticmethod
    @retry(
        stop=stop_after_attempt(settings.LLM_MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.NetworkError, json.JSONDecodeError)),
        reraise=True
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
                try:
                    response = await client.post(
                        llm_url,
                        headers={
                            "Accept": "text/event-stream",
                            "Cache-Control": "no-cache",
                            "Connection": "keep-alive",
                        },
                        json={
                            "model": request.model,
                            "messages": messages,
                            "temperature": request.temperature,
                            "max_tokens": request.max_tokens,
                            "stop": ["\n\n\n"],  # Prevent excessive newlines
                            "frequency_penalty": 0.3,  # Reduce repetition
                            "presence_penalty": 0.3,   # Encourage diversity
                            "stream": True  # Enable streaming
                        }
                    )
                    response.raise_for_status()
                except httpx.HTTPError as e:
                    logger.error(f"HTTP error occurred while calling LLM service: {str(e)}")
                    if e.response and e.response.status_code == 503:
                        raise HTTPException(status_code=503, detail="LLM service is temporarily unavailable")
                    raise HTTPException(status_code=500, detail=f"Error calling LLM service: {str(e)}")
                except httpx.NetworkError as e:
                    logger.error(f"Network error occurred while calling LLM service: {str(e)}")
                    raise HTTPException(status_code=503, detail="Network error occurred while connecting to LLM service")

                full_text = ""
                try:
                    async for line in response.aiter_lines():
                        if line:
                            try:
                                if line.startswith("data: "):
                                    line = line[6:]  # Remove "data: " prefix
                                if line == "[DONE]":
                                    break
                                
                                chunk_data = json.loads(line)
                                if chunk_data["choices"][0]["delta"].get("content"):
                                    content = chunk_data["choices"][0]["delta"]["content"]
                                    full_text += content
                            except json.JSONDecodeError as e:
                                logger.warning(f"Failed to parse line: {line}, error: {str(e)}")
                                continue
                    
                    return TextGenerationResponse(
                        text=full_text,
                        tokens_used=len(full_text.split()),  # Approximate token count
                        model=request.model,
                        finish_reason="stop"
                    )
                except Exception as e:
                    logger.error(f"Error during stream processing: {str(e)}")
                    raise HTTPException(status_code=500, detail="Error processing LLM response stream")
                
        except Exception as e:
            logger.error(f"Error calling local LLM service: {str(e)}")
            if isinstance(e, HTTPException):
                raise e
            raise HTTPException(status_code=500, detail=str(e)) 