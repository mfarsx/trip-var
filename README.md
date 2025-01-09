# Tripvar AI Service

This project consists of two main services:

- A React-based client application
- A Python-based AI service using GPT-2 for text generation

## Prerequisites

- Docker and Docker Compose
- Git

## Project Structure

```
tripvar/
├── ai-service/         # Python FastAPI backend
│   ├── Dockerfile
│   ├── requirements.txt
│   └── src/
├── client/            # React frontend
│   ├── Dockerfile
│   ├── package.json
│   └── src/
└── docker-compose.yml
```

## Quick Start

1. Clone the repository:

```bash
git clone https://github.com/yourusername/tripvar.git
cd tripvar
```

2. Start the services:

```bash
docker-compose up --build
```

The services will be available at:

- Client: http://localhost:5173
- AI Service: http://localhost:8000

## Development

### Running Services Individually

AI Service:

```bash
cd ai-service
pip install -r requirements.txt
python main.py
```

Client:

```bash
cd client
npm install
npm run dev
```

### Environment Variables

Client:

- `VITE_API_URL`: AI service URL (default: http://localhost:8000)

AI Service:

- `PYTHONUNBUFFERED`: Python output buffering (set in docker-compose.yml)

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT

## Environment Setup

1. Copy the example environment file:

   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your API keys:

   ```env
   HF_API_KEY=your_huggingface_api_key
   ```

3. Start the services:
   ```bash
   docker-compose up --build
   ```

## API Endpoints

### Authentication Endpoints

Base URL: `http://localhost:8000/api/v1`

#### 1. Register User

```http
POST /auth/register
Content-Type: application/json

Request Body:
{
    "email": "test@example.com",
    "password": "password123",
    "full_name": "Test User"
}

Response (201 Created):
{
    "user": {
        "id": "user_id",
        "email": "test@example.com",
        "full_name": "Test User",
        "created_at": "2024-01-08T10:00:00Z"
    },
    "access_token": "jwt_token_here"
}
```

#### 2. Login

```http
POST /auth/login
Content-Type: application/json

Request Body:
{
    "username": "test@example.com",
    "password": "password123"
}

Response (200 OK):
{
    "access_token": "jwt_token_here",
    "token_type": "bearer",
    "user": {
        "id": "user_id",
        "email": "test@example.com",
        "full_name": "Test User"
    }
}

Error Responses:
// 422 Unprocessable Entity
{
    "detail": [
        {
            "type": "missing",
            "loc": ["body", "username"],
            "msg": "Field required",
            "input": null
        }
    ]
}

// 401 Unauthorized
{
    "detail": "Incorrect username or password"
}
```

#### 3. Verify Token

```http
GET /auth/verify
Authorization: Bearer your_jwt_token_here

Response (200 OK):
{
    "user": {
        "id": "user_id",
        "email": "test@example.com",
        "full_name": "Test User"
    }
}
```

#### 4. Logout

```http
POST /auth/logout
Authorization: Bearer your_jwt_token_here

Response (200 OK):
{
    "message": "Successfully logged out"
}
```

### Testing with Postman

1. Create a new environment in Postman with these variables:

   - `base_url`: http://localhost:8000/api/v1
   - `token`: (will be set after login)

2. Test sequence:

   ```bash
   # 1. Register a new user
   POST {{base_url}}/auth/register

   # 2. Login with the registered user
   POST {{base_url}}/auth/login
   Body: {
       "username": "test@example.com",
       "password": "password123"
   }

   # 3. Save the token from the login response
   # In "Tests" tab of the login request:
   pm.environment.set("token", pm.response.json().access_token);

   # 4. Use the token for authenticated requests
   GET {{base_url}}/auth/verify
   Authorization: Bearer {{token}}
   ```
