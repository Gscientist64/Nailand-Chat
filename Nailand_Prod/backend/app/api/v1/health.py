# app/api/v1/health.py
from fastapi import APIRouter, Request
from fastapi.responses import RedirectResponse
from datetime import datetime
from app.core.config import settings

router = APIRouter(tags=["health"])

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.ENVIRONMENT,
        "database": "connected"  # You can add actual DB check here
    }

@router.get("/ping")
async def ping():
    """Simple ping endpoint"""
    return {"ping": "pong"}

# Add a root health check that redirects or shows info
@router.get("/")
async def health_root():
    """Root health endpoint with info"""
    return {
        "message": "Health check endpoints available at:",
        "endpoints": {
            "health": "/api/v1/health",
            "ping": "/api/v1/ping",
            "docs": "/docs"
        }
    }