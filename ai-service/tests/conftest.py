import pytest
import os
from dotenv import load_dotenv
from fastapi.testclient import TestClient
from main import app

@pytest.fixture(autouse=True)
def env_setup():
    """Set up test environment variables"""
    load_dotenv("tests/.env.test")
    
    # Set test API keys
    os.environ["TEST_MODE"] = "true"
    os.environ["HF_API_KEY"] = "test_hf_key"
    os.environ["OPENAI_API_KEY"] = "test_openai_key"
    os.environ["ANTHROPIC_API_KEY"] = "test_anthropic_key"
    os.environ["GOOGLE_API_KEY"] = "test_google_key"
    
    yield
    
    # Clean up
    for key in ["TEST_MODE", "HF_API_KEY", "OPENAI_API_KEY", "ANTHROPIC_API_KEY", "GOOGLE_API_KEY"]:
        os.environ.pop(key, None)

@pytest.fixture
def test_client():
    return TestClient(app)

@pytest.fixture
def mock_successful_response():
    return {
        "generated_text": "Test response"
    } 