import pytest
import os
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(autouse=True)
def env_setup():
    """Set up test environment variables"""
    # Set required test variables
    os.environ.update({
        "TEST_MODE": "true",
        "HF_API_KEY": "test_hf_key",
        "LLM_STUDIO_URL": "http://localhost:1234/v1",
        "SECRET_KEY": "test-secret-key",
        "API_V1_STR": "/api/v1"
    })
    
    yield
    
    # Cleanup
    for key in ["TEST_MODE", "HF_API_KEY", "LLM_STUDIO_URL", "SECRET_KEY", "API_V1_STR"]:
        os.environ.pop(key, None)

@pytest.fixture
def mock_successful_response():
    return "Test response" 