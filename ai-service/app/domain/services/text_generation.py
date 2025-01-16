"""Text generation service for handling text generation requests."""

import json
import logging

import httpx
from fastapi import HTTPException
from tenacity import (
    retry,
    retry_if_exception_type,
    stop_after_attempt,
    wait_exponential,
)

from app.core.config import get_settings
from app.domain.models import TextGenerationRequest, TextGenerationResponse

logger = logging.getLogger(__name__)
settings = get_settings()


class TextGenerationService:
    """Service for text generation operations."""

    @staticmethod
    @retry(
        stop=stop_after_attempt(settings.LLM_MAX_RETRIES),
        wait=wait_exponential(multiplier=1, min=4, max=10),
        retry=retry_if_exception_type(
            (httpx.HTTPError, httpx.NetworkError, json.JSONDecodeError)
        ),
        reraise=True,
    )
    async def generate_text(request: TextGenerationRequest) -> TextGenerationResponse:
        """Generate text using the local LLM."""
        llm_url = f"{settings.LLM_STUDIO_URL}/v1/chat/completions"

        try:
            messages = (
                [msg.model_dump() for msg in request.messages]
                if request.messages
                else [{"role": "user", "content": request.prompt}]
            )

            if not any(msg.get("role") == "system" for msg in messages):
                messages.insert(
                    0,
                    {
                        "role": "system",
                        "content": "You are a helpful AI assistant. Provide detailed, well-structured responses.",
                    },
                )

            async with httpx.AsyncClient(timeout=settings.LLM_TIMEOUT) as client:
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
                        "presence_penalty": 0.3,  # Encourage diversity
                        "stream": True,  # Enable streaming
                    },
                )
                response.raise_for_status()

                full_text = await TextGenerationService._process_stream(response)

                return TextGenerationResponse(
                    text=full_text,
                    tokens_used=len(full_text.split()),  # Approximate token count
                    model=request.model,
                    finish_reason="stop",
                )
        except (httpx.HTTPError, httpx.NetworkError, json.JSONDecodeError) as e:
            logger.error(f"Error calling local LLM service: {str(e)}")
            raise HTTPException(
                status_code=500, detail="Error calling LLM service"
            ) from e

    @staticmethod
    async def _process_stream(response) -> str:
        """Process the streaming response from the LLM."""
        full_text = ""
        async for line in response.aiter_lines():
            if line:
                try:
                    if line.startswith("data: "):
                        line = line[6:]  # Remove "data: " prefix
                    if line == "[DONE]":
                        break

                    chunk_data = json.loads(line)
                    content = chunk_data["choices"][0]["delta"].get("content")
                    if content:
                        full_text += content
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse line: {line}")
                    continue
        return full_text
