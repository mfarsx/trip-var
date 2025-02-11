# TripVar Backend

This is the backend service for TripVar application, built with FastAPI and MongoDB.

## Features

- User authentication with JWT
- User management (CRUD operations)
- User preferences management
- Role-based access control
- MongoDB integration
- CORS support
- Environment configuration
- Error handling

## Requirements

- Python 3.8+
- MongoDB 4.4+

## Installation

1. Clone the repository:

```bash
git clone https://github.com/mfarsx/tripvar.git
cd tripvar
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create `.env` file:

```bash
cp .env.example .env
```

5. Update the `.env` file with your configuration.

## Running the Application

1. Start MongoDB:

```bash
mongod
```

2. Run the application:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`.

## API Documentation

Once the application is running, you can access:

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Structure

```
app/
├── api/
│   └── v1/
│       ├── auth.py
│       ├── users.py
│       └── router.py
├── core/
│   ├── auth.py
│   ├── config.py
│   ├── database.py
│   └── security.py
├── domain/
│   └── models/
│       └── user.py
├── repositories/
│   └── users.py
├── services/
│   ├── auth.py
│   └── users.py
├── utils/
│   ├── api.py
│   └── error.py
└── main.py
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
