from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from app.core.deps import get_current_user
from app.domain.models.user import UserInDB

router = APIRouter()

class TestResponse(BaseModel):
    status: str
    message: str

@router.get("/health", response_model=TestResponse)
async def health_check():
    return {"status": "healthy", "message": "AI service is running"}

@router.post("/test")
async def test_generation(current_user: UserInDB = Depends(get_current_user)):
    try:
        return {
            "status": "success",
            "message": f"Test response for user: {current_user.email}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 