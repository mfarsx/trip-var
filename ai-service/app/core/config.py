from pydantic_settings import BaseSettings
from typing import Optional, List
from pydantic import validator, field_validator

class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "AI Service"
    
    # MongoDB settings
    MONGODB_URL: str
    MONGODB_NAME: str = "tripvar_db"
    MONGODB_MAX_POOL_SIZE: int = 10
    MONGODB_MIN_POOL_SIZE: int = 1
    REQUEST_TIMEOUT: int = 30
    
    # API Keys
    DEFAULT_HF_API_KEY: Optional[str] = None
    DEFAULT_OPENAI_API_KEY: Optional[str] = None
    DEFAULT_ANTHROPIC_API_KEY: Optional[str] = None
    DEFAULT_GOOGLE_API_KEY: Optional[str] = None
    
    # JWT settings
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # CORS settings
    BACKEND_CORS_ORIGINS: List[str] = []
    
    class Config:
        case_sensitive = True
        env_file = ".env"

    @validator("SECRET_KEY")
    def secret_key_must_be_set(cls, v):
        if not v or v == "your-secret-key-here":
            raise ValueError("SECRET_KEY must be set")
        return v

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def validate_cors_origins(cls, v):
        if isinstance(v, str):
            try:
                if "," in v:
                    return [i.strip() for i in v.split(",")]
                return [v.strip()]
            except Exception:
                return []
        return v or []

settings = Settings() 