import logging
import sys
from typing import Dict, Any
from loguru import logger
from pathlib import Path

LOG_LEVEL = "INFO"
JSON_LOGS = True
LOG_FILE = "logs/app.log"

class InterceptHandler(logging.Handler):
    def emit(self, record: logging.LogRecord) -> None:
        try:
            level = logger.level(record.levelname).name
        except ValueError:
            level = record.levelno

        frame, depth = sys._getframe(6), 6
        while frame and frame.f_code.co_filename == logging.__file__:
            frame = frame.f_back
            depth += 1

        logger.opt(depth=depth, exception=record.exc_info).log(
            level, record.getMessage()
        )

def setup_logging():
    # Create logs directory if it doesn't exist
    Path("logs").mkdir(exist_ok=True)
    
    # Remove default handlers
    logging.root.handlers = []
    
    # Configure loguru
    logger.configure(
        handlers=[
            {
                "sink": sys.stdout,
                "level": LOG_LEVEL,
                "format": "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>"
            },
            {
                "sink": LOG_FILE,
                "level": LOG_LEVEL,
                "rotation": "500 MB",
                "retention": "1 month",
                "format": "{time:YYYY-MM-DD HH:mm:ss} | {level: <8} | {name}:{function}:{line} - {message}"
            }
        ]
    )

    # Intercept standard library logging
    logging.basicConfig(handlers=[InterceptHandler()], level=0, force=True) 