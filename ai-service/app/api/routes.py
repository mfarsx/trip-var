from fastapi import APIRouter, HTTPException, Depends
from app.models.request_models import GenerationRequest
from app.services.ai_providers import generate_with_huggingface, generate_with_llm_studio
from app.core.config import DEFAULT_HF_API_KEY, Provider
import os

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