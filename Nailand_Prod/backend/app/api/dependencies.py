from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import JWTError
import uuid

from app.core.database import get_db
from app.models.user import User
from app.core.security import verify_token
from app.core.firebase import verify_firebase_token

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    Supports both our JWT and Firebase tokens
    """
    token = credentials.credentials
    
    # Try our JWT first
    payload = verify_token(token)
    if payload:
        user_id = payload.get("sub")
        if user_id:
            try:
                user_uuid = uuid.UUID(user_id)
                user = db.query(User).filter(User.id == user_uuid).first()
                if user and user.is_active:
                    return user
            except ValueError:
                pass
    
    # Try Firebase token
    try:
        firebase_user = verify_firebase_token(token)
        if firebase_user:
            # Find user by Firebase UID
            user = db.query(User).filter(User.firebase_uid == firebase_user['uid']).first()
            if user and user.is_active:
                return user
    except Exception:
        pass
    
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def get_optional_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """Get current user or None (for optional auth)"""
    try:
        return await get_current_user(credentials, db)
    except HTTPException:
        return None