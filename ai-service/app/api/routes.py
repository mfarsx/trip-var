from fastapi import APIRouter, HTTPException, Depends
from app.models.request_models import GenerationRequest
from app.services.ai_providers import generate_with_huggingface, generate_with_llm_studio
from app.core.config import DEFAULT_HF_API_KEY, Provider, LLM_STUDIO_URL
import os
import requests
from pydantic import ValidationError
from app.services.chat_service import chat_service
from typing import Optional

router = APIRouter()

def get_model_config(model_id: str = None):
    """Get model configuration based on model ID"""
    if model_id == "llama-3.2-3b-instruct":
        return {
            "provider": Provider.LLM_STUDIO,
            "model": "llama-3.2-3b-instruct",
            "max_tokens": 2000
        }
    else:
        return {
            "provider": Provider.HUGGINGFACE,
            "model": model_id or "gpt2",
            "max_tokens": 1000
        }

async def get_api_key():
    api_key = os.getenv("HF_API_KEY", DEFAULT_HF_API_KEY)
    if not api_key:
        raise HTTPException(status_code=500, detail="HF_API_KEY not found")
    return api_key

@router.post("/generate")
async def generate_text(request: GenerationRequest):
    try:
        model_config = get_model_config(request.model_id)
        
        # Get conversation history if available
        messages = []
        if request.conversation_id and request.include_history:
            messages = chat_service.get_conversation_history(request.conversation_id)
        
        # Add current prompt to messages
        messages.append({"role": "user", "content": request.prompt})
        
        # Get the full response
        response = await generate_with_llm_studio(
            prompt=request.prompt,
            model={
                **model_config,
                "max_tokens": request.max_tokens or 1000,
                "wait_for_completion": True,
                "messages": messages
            },
            timeout=120
        )
        
        # Save the conversation
        if request.conversation_id:
            chat_service.add_message(request.conversation_id, "user", request.prompt)
            chat_service.add_message(request.conversation_id, "assistant", response)
        
        return {
            "generated_text": response,
            "model": request.model_id,
            "status": "complete",
            "conversation_id": request.conversation_id
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Text generation failed: {str(e)}"
        )

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

@router.post("/conversations")
async def create_conversation(model_id: Optional[str] = None):
    conversation_id = chat_service.create_conversation(model_id)
    return {"conversation_id": conversation_id}

@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str):
    conversation = chat_service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation 