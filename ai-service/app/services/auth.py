from datetime import datetime, timedelta
from typing import Optional
from jose import jwt
from passlib.context import CryptContext
from app.core.config import settings
from app.core.mongodb import get_database
from loguru import logger

class AuthService:
    def __init__(self):
        self._pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        self._db = None

    @property
    def db(self):
        if self._db is None:
            self._db = get_database()
        return self._db

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return self._pwd_context.verify(plain_password, hashed_password)

    def get_password_hash(self, password: str) -> str:
        return self._pwd_context.hash(password)

    def create_access_token(self, data: dict, expires_delta: Optional[timedelta] = None) -> str:
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
        return encoded_jwt

auth_service = AuthService() 