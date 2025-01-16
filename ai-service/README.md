# TripVar AI Service

AI-powered backend service for the TripVar travel planning application.

## Features

- User authentication and authorization
- AI-powered travel planning
- MongoDB for data persistence
- Redis for caching
- FastAPI for high-performance API
- Docker support for development and production

## Getting Started

### Prerequisites

- Python 3.9+
- Docker and Docker Compose
- MongoDB
- Redis

### Installation

1. Clone the repository
2. Copy `.env.example` to `.env` and configure variables
3. Install dependencies:
```bash
pip install -r requirements.txt
```

### Development

Start the development server:
```bash
uvicorn app.main:app --reload
```

Or using Docker:
```bash
docker-compose up
```

### Testing

Run tests:
```bash
pytest
```

### API Documentation

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
ai-service/
├── app/                    # Application package
│   ├── api/               # API endpoints
│   ├── core/              # Core functionality
│   ├── domain/            # Domain models and logic
│   └── infrastructure/    # External services integration
├── docs/                  # Documentation
├── scripts/               # Utility scripts
└── tests/                 # Test suite
```

## Contributing

1. Create a feature branch
2. Commit your changes
3. Push to the branch
4. Create a Pull Request

## License

This project is licensed under the MIT License.
