import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import requests

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Hugging Face API configuration
HF_API_URL = "https://api-inference.huggingface.co/models"
HF_API_KEY = os.getenv("HF_API_KEY")

# Available models
MODELS = {
    "gpt2": "gpt2",
    "bart": "facebook/bart-large",
    "t5": "google/t5-v1_1-base",
}

class GenerationRequest(BaseModel):
    prompt: str
    model_id: Optional[str] = None
    max_length: Optional[int] = 100
    temperature: Optional[float] = 0.7

@app.post("/generate")
async def generate_text(request: GenerationRequest):
    if not HF_API_KEY:
        raise HTTPException(status_code=500, detail="API key not configured")
    
    try:
        # Select model endpoint
        model = MODELS.get(request.model_id, MODELS["gpt2"])
        
        # Prepare headers
        headers = {
            "Authorization": f"Bearer {HF_API_KEY}",
            "Content-Type": "application/json",
        }
        
        # Prepare payload
        payload = {
            "inputs": request.prompt,
            "parameters": {
                "max_new_tokens": min(request.max_length, 1024),
                "temperature": request.temperature,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False,
            }
        }
        
        # Make request to Hugging Face API
        response = requests.post(
            f"{HF_API_URL}/{model}",
            headers=headers,
            json=payload,
            timeout=30
        )
        
        # Handle errors
        response.raise_for_status()
        
        # Process response
        result = response.json()
        if isinstance(result, list):
            generated_text = result[0].get("generated_text", "")
        else:
            generated_text = result.get("generated_text", "")
            
        return {"generated_text": generated_text.strip()}
        
    except requests.exceptions.RequestException as e:
        error_msg = str(e)
        if hasattr(e, 'response') and e.response is not None:
            error_msg = e.response.json().get('error', str(e))
        raise HTTPException(status_code=500, detail=f"API Error: {error_msg}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/models")
async def list_models():
    return {"models": MODELS}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 