import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from app.main import app

@pytest.fixture
def client():
    return TestClient(app)

def test_generate_text(client):
    mock_response = "Test response"
    
    with patch('app.services.ai_providers.generate_with_huggingface') as mock_generate:
        mock_generate.return_value = mock_response
        response = client.post(
            "/api/v1/generate",
            json={
                "prompt": "Test prompt",
                "model_id": "gpt2",
                "max_tokens": 100
            }
        )
        assert response.status_code == 200
        assert response.json()["generated_text"] == mock_response

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_invalid_request(client):
    response = client.post(
        "/api/v1/generate",
        json={
            "prompt": "",  # Empty prompt
            "model_id": "gpt2"
        }
    )
    assert response.status_code == 422
    assert "validation error" in response.json()["detail"][0]["msg"].lower()

    # Missing prompt test
    response = client.post(
        "/api/v1/generate",
        json={
            "model_id": "gpt2"
        }
    )
    assert response.status_code == 422
    assert "field required" in response.json()["detail"][0]["msg"].lower() 