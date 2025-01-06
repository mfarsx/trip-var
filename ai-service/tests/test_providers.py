import pytest
from unittest.mock import patch, MagicMock
from app.services.ai_providers import generate_with_huggingface
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_huggingface_generation():
    # Test modunda çalışırken
    with patch('os.getenv') as mock_getenv:
        mock_getenv.return_value = "true"  # TEST_MODE=true
        
        model_config = {
            "provider": "huggingface",
            "model": "gpt2",
            "max_tokens": 100
        }
        
        response = await generate_with_huggingface(
            prompt="Hello, how are you?",
            model=model_config,
            api_key="test_key"
        )
        assert response == "Test response"

    # Hata durumunu test et
    with patch('os.getenv') as mock_getenv, \
         patch('requests.post') as mock_post:
        mock_getenv.return_value = "false"  # TEST_MODE=false
        mock_response = MagicMock()
        mock_response.status_code = 401
        mock_response.text = "Invalid token"
        mock_post.return_value = mock_response
        
        with pytest.raises(HTTPException) as exc_info:
            await generate_with_huggingface(
                prompt="Hello",
                model=model_config,
                api_key="invalid_key"
            )
        assert exc_info.value.status_code == 500
        assert "Hugging Face API Error" in str(exc_info.value.detail) 