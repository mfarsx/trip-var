from app.core.config import settings
import httpx

class LLMService:
    def __init__(self):
        self.api_url = settings.LLM_STUDIO_URL
        self.model = settings.DEFAULT_MODEL

    async def generate_text(self, prompt: str, system_prompt: str = None) -> str:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.api_url}/chat/completions",
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": system_prompt or "You are a helpful assistant."},
                        {"role": "user", "content": prompt}
                    ]
                },
                timeout=settings.REQUEST_TIMEOUT
            )
            response.raise_for_status()
            return response.json()["choices"][0]["message"]["content"] 