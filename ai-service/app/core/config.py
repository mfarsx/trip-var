"""Application configuration with environment variable support."""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings with environment variable support."""
    
    # Application Info
    APP_NAME: str
    APP_VERSION: str
    DEBUG: bool
    ENVIRONMENT: str
    APP_DESCRIPTION: str = "TripVar AI Service"
    
    # API Settings
    API_HOST: str
    API_PORT: int
    API_V1_PREFIX: str
    REQUEST_TIMEOUT: int
    SHOW_DOCS: bool
    
    @property
    def API_PREFIX(self) -> str:
        """Backward compatibility for API prefix."""
        return self.API_V1_PREFIX
    
    # CORS Settings
    ALLOWED_ORIGINS: str
    ALLOWED_METHODS: str
    ALLOWED_HEADERS: str
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Get list of allowed origins."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",") if origin.strip()]
    
    @property
    def CORS_METHODS(self) -> List[str]:
        """Get list of allowed methods."""
        return [method.strip() for method in self.ALLOWED_METHODS.split(",") if method.strip()]
    
    @property
    def CORS_HEADERS(self) -> List[str]:
        """Get list of allowed headers."""
        return ["*"] if self.ALLOWED_HEADERS == "*" else [h.strip() for h in self.ALLOWED_HEADERS.split(",") if h.strip()]
    
    # Database Settings
    MONGODB_URL: str
    MONGODB_NAME: str
    MAX_CONNECTIONS_COUNT: int = 10  # Renamed from MONGODB_MAX_POOL_SIZE
    MIN_CONNECTIONS_COUNT: int = 1   # Renamed from MONGODB_MIN_POOL_SIZE
    
    # Redis Settings
    REDIS_URL: str = "redis://redis:6379/0"  # Default Redis URL for Docker setup
    REDIS_MAX_CONNECTIONS: int = 10
    REDIS_TIMEOUT: int = 5
    
    @property
    def DATABASE_NAME(self) -> str:
        """Get database name."""
        return self.MONGODB_NAME
    
    # Authentication Settings
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int
    
    # Password Settings
    PASSWORD_MIN_LENGTH: int
    PASSWORD_MAX_LENGTH: int
    
    # Rate Limiting
    RATE_LIMIT_PER_SECOND: int
    RATE_LIMIT_PER_MINUTE: int
    RATE_LIMIT_PER_HOUR: int
    
    # Logging Settings
    LOG_LEVEL: str
    
    # AI Model Settings
    HF_API_KEY: str
    HF_API_URL: str
    DEFAULT_MODEL: str
    
    # LLM Service Settings
    LLM_HOST: str
    LLM_PORT: int
    LLM_PROTOCOL: str
    LLM_TIMEOUT: int
    LLM_MAX_RETRIES: int
    LLM_BATCH_SIZE: int
    LLM_CACHE_TTL: int
    
    @property
    def HOST(self) -> str:
        """Backward compatibility for host."""
        return self.API_HOST
    
    @property
    def PORT(self) -> int:
        """Backward compatibility for port."""
        return self.API_PORT
    
    @property
    def LLM_STUDIO_URL(self) -> str:
        """Get the full LLM service URL."""
        return f"{self.LLM_PROTOCOL}://{self.LLM_HOST}:{self.LLM_PORT}"
    
    class Config:
        """Pydantic settings configuration."""
        env_file = ".env"
        case_sensitive = True
        env_prefix = ""

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings() 