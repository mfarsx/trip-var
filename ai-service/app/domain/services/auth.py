"""Authentication service for handling user authentication."""

import secrets
import smtplib
from datetime import datetime, timedelta, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from bson import ObjectId
from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import get_settings
from app.core.mongodb import get_db
from app.domain.models import LoginResponse, Token, UserCreate, UserInDB, UserResponse

settings = get_settings()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class AuthService:
    """Service for authentication operations."""

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify a password against its hash."""
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password: str) -> str:
        """Get password hash."""
        return pwd_context.hash(password)

    @staticmethod
    def create_access_token(
        data: dict, expires_delta: Optional[timedelta] = None
    ) -> str:
        """Create JWT access token."""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(
                minutes=settings.AUTH_ACCESS_TOKEN_EXPIRE_MINUTES
            )

        to_encode.update({"exp": expire, "type": "access"})
        encoded_jwt = jwt.encode(
            to_encode, settings.AUTH_SECRET_KEY, algorithm=settings.AUTH_ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def create_refresh_token(data: dict) -> str:
        """Create JWT refresh token."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(
            days=settings.JWT_REFRESH_TOKEN_EXPIRE_DAYS
        )
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(
            to_encode, settings.AUTH_SECRET_KEY, algorithm=settings.AUTH_ALGORITHM
        )
        return encoded_jwt

    @staticmethod
    def create_verification_token() -> str:
        """Create a secure verification token."""
        return secrets.token_urlsafe(32)

    async def invalidate_token(self, token: str) -> None:
        """
        Invalidate a JWT token by adding it to a blacklist.

        Args:
            token: The JWT token to invalidate

        Raises:
            ValueError: If token is invalid or already invalidated
        """
        try:
            # Decode token to get expiration time
            payload = jwt.decode(
                token, settings.AUTH_SECRET_KEY, algorithms=[settings.AUTH_ALGORITHM]
            )

            # Get expiration time from token
            exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)

            db = await get_db()

            # Check if token is already invalidated
            if await db.invalidated_tokens.find_one({"token": token}):
                raise ValueError("Token already invalidated")

            # Add token to invalidated tokens collection
            await db.invalidated_tokens.insert_one(
                {
                    "token": token,
                    "user_id": payload.get("sub"),
                    "invalidated_at": datetime.now(timezone.utc),
                    "expires_at": exp,
                }
            )

            # Clean up expired tokens periodically
            await self._cleanup_expired_tokens()

        except JWTError:
            raise ValueError("Invalid token")

    async def _cleanup_expired_tokens(self) -> None:
        """Remove expired tokens from the invalidated tokens collection."""
        db = await get_db()
        await db.invalidated_tokens.delete_many(
            {"expires_at": {"$lt": datetime.now(timezone.utc)}}
        )

    async def is_token_valid(self, token: str) -> bool:
        """
        Check if a token is valid (not invalidated).

        Args:
            token: The JWT token to check

        Returns:
            bool: True if token is valid, False otherwise
        """
        db = await get_db()
        return not bool(await db.invalidated_tokens.find_one({"token": token}))

    async def send_email(self, to_email: str, subject: str, html_content: str) -> None:
        """Send email using SMTP."""
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = settings.SMTP_USER
            msg["To"] = to_email

            html_part = MIMEText(html_content, "html")
            msg.attach(html_part)

            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                if settings.SMTP_TLS:
                    server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.send_message(msg)
        except Exception as e:
            print(f"Failed to send email: {str(e)}")
            # Don't raise the error to prevent user information disclosure
            # but log it for monitoring

    async def send_verification_email(self, email: str) -> None:
        """Send verification email to user."""
        db = await get_db()
        user = await db.users.find_one({"email": email})

        if not user:
            raise ValueError("User not found")

        # Create verification token
        verification_token = self.create_verification_token()

        # Store token in database with expiry
        expires_at = datetime.now(timezone.utc) + timedelta(hours=24)
        await db.verification_tokens.insert_one(
            {
                "user_id": user["_id"],
                "token": verification_token,
                "type": "email_verification",
                "expires_at": expires_at,
                "created_at": datetime.now(timezone.utc),
            }
        )

        # Create verification URL
        verification_url = f"{settings.API_URL}/auth/verify-email/{verification_token}"

        # Create email content using simple HTML template
        html_content = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                .button {{ 
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007bff;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }}
                .footer {{ color: #666; font-size: 0.9em; margin-top: 30px; }}
            </style>
        </head>
        <body>
            <div class="container">
                <h2>Welcome to {settings.APP_NAME}!</h2>
                <p>Please verify your email address by clicking the button below:</p>
                <a href="{verification_url}" class="button">Verify Email</a>
                <p>Or copy and paste this link in your browser:</p>
                <p>{verification_url}</p>
                <p>This link will expire in 24 hours.</p>
                <div class="footer">
                    <p>If you didn't create an account, please ignore this email.</p>
                </div>
            </div>
        </body>
        </html>
        """

        await self.send_email(email, "Verify your email address", html_content)

    async def verify_email(self, token: str) -> None:
        """Verify user's email using token."""
        db = await get_db()

        # Find and validate token
        token_data = await db.verification_tokens.find_one(
            {
                "token": token,
                "type": "email_verification",
                "expires_at": {"$gt": datetime.now(timezone.utc)},
            }
        )

        if not token_data:
            raise ValueError("Invalid or expired verification token")

        # Update user's verified status
        result = await db.users.update_one(
            {"_id": token_data["user_id"]},
            {
                "$set": {
                    "is_verified": True,
                    "email_verified_at": datetime.now(timezone.utc),
                }
            },
        )

        if result.modified_count == 0:
            raise ValueError("Failed to verify email")

        # Delete used token
        await db.verification_tokens.delete_one({"_id": token_data["_id"]})

    async def refresh_token(self, refresh_token: str, current_token: str) -> Token:
        """Refresh access token using refresh token."""
        try:
            # Verify the refresh token
            payload = jwt.decode(
                refresh_token,
                settings.AUTH_SECRET_KEY,
                algorithms=[settings.AUTH_ALGORITHM],
            )

            if payload.get("type") != "refresh":
                raise ValueError("Invalid token type")

            email: str = payload.get("sub")
            if email is None:
                raise ValueError("Invalid token")

            # Verify the current access token is from the same user
            current_payload = jwt.decode(
                current_token,
                settings.AUTH_SECRET_KEY,
                algorithms=[settings.AUTH_ALGORITHM],
                options={
                    "verify_exp": False
                },  # Don't verify expiration of current token
            )
            if current_payload.get("sub") != email:
                raise ValueError("Token mismatch")

            # Create new access token
            access_token = self.create_access_token(data={"sub": email})

            return Token(access_token=access_token, token_type="bearer")

        except JWTError:
            raise ValueError("Invalid refresh token")

    @classmethod
    async def register_user(cls, user_data: UserCreate) -> UserResponse:
        """Register a new user."""
        db = await get_db()

        # Check if user exists
        if await db.users.find_one({"email": user_data.email}):
            raise ValueError("Email already registered")

        # Create user
        user_dict = user_data.model_dump()
        user_dict["hashed_password"] = cls.get_password_hash(user_dict.pop("password"))
        user_dict["created_at"] = datetime.now(timezone.utc)
        user_dict["updated_at"] = user_dict["created_at"]
        user_dict["is_active"] = True
        user_dict["is_verified"] = False
        user_dict["is_superuser"] = False
        user_dict["preferences"] = {}

        result = await db.users.insert_one(user_dict)
        user_dict["_id"] = str(result.inserted_id)  # Convert ObjectId to string

        # Create access token
        access_token = cls.create_access_token(
            data={"sub": user_dict["email"]},
            expires_delta=timedelta(minutes=settings.AUTH_ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        # Create response with token
        user_response = UserResponse(**user_dict)
        user_response.access_token = access_token

        # Send verification email
        await cls().send_verification_email(user_dict["email"])

        return user_response

    @classmethod
    async def authenticate_user(cls, email: str, password: str) -> LoginResponse:
        """Authenticate user and return tokens."""
        db = await get_db()
        user_dict = await db.users.find_one({"email": email})

        if not user_dict:
            raise ValueError("Invalid email or password")

        # Convert ObjectId to string for Pydantic model
        user_dict["_id"] = str(user_dict["_id"])

        user = UserInDB(**user_dict)

        if not cls.verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        if not user.is_active:
            raise ValueError("User is not active")

        # Update last login time
        await db.users.update_one(
            {
                "_id": ObjectId(user_dict["_id"])
            },  # Convert string back to ObjectId for query
            {"$set": {"last_login": datetime.now(timezone.utc)}},
        )

        # Create access and refresh tokens
        access_token = cls.create_access_token(data={"sub": user.email})
        refresh_token = cls.create_refresh_token(data={"sub": user.email})

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                full_name=user.full_name,
                is_active=user.is_active,
                is_superuser=user.is_superuser,
                preferences=user.preferences,
            ),
        )


# Create and export service instance
auth_service = AuthService()
