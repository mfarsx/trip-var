from transformers import AutoModelForCausalLM, AutoTokenizer
from text_generation import TextGenerationPipeline

# Use GPT-2 medium for better quality
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

# Generate text with better parameters
prompt = "Write a short story about a robot learning to paint:\n"
generation_config = {
    "max_new_tokens": 200,
    "do_sample": True,
    "temperature": 0.9,
    "top_k": 50,
    "top_p": 0.95,
    "repetition_penalty": 1.2,
    "pad_token_id": tokenizer.eos_token_id,
    "eos_token_id": tokenizer.eos_token_id,
}

outputs = pipeline(prompt, **generation_config)

# Clean up and print the output
generated_text = outputs[0]["generated_text"].strip()
print(generated_text) 