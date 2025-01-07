"""LLM client for text generation."""

import httpx
from typing import Optional
from app.core.config import settings

class LLMClient:
    """LLM client for text generation."""

    def __init__(self, base_url: str, api_key: str):
        """Initialize client."""
        self.base_url = base_url
        self.api_key = api_key
        self.client = httpx.AsyncClient(
            base_url=base_url,
            headers={"Authorization": f"Bearer {api_key}"}
        )

    async def generate(
        self,
        prompt: str,
        max_length: Optional[int] = 100,
        temperature: Optional[float] = 0.7,
        top_p: Optional[float] = 0.9,
        model: Optional[str] = None
    ) -> str:
        """Generate text using LLM."""
        try:
            response = await self.client.post(
                "/generate",
                json={
                    "prompt": prompt,
                    "max_length": max_length,
                    "temperature": temperature,
                    "top_p": top_p,
                    "model": model or settings.DEFAULT_MODEL
                }
            )
            response.raise_for_status()
            return response.json()["generated_text"]
        except httpx.HTTPError as e:
            raise Exception(f"LLM request failed: {str(e)}")
        except Exception as e:
            raise Exception(f"Unexpected error during text generation: {str(e)}")

    async def close(self):
        """Close client connection."""
        await self.client.aclose() 