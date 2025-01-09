"""User service."""

from app.domain.models.user import UserCreate, UserInDB, User
from app.core.security import get_password_hash, verify_password
from app.domain.repositories.user import UserRepository

class UserService:
    def __init__(self):
        self.repo = UserRepository()

    async def create(self, user_in: UserCreate) -> User:
        """Create new user."""
        user = UserInDB(
            email=user_in.email,
            full_name=user_in.full_name,
            hashed_password=get_password_hash(user_in.password)
        )
        return await self.repo.create(user)

    async def authenticate(self, email: str, password: str) -> User:
        """Authenticate user."""
        user = await self.repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    async def get_by_id(self, user_id: str) -> User:
        """Get user by ID."""
        return await self.repo.get_by_id(user_id)

    async def get_by_email(self, email: str) -> User:
        """Get user by email."""
        return await self.repo.get_by_email(email) 