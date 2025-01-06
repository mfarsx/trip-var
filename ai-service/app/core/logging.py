import logging
from logging.config import dictConfig
from typing import Dict, Any

def configure_logging() -> None:
    logging_config: Dict[str, Any] = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "formatter": "default",
                "level": "INFO",
            },
        },
        "root": {
            "level": "INFO",
            "handlers": ["console"],
        },
    }
    dictConfig(logging_config) 