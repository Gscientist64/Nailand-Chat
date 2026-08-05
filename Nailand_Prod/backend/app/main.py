# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from datetime import datetime
import logging

from app.core.config import settings
from app.api.v1 import auth, users, health, dashboard, communities, messages  # ← ADD messages
from app.core.database import engine, Base

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI
app = FastAPI(
    title="NaiLand Metaverse API",
    description="Backend API for NaiLand Metaverse Platform",
    version="1.0.0",
    docs_url="/docs" if settings.DEBUG else "/docs",
    redoc_url="/redoc" if settings.DEBUG else None,
    debug=settings.DEBUG
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(users.router, prefix="/api/v1")
app.include_router(health.router, prefix="/api/v1")
app.include_router(dashboard.router, prefix="/api/v1")
app.include_router(communities.router, prefix="/api/v1")
app.include_router(messages.router, prefix="/api/v1")  

# Root endpoint
@app.get("/")
async def root():
    return {
        "message": "Welcome to NaiLand Metaverse API",
        "version": "1.0.0",
        "docs": "/docs",
        "endpoints": {
            "health": "/api/v1/health",
            "auth": "/api/v1/auth",
            "users": "/api/v1/users",
            "communities": "/api/v1/communities",
            "messages": "/api/v1/messages"  
        }
    }

# Redirect /health to /api/v1/health for convenience
@app.get("/health", include_in_schema=False)
async def redirect_health():
    return RedirectResponse(url="/api/v1/health")

# Simple health check at root level (no redirect)
@app.get("/ping", include_in_schema=False)
async def simple_ping():
    return {"ping": "pong", "timestamp": datetime.utcnow().isoformat()}