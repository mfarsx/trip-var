from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from transformers import AutoModelForCausalLM, AutoTokenizer
from text_generation import TextGenerationPipeline

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model and pipeline
model_name = "gpt2-medium"
model = AutoModelForCausalLM.from_pretrained(model_name)
tokenizer = AutoTokenizer.from_pretrained(model_name)

# Ensure proper tokenizer settings
if tokenizer.pad_token is None:
    tokenizer.pad_token = tokenizer.eos_token
    model.config.pad_token_id = tokenizer.eos_token_id

# Create pipeline
pipeline = TextGenerationPipeline(
    model=model,
    tokenizer=tokenizer,
    device=-1  # Use CPU. Change to 0 for GPU if available
)

class GenerationRequest(BaseModel):
    prompt: str
    max_length: Optional[int] = 100
    temperature: Optional[float] = 0.7

@app.post("/generate")
async def generate_text(request: GenerationRequest):
    generation_config = {
        "max_new_tokens": request.max_length,
        "do_sample": True,
        "temperature": request.temperature,
        "top_k": 50,
        "top_p": 0.95,
        "repetition_penalty": 1.2,
        "pad_token_id": tokenizer.eos_token_id,
        "eos_token_id": tokenizer.eos_token_id,
    }
    
    outputs = pipeline(request.prompt, **generation_config)
    generated_text = outputs[0]["generated_text"].strip()
    return {"generated_text": generated_text}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 