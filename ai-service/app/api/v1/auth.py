from fastapi import APIRouter, HTTPException, Depends, status, Request
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from app.domain.models.user import UserCreate, UserResponse
from app.domain.models.auth import (
    LoginResponse, 
    ErrorResponse, 
    ValidationErrorResponse,
    TokenPayload,
    TokenVerifyResponse,
    LogoutResponse
)
from app.domain.services.auth import auth_service
from app.core.security import create_access_token, verify_token
import logging
from typing import Annotated
from slowapi import Limiter
from slowapi.util import get_remote_address

router = APIRouter() 