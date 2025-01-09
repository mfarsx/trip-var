from typing import Dict
import requests
from fastapi import HTTPException
from app.core.config import settings
import logging
import os
import asyncio
import aiohttp

# Logger'ı tanımla
logger = logging.getLogger(__name__)

async def generate_with_huggingface(prompt: str, model_config: dict, api_key: str = None):
    try:
        if not api_key:
            api_key = settings.HF_API_KEY

        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{settings.HF_API_URL}/{model_config['model']}",
                headers={"Authorization": f"Bearer {api_key}"},
                json={"inputs": prompt, "max_length": model_config.get('max_tokens', 100)},
                timeout=settings.REQUEST_TIMEOUT
            ) as response:
                if response.status != 200:
                    error_text = await response.text()
                    logger.error(f"HF API error: {response.status} - {error_text}")
                    raise HTTPException(
                        status_code=response.status,
                        detail=f"Text generation failed: {error_text}"
                    )
                
                result = await response.json()
                if isinstance(result, list) and len(result) > 0:
                    return result[0]["generated_text"]
                raise HTTPException(status_code=500, detail="Invalid response format")
                
    except aiohttp.ClientError as e:
        logger.error(f"Network error: {str(e)}")
        raise HTTPException(status_code=503, detail="Service temporarily unavailable")
    except Exception as e:
        logger.error(f"Generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Text generation failed: {str(e)}")

async def generate_with_llm_studio(prompt: str, model: Dict, timeout: int = 120) -> str:
    try:
        url = f"{settings.LLM_STUDIO_URL}/chat/completions"
        
        # Prepare messages including history if available
        messages = model.get("messages", [])
        if not messages:
            messages = [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant. Answer the questions clearly and concisely."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ]
        
        payload = {
            "model": "llama-3.2-3b-instruct:2",
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": model.get("max_tokens", 1000),
            "top_p": 0.95,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "stream": False,
            "wait_for_completion": model.get("wait_for_completion", True)
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                headers=headers,
                json=payload,
                timeout=timeout
            ) as response:
                response.raise_for_status()
                result = await response.json()
                
                if "choices" not in result or not result["choices"]:
                    raise HTTPException(
                        status_code=500,
                        detail="Invalid response format from LLM Studio"
                    )
                    
                return result["choices"][0]["message"]["content"].strip()
                
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=504,
            detail="Request timed out while waiting for completion"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error generating text: {str(e)}"
        ) 