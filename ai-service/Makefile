.PHONY: install test lint format clean docker-build docker-run

# Development
install:
	pip install -r requirements.txt

dev:
	uvicorn app.main:app --reload

# Testing
test:
	pytest

test-cov:
	pytest --cov=app tests/

# Code Quality
lint:
	flake8 app tests
	black --check app tests
	isort --check-only app tests

format:
	black app tests
	isort app tests

# Cleaning
clean:
	find . -type d -name "__pycache__" -exec rm -r {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type f -name "*.pyd" -delete
	find . -type f -name ".coverage" -delete
	find . -type d -name "*.egg-info" -exec rm -r {} +
	find . -type d -name "*.egg" -exec rm -r {} +
	find . -type d -name ".pytest_cache" -exec rm -r {} +
	find . -type d -name ".coverage" -exec rm -r {} +

# Docker
docker-build:
	docker build -t tripvar-ai-service .

docker-run:
	docker run -p 8000:8000 tripvar-ai-service
