from typing import List, Optional
from pydantic_settings import BaseSettings
from functools import lru_cache
from pydantic import validator, AnyHttpUrl, ValidationError
from enum import Enum

class Provider(str, Enum):
    HUGGINGFACE = "huggingface"
    LLM_STUDIO = "llm_studio"

class Settings(BaseSettings):
    # Application Settings
    APP_NAME: str = "TripVar"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    
    # API Configuration
    API_V1_PREFIX: str = "/api/v1"
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    REQUEST_TIMEOUT: int = 30
    
    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # Database
    MONGODB_URL: str
    MONGODB_NAME: str = "tripvar_db"
    MONGODB_MAX_POOL_SIZE: int = 10
    MONGODB_MIN_POOL_SIZE: int = 1
    
    # CORS
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173"
    ALLOWED_METHODS: str = "GET,POST,PUT,DELETE,OPTIONS"
    ALLOWED_HEADERS: str = "*"
    
    # AI Models
    HF_API_KEY: Optional[str] = None
    HF_API_URL: str = "https://api-inference.huggingface.co/models"
    LLM_STUDIO_URL: str = "http://localhost:8080"
    DEFAULT_MODEL: str = "llama-3.2-3b-instruct"
    PROVIDER: Provider = Provider.LLM_STUDIO
    
    # Logging
    LOG_LEVEL: str = "INFO"

    @validator("ALLOWED_ORIGINS", "ALLOWED_METHODS", "ALLOWED_HEADERS")
    def parse_list(cls, v: str) -> List[str]:
        if isinstance(v, str):
            return [item.strip() for item in v.split(",") if item.strip()]
        return v

    @validator("MONGODB_URL")
    def validate_mongodb_url(cls, v: str) -> str:
        if not v.startswith(("mongodb://", "mongodb+srv://")):
            raise ValueError("Invalid MongoDB URL format")
        return v

    @validator("LLM_STUDIO_URL", "HF_API_URL")
    def validate_url(cls, v: str) -> str:
        if not v.startswith(("http://", "https://")):
            raise ValueError("URL must be a valid HTTP/HTTPS URL")
        return v

    @validator("SECRET_KEY")
    def validate_secret_key(cls, v: str) -> str:
        if len(v) < 32:
            raise ValueError("SECRET_KEY must be at least 32 characters long")
        return v

    @validator("LOG_LEVEL")
    def validate_log_level(cls, v: str) -> str:
        valid_levels = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}
        if v.upper() not in valid_levels:
            raise ValueError(f"LOG_LEVEL must be one of {valid_levels}")
        return v.upper()
    
    class Config:
        env_file = ".env"
        case_sensitive = True

@lru_cache()
def get_settings() -> Settings:
    try:
        return Settings()
    except ValidationError as e:
        print("\nEnvironment configuration error:")
        for error in e.errors():
            print(f"- {error['loc'][0]}: {error['msg']}")
        raise

settings = get_settings() 