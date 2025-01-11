"""Logging configuration module."""

import logging
import logging.handlers
import json
import sys
import traceback
import os
from datetime import datetime
from typing import Any, Dict
from pathlib import Path
from app.core.config import settings
import colorlog

class JSONFormatter(logging.Formatter):
    """JSON formatter for structured logging."""
    
    def __init__(self):
        super().__init__()
        self.default_keys = [
            'timestamp',
            'level',
            'logger',
            'message'
        ]
    
    def format(self, record: logging.LogRecord) -> str:
        """Format log record as JSON."""
        message = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'logger': record.name,
            'message': record.getMessage(),
            'module': record.module,
            'function': record.funcName,
            'line': record.lineno,
            'process_id': os.getpid(),
            'thread_id': record.thread
        }
        
        # Add exception info if present
        if record.exc_info:
            message['exception'] = {
                'type': record.exc_info[0].__name__,
                'message': str(record.exc_info[1]),
                'traceback': traceback.format_exception(*record.exc_info)
            }
        
        # Add extra fields
        for key, value in record.__dict__.items():
            if key not in self.default_keys and not key.startswith('_'):
                message[key] = value
        
        return json.dumps(message)

def setup_logging() -> None:
    """Configure logging for the application."""
    try:
        # Create logs directory if it doesn't exist
        log_dir = Path("logs")
        log_dir.mkdir(exist_ok=True, parents=True)
        
        # Configure root logger
        root_logger = logging.getLogger()
        root_logger.setLevel(settings.LOG_LEVEL)
        
        # Remove existing handlers
        root_logger.handlers = []
        
        # Console handler with color formatting for development
        console_handler = logging.StreamHandler(sys.stdout)
        if settings.ENVIRONMENT == "development":
            color_formatter = colorlog.ColoredFormatter(
                "%(log_color)s%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                log_colors={
                    'DEBUG': 'cyan',
                    'INFO': 'green',
                    'WARNING': 'yellow',
                    'ERROR': 'red',
                    'CRITICAL': 'red,bg_white'
                }
            )
            console_handler.setFormatter(color_formatter)
        else:
            console_handler.setFormatter(JSONFormatter())
        
        # File handler for JSON logs with proper permissions
        def create_file_handler(filename: str, level: int = logging.NOTSET) -> logging.Handler:
            handler = logging.handlers.RotatingFileHandler(
                filename=log_dir / filename,
                maxBytes=settings.LOG_FILE_MAX_BYTES,
                backupCount=settings.LOG_FILE_BACKUP_COUNT,
                encoding='utf-8'
            )
            handler.setFormatter(JSONFormatter())
            handler.setLevel(level)
            
            # Set file permissions to be readable/writable only by the owner
            os.chmod(log_dir / filename, 0o600)
            return handler
        
        # Create handlers
        file_handler = create_file_handler("app.json")
        error_handler = create_file_handler("error.json", logging.ERROR)
        
        # Add all handlers
        root_logger.addHandler(console_handler)
        root_logger.addHandler(file_handler)
        root_logger.addHandler(error_handler)
        
        # Set logging levels for third-party packages
        logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
        logging.getLogger("uvicorn.error").setLevel(logging.ERROR)
        logging.getLogger("fastapi").setLevel(logging.WARNING)
        
        # Log startup message
        logger = logging.getLogger(__name__)
        logger.info(
            "Logging configured",
            extra={
                "environment": settings.ENVIRONMENT,
                "log_level": settings.LOG_LEVEL,
                "app_version": settings.APP_VERSION,
                "log_dir": str(log_dir.absolute())
            }
        )
    except Exception as e:
        print(f"Failed to configure logging: {str(e)}", file=sys.stderr)
        raise 