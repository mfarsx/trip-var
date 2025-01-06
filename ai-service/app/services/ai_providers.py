from typing import Dict
import requests
from fastapi import HTTPException
from app.core.config import (
    HF_API_URL,
    LLM_STUDIO_URL,
    LLM_STUDIO_TIMEOUT,
    Provider
)

async def generate_with_huggingface(prompt: str, model: Dict, api_key: str):
    try:
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
                # Clean up the response
                text = text.replace(formatted_prompt, "").strip()
                text = text.split("###")[0].strip()  # Remove any additional prompts
                return text
            return result.get("generated_text", "").strip()
            
        raise HTTPException(
            status_code=500,
            detail=f"Hugging Face API Error: {response.text}"
        )
        
    except Exception as e:
        print(f"Error in generate_with_huggingface: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Hugging Face API Error: {str(e)}"
        ) 

async def generate_with_llm_studio(prompt: str, model: Dict, timeout: int = LLM_STUDIO_TIMEOUT) -> str:
    try:
        url = f"{LLM_STUDIO_URL}/chat/completions"
        
        # OpenAI formatında mesajları hazırla
        payload = {
            "model": "llama-3.2-3b-instruct:2",  # Model identifier'ı doğru formatta kullan
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful AI assistant. Answer the questions clearly and concisely."
                },
                {
                    "role": "user", 
                    "content": prompt
                }
            ],
            "temperature": 0.7,
            "max_tokens": model.get("max_tokens", -1),
            "top_p": 0.95,
            "frequency_penalty": 0,
            "presence_penalty": 0,
            "stream": False
        }
        
        headers = {
            "Content-Type": "application/json"
        }
        
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            timeout=timeout
        )
        response.raise_for_status()
        
        result = response.json()
        if "choices" not in result or not result["choices"]:
            raise HTTPException(
                status_code=500,
                detail="Invalid response format from LLM Studio"
            )
            
        return result["choices"][0]["message"]["content"].strip()
        
    except requests.exceptions.RequestException as e:
        logger.error(f"LLM Studio error: {str(e)}")
        if isinstance(e, requests.exceptions.ConnectionError):
            raise HTTPException(
                status_code=503,
                detail="Could not connect to LLM Studio. Please ensure the server is running."
            )
        elif isinstance(e, requests.exceptions.Timeout):
            raise HTTPException(
                status_code=504,
                detail="LLM Studio request timed out. The server might be overloaded."
            )
        raise HTTPException(
            status_code=500,
            detail=f"LLM Studio error: {str(e)}"
        ) 