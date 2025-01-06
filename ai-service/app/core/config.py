import os
from enum import Enum
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# API configurations
HF_API_URL = "https://api-inference.huggingface.co/models"
LLM_STUDIO_URL = "http://127.0.0.1:1234/v1"  # LLM Studio local endpoint
LLM_STUDIO_TIMEOUT = 30  # Timeout in seconds

# Default API keys from environment variables
DEFAULT_HF_API_KEY = os.getenv("HF_API_KEY")

class Provider(str, Enum):
    HUGGINGFACE = "huggingface"
    LLM_STUDIO = "llm_studio" 