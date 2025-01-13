"""Logging configuration module."""

import logging
import logging.handlers
import json
import sys
import traceback
import os
import colorlog
from datetime import datetime
from typing import Any, Dict, Optional
from pathlib import Path
from app.core.config import get_settings

settings = get_settings()

# Custom log levels
TRACE = 5
logging.addLevelName(TRACE, "TRACE")

class CustomLogger(logging.Logger):
    """Custom logger with additional methods."""
    
    def trace(self, msg: str, *args, **kwargs) -> None:
        """Log 'msg % args' with severity 'TRACE'."""
        if self.isEnabledFor(TRACE):
            self._log(TRACE, msg, args, **kwargs)

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
                'traceback': ''.join(traceback.format_exception(*record.exc_info))
            }
        
        # Add extra fields from record
        for key, value in record.__dict__.items():
            if key not in logging.LogRecord.__dict__ and key not in message:
                message[key] = value
        
        return json.dumps(message)

def get_console_formatter() -> colorlog.ColoredFormatter:
    """Get colored formatter for console output."""
    return colorlog.ColoredFormatter(
        fmt='%(log_color)s%(asctime)s [%(levelname)s] %(name)s: %(message)s%(reset)s',
        datefmt='%Y-%m-%d %H:%M:%S',
        reset=True,
        log_colors={
            'TRACE':    'cyan',
            'DEBUG':    'blue',
            'INFO':     'green',
            'WARNING': 'yellow',
            'ERROR':   'red',
            'CRITICAL': 'red,bg_white',
        }
    )

def create_directory(path: str) -> None:
    """Create directory if it doesn't exist."""
    Path(path).mkdir(parents=True, exist_ok=True)

def setup_logging() -> None:
    """Configure logging for the application."""
    # Register custom logger
    logging.setLoggerClass(CustomLogger)
    
    # Create logs directory
    log_dir = "logs"
    create_directory(log_dir)
    
    # Root logger configuration
    root_logger = logging.getLogger()
    root_logger.setLevel(settings.LOG_LEVEL.upper())
    
    # Clear existing handlers
    root_logger.handlers.clear()
    
    def create_file_handler(filename: str, level: int = logging.NOTSET) -> logging.Handler:
        """Create a rotating file handler."""
        handler = logging.handlers.RotatingFileHandler(
            filename=os.path.join(log_dir, filename),
            maxBytes=10_000_000,  # 10MB
            backupCount=5,
            encoding='utf-8'
        )
        handler.setLevel(level)
        handler.setFormatter(JSONFormatter())
        return handler
    
    # Console handler (colored output)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setFormatter(get_console_formatter())
    root_logger.addHandler(console_handler)
    
    # File handlers
    handlers = [
        create_file_handler('app.log'),  # All logs
        create_file_handler('error.log', logging.ERROR),  # Error and above
    ]
    for handler in handlers:
        root_logger.addHandler(handler)
    
    # Set specific log levels for noisy modules
    logging.getLogger('uvicorn.access').setLevel(logging.WARNING)
    logging.getLogger('uvicorn.error').setLevel(logging.WARNING)
    logging.getLogger('fastapi').setLevel(logging.WARNING)
    
    # Log startup message
    root_logger.info(f"Logging configured with level: {settings.LOG_LEVEL.upper()}")
    root_logger.info(f"Environment: {settings.ENVIRONMENT}")

def get_logger(name: Optional[str] = None) -> logging.Logger:
    """Get a logger instance with the given name."""
    return logging.getLogger(name) 