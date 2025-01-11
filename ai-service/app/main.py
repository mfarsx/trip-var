"""Main application module."""

import uvicorn
import logging
from app import app
from app.core.config import get_settings

settings = get_settings()
logging.basicConfig(level=logging.DEBUG)

if __name__ == "__main__":
    uvicorn.run(
        "app:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug",
        workers=1  # Başlangıçta tek worker ile test edelim
    ) 