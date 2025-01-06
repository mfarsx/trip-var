from pydantic_settings import BaseSettings
from typing import List, Optional
from functools import lru_cache
import json
import logging

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    # API Settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Text Generation API"
    VERSION: str = "1.0.0"
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS
    BACKEND_CORS_ORIGINS: str = '["*"]'
    
    @property
    def BACKEND_CORS_ORIGINS_LIST(self) -> List[str]:
        try:
            return json.loads(self.BACKEND_CORS_ORIGINS)
        except (json.JSONDecodeError, TypeError):
            logger.warning("Failed to parse CORS origins, using default")
            return ["*"]
    
    # External Services
    HF_API_URL: str = "https://api-inference.huggingface.co/models"
    LLM_STUDIO_URL: str = "http://localhost:1234/v1"
    
    # API Keys
    HF_API_KEY: str
    DEFAULT_HF_API_KEY: Optional[str] = None
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60
    
    # Timeouts
    REQUEST_TIMEOUT: int = 60
    HEALTH_CHECK_TIMEOUT: int = 5
    
    # Provider Settings
    class Provider:
        HUGGINGFACE = "huggingface"
        LLM_STUDIO = "llm_studio"
        MISTRAL = "mistral"
        META = "meta"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        env_file_encoding = 'utf-8'
        extra = "ignore"

@lru_cache()
def get_settings():
    return Settings()

settings = get_settings() 