import pytest
from unittest.mock import patch, MagicMock
from app.services.ai_providers import generate_with_huggingface
from fastapi import HTTPException

@pytest.mark.asyncio
async def test_huggingface_generation():
    # Mock successful response
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = [{"generated_text": "Hello! I'm doing well."}]
    mock_response.raise_for_status.return_value = None  # Don't raise exception for success case
    
    model_config = {
        "provider": "huggingface",
        "model": "gpt2",
        "max_tokens": 100
    }
    
    # Test with valid API key
    with patch('requests.post') as mock_post:
        mock_post.return_value = mock_response
        response = await generate_with_huggingface(
            prompt="Hello, how are you?",
            model=model_config,
            api_key="test_key"
        )
        assert isinstance(response, str)
        assert len(response) > 0

    # Test with invalid API key
    mock_error_response = MagicMock()
    mock_error_response.status_code = 401
    mock_error_response.raise_for_status.side_effect = HTTPException(
        status_code=500,
        detail="Invalid token"
    )
    
    with patch('requests.post') as mock_post:
        mock_post.return_value = mock_error_response
        with pytest.raises(HTTPException) as exc_info:
            await generate_with_huggingface(
                prompt="Hello",
                model=model_config,
                api_key="invalid_key"
            )
        assert exc_info.value.status_code == 500 