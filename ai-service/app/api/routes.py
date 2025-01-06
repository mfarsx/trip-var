from fastapi import APIRouter, HTTPException, Depends
from app.models.request_models import GenerationRequest
from app.services.ai_providers import generate_with_huggingface, generate_with_llm_studio
from app.core.config import DEFAULT_HF_API_KEY, Provider, LLM_STUDIO_URL
import os
import requests

router = APIRouter()

async def get_api_key():
    api_key = os.getenv("HF_API_KEY", DEFAULT_HF_API_KEY)
    if not api_key:
        raise HTTPException(status_code=500, detail="HF_API_KEY not found")
    return api_key

@router.post("/generate")
async def generate_text(request: GenerationRequest, api_key: str = Depends(get_api_key)):
    try:
        if not request.prompt or not request.prompt.strip():
            raise HTTPException(status_code=400, detail="Prompt cannot be empty")
            
        prompt = request.prompt.strip()
        print(f"Received request - Prompt: {prompt[:50]}... Model: {request.model_id}")
        
        # Configure model based on provider
        if request.model_id == "llama-3.2-3b-instruct":
            model_config = {
                "provider": Provider.LLM_STUDIO,
                "model": "llama-3.2-3b-instruct",
                "max_tokens": min(request.max_tokens or 1000, 2000)
            }
            response = await generate_with_llm_studio(
                prompt=prompt,
                model=model_config
            )
        else:
            model_config = {
                "provider": Provider.HUGGINGFACE,
                "model": request.model_id or "gpt2",
                "max_tokens": min(request.max_tokens or 100, 1000)
            }
            response = await generate_with_huggingface(
                prompt=prompt,
                model=model_config,
                api_key=api_key
            )
        
        if not response:
            raise HTTPException(
                status_code=500,
                detail="No response generated from the model"
            )
            
        return {"generated_text": response}
        
    except Exception as e:
        print(f"Error in generate_text: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "api_key_configured": bool(DEFAULT_HF_API_KEY)
    }

@router.get("/models")
async def list_models():
    """List available models"""
    return {
        "models": {
            "gpt2": {
                "name": "GPT-2",
                "provider": "huggingface",
                "max_tokens": 1000
            },
            "mistral": {
                "name": "Mistral-7B",
                "provider": "mistral",
                "max_tokens": 2000
            },
            "llama2": {
                "name": "Llama 2",
                "provider": "meta",
                "max_tokens": 2000
            }
        }
    }

@router.get("/test-llm-connection")
async def test_llm_connection():
    try:
        # Önce modelleri kontrol et
        models_response = requests.get(f"{LLM_STUDIO_URL}/models", timeout=5)
        
        if not models_response.ok:
            return {
                "status": "failed",
                "url": LLM_STUDIO_URL,
                "error": "Could not get models list"
            }
            
        # Basit bir test mesajı gönder
        test_payload = {
            "model": "llama-3.2-3b-instruct:2",
            "messages": [
                {
                    "role": "system",
                    "content": "You are a helpful assistant."
                },
                {
                    "role": "user",
                    "content": "Hi"
                }
            ],
            "temperature": 0.7,
            "max_tokens": 10,
            "stream": False
        }
        
        chat_response = requests.post(
            f"{LLM_STUDIO_URL}/chat/completions",
            headers={"Content-Type": "application/json"},
            json=test_payload,
            timeout=5
        )
        
        return {
            "status": "connected" if chat_response.ok else "failed",
            "url": LLM_STUDIO_URL,
            "models": models_response.json() if models_response.ok else None,
            "chat_test": chat_response.json() if chat_response.ok else str(chat_response.status_code)
        }
        
    except Exception as e:
        return {
            "status": "error",
            "url": LLM_STUDIO_URL,
            "error": str(e)
        } 