from fastapi import APIRouter

router = APIRouter()

@router.get("/health/db")
async def check_db_health():
    from app.services.auth import auth_service
    try:
        await auth_service.init_db()
        await auth_service.client.admin.command('ping')
        return {"status": "healthy", "message": "Database connection successful"}
    except Exception as e:
        return {
            "status": "unhealthy",
            "message": f"Database connection failed: {str(e)}"
        } 