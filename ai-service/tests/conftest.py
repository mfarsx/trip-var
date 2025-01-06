import pytest
import os
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture(autouse=True)
def env_setup():
    """Set up test environment variables"""
    # Test ortamı için gerekli değişkenleri ayarla
    os.environ["TEST_MODE"] = "true"
    os.environ["HF_API_KEY"] = "test_hf_key"
    os.environ["LLM_STUDIO_URL"] = "http://localhost:1234/v1"
    
    yield
    
    # Temizlik
    for key in ["TEST_MODE", "HF_API_KEY", "LLM_STUDIO_URL"]:
        os.environ.pop(key, None)

@pytest.fixture
def mock_successful_response():
    return "Test response" 