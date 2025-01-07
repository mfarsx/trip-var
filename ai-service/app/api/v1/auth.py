from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordRequestForm
from app.models.user import UserCreate, UserResponse
from app.services.auth import auth_service
from app.core.security import create_access_token
import logging

router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/register", response_model=UserResponse)
async def register(user: UserCreate):
    try:
        logger.debug(f"Received registration request: {user.dict(exclude={'password'})}")
        
        # Validate email format
        if not user.email or '@' not in user.email:
            raise HTTPException(status_code=400, detail="Invalid email format")
        
        # Validate password
        if not user.password or len(user.password) < 6:
            raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

        result = await auth_service.create_user(user)
        logger.info(f"Successfully registered user: {user.email}")
        return result
        
    except HTTPException as he:
        logger.error(f"Registration validation error: {str(he.detail)}")
        raise he
    except Exception as e:
        logger.error(f"Registration failed with error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500, 
            detail=str(e)
        )

@router.post("/login", response_model=dict)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        email = form_data.username
        password = form_data.password
        
        logger.debug(f"Received login request - email: {email}")
        
        # First check if user exists
        user = await auth_service.users_collection.find_one({"email": email})
        logger.debug(f"User lookup result: {'Found' if user else 'Not found'}")
        
        if not user:
            logger.warning(f"No user found with email: {email}")
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
            
        # Then authenticate
        authenticated_user = await auth_service.authenticate_user(email, password)
        logger.debug(f"Authentication result: {'Success' if authenticated_user else 'Failed'}")
        
        if not authenticated_user:
            logger.warning(f"Invalid password for user: {email}")
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(authenticated_user.id)
        logger.info(f"Login successful for user: {email}")
        
        response_data = {
            "access_token": access_token,
            "token_type": "bearer",
            "user": UserResponse(
                id=authenticated_user.id,
                email=authenticated_user.email,
                full_name=authenticated_user.full_name,
                created_at=authenticated_user.created_at,
                updated_at=authenticated_user.updated_at
            ).dict()
        }
        logger.debug(f"Sending response: {response_data}")
        return response_data
    except HTTPException as he:
        raise he
    except Exception as e:
        logger.error(f"Login error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Login failed: {str(e)}"
        ) 