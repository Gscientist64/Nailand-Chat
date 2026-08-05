from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.schemas.user import UserResponse, UpdateInterestsRequest, UpdateRegionRequest, MessageResponse
from app.models.user import User, Interest, user_interests
from app.utils.constants import AVAILABLE_INTERESTS, AVAILABLE_REGIONS

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user information"""
    # Load interests
    current_user.interests  # This will load the relationship
    return current_user

@router.put("/me/interests", response_model=MessageResponse)
async def update_interests(
    request: UpdateInterestsRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user interests (Step 3 from signup)"""
    # Validate interests
    invalid_interests = [i for i in request.interests if i not in AVAILABLE_INTERESTS]
    if invalid_interests:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid interests: {invalid_interests}"
        )
    
    # Get interest IDs
    interest_objs = db.query(Interest).filter(Interest.name.in_(request.interests)).all()
    
    # Clear existing interests and add new ones
    current_user.interests = interest_objs
    db.commit()
    
    return MessageResponse(message="Interests updated successfully")

@router.put("/me/region", response_model=MessageResponse)
async def update_region(
    request: UpdateRegionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update user region (Step 4 from signup)"""
    if request.region not in AVAILABLE_REGIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid region. Available: {AVAILABLE_REGIONS}"
        )
    
    current_user.region = request.region
    db.commit()
    
    return MessageResponse(message="Region updated successfully")

@router.get("/interests", response_model=List[str])
async def get_all_interests():
    """Get all available interests"""
    return AVAILABLE_INTERESTS

@router.get("/regions", response_model=List[str])
async def get_all_regions():
    """Get all available regions"""
    return AVAILABLE_REGIONS