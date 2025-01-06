from typing import Dict
import requests
from fastapi import HTTPException
from app.core.config import (
    HF_API_URL,
    LLM_STUDIO_URL,
    LLM_STUDIO_TIMEOUT,
    Provider
)
import logging
import os
import asyncio
import aiohttp

# Logger'ı tanımla
logger = logging.getLogger(__name__)

async def generate_with_huggingface(prompt: str, model: Dict, api_key: str):
    try:
        # Test modunda mock response dön
        if os.getenv("TEST_MODE") == "true":
            return "Test response"
            
        print(f"Using API key: {api_key[:4]}...")
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }
        
        # Better prompt formatting
        formatted_prompt = f"### Question: {prompt}\n\n### Answer:"
        
        # Updated parameters for better generation
        payload = {
            "inputs": formatted_prompt,
            "parameters": {
                "max_new_tokens": model["max_tokens"],
                "temperature": 0.7,
                "top_k": 50,
                "top_p": 0.9,
                "do_sample": True,
                "repetition_penalty": 1.2,
                "stop": ["###", "\n\n"],
                "return_full_text": False
            }
        }
        
        print(f"Making request to: {HF_API_URL}/{model['model']}")
        
        response = requests.post(
            f"{HF_API_URL}/{model['model']}",
            headers=headers,
            json=payload,
            timeout=60
        )
        
        if response.status_code == 200:
            result = response.json()
            if isinstance(result, list) and result:
                text = result[0].get("generated_text", "").strip()
                text = text.replace(formatted_prompt, "").strip()
                text = text.split("###")[0].strip()
                return text
            return result.get("generated_text", "").strip()
            
        # Hata durumlarını daha iyi yönet
        if response.status_code == 401:
            raise HTTPException(status_code=401, detail="Invalid API key")
        if response.status_code == 422:
            raise HTTPException(status_code=422, detail="Invalid request format")
            
        raise HTTPException(
            status_code=500,
            detail=f"Hugging Face API Error: {response.text}"
        )
        
    except Exception as e:
        logger.error(f"Error in generate_with_huggingface: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Hugging Face API Error: {str(e)}"
        ) 

async def generate_with_llm_studio(prompt: str, model: Dict, timeout: int = 120) -> str:
    try:
        url = f"{LLM_STUDIO_URL}/chat/completions"
        
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