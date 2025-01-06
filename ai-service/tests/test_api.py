from fastapi.testclient import TestClient
from unittest.mock import patch
from main import app

client = TestClient(app)

def test_generate_text():
    mock_response = {
        "generated_text": "This is a test response"
    }
    
    with patch('app.services.ai_providers.generate_with_huggingface') as mock_generate:
        mock_generate.return_value = mock_response
        response = client.post(
            "/generate",
            json={
                "prompt": "Test prompt",
                "model_id": "gpt2",
                "max_tokens": 100
            }
        )
        assert response.status_code == 200
        assert "generated_text" in response.json()

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_invalid_request():
    response = client.post(
        "/generate",
        json={
            "prompt": "",
            "model_id": "gpt2"
        }
    )
    assert response.status_code == 422 