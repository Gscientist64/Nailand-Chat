# backend/app/api/v1/dashboard.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, and_, func
from typing import List, Optional
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User, Interest, UserInterest
from app.models.dashboard import Collaboration, SkillRequest, UserSkill, UserProfile, Notification, MapPin
from app.schemas.dashboard import (
    CollaborationResponse, SkillRequestResponse, UserProfileResponse,
    NotificationResponse, MapPinResponse, DashboardStatsResponse,
    UpdateUserSkillsRequest, UpdateUserProfileRequest, CreateCollaborationRequest,
    CreateSkillRequestRequest, CreateMapPinRequest, SearchUsersResponse, UserSkillResponse
)

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/stats", response_model=DashboardStatsResponse)
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for the current user"""
    
    # Count collaborations created by user
    user_collabs = db.query(Collaboration).filter(Collaboration.user_id == current_user.id).count()
    
    # Count skill requests created by user
    user_skill_requests = db.query(SkillRequest).filter(SkillRequest.user_id == current_user.id).count()
    
    # Count unread notifications
    unread_notifications = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).count()
    
    # Count skills user has
    user_skills = db.query(UserSkill).filter(UserSkill.user_id == current_user.id).count()
    
    return DashboardStatsResponse(
        collaborations=user_collabs,
        skill_requests=user_skill_requests,
        notifications=unread_notifications,
        skills=user_skills,
        rating=current_user.profile.rating if current_user.profile else 0
    )

@router.get("/trending-collabs", response_model=List[CollaborationResponse])
async def get_trending_collabs(
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get trending collaborations (most viewed/engaged)"""
    
    collaborations = db.query(Collaboration).filter(
        Collaboration.status == "open"
    ).order_by(
        Collaboration.views_count.desc(),
        Collaboration.engagements_count.desc(),
        Collaboration.created_at.desc()
    ).limit(limit).all()
    
    return collaborations

@router.get("/skills-needed", response_model=List[SkillRequestResponse])
async def get_skills_needed(
    limit: int = Query(20, ge=1, le=50),
    interest: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get skill requests (skills needed by others)"""
    
    query = db.query(SkillRequest).filter(SkillRequest.status == "open")
    
    if interest:
        # Filter by interest (join with user interests)
        query = query.join(User).join(UserInterest).join(Interest).filter(Interest.name == interest)
    
    skill_requests = query.order_by(SkillRequest.created_at.desc()).limit(limit).all()
    
    return skill_requests

@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    unread_only: bool = False,
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user notifications"""
    
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    if unread_only:
        query = query.filter(Notification.is_read == False)
    
    notifications = query.order_by(Notification.created_at.desc()).limit(limit).all()
    
    return notifications

@router.post("/notifications/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Mark a notification as read"""
    
    notification = db.query(Notification).filter(
        Notification.id == notification_id,
        Notification.user_id == current_user.id
    ).first()
    
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found")
    
    notification.is_read = True
    db.commit()
    
    return {"message": "Notification marked as read"}

@router.get("/map-pins", response_model=List[MapPinResponse])
async def get_map_pins(
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get map pins (for the 3D map)"""
    
    query = db.query(MapPin).filter(MapPin.is_active == True)
    
    if category:
        query = query.filter(MapPin.category == category)
    
    pins = query.all()
    return pins

@router.post("/map-pins", response_model=MapPinResponse)
async def create_map_pin(
    pin_data: CreateMapPinRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new map pin"""
    
    new_pin = MapPin(
        user_id=current_user.id,
        title=pin_data.title,
        description=pin_data.description,
        latitude=pin_data.latitude,
        longitude=pin_data.longitude,
        category=pin_data.category
    )
    
    db.add(new_pin)
    db.commit()
    db.refresh(new_pin)
    
    return new_pin

@router.get("/user-profile", response_model=UserProfileResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile"""
    
    # Load user with all relationships
    user = db.query(User).options(
        joinedload(User.interests),
        joinedload(User.skills),
        joinedload(User.profile)
    ).filter(User.id == current_user.id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Return Pydantic model
    return UserProfileResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        region=user.region,
        avatar_url=user.profile.avatar_url if user.profile else None,
        bio=user.profile.bio if user.profile else None,
        location=user.profile.location if user.profile else None,
        website=user.profile.website if user.profile else None,
        github=user.profile.github if user.profile else None,
        linkedin=user.profile.linkedin if user.profile else None,
        twitter=user.profile.twitter if user.profile else None,
        rating=user.profile.rating if user.profile else 0,
        skills=[UserSkillResponse(
            skill_name=s.skill_name,
            proficiency_level=s.proficiency_level,
            years_experience=s.years_experience
        ) for s in user.skills],
        interests=[i.name for i in user.interests]
    )

@router.put("/user-skills", response_model=List[UserSkillResponse])
async def update_user_skills(
    skills_data: UpdateUserSkillsRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's skills"""
    
    # Remove existing skills
    db.query(UserSkill).filter(UserSkill.user_id == current_user.id).delete()
    
    # Add new skills
    new_skills = []
    for skill in skills_data.skills:
        user_skill = UserSkill(
            user_id=current_user.id,
            skill_name=skill.skill_name,
            proficiency_level=skill.proficiency_level,
            years_experience=skill.years_experience
        )
        db.add(user_skill)
        new_skills.append(user_skill)
    
    db.commit()
    
    # Return Pydantic models, not SQLAlchemy models
    return [UserSkillResponse(
        skill_name=s.skill_name,
        proficiency_level=s.proficiency_level,
        years_experience=s.years_experience
    ) for s in new_skills]

@router.get("/search-users", response_model=List[SearchUsersResponse])
async def search_users(
    q: str,
    search_type: str = Query("name", regex="^(name|interest|skill)$"),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Search users by name, interest, or skill"""
    
    if search_type == "name":
        users = db.query(User).filter(
            or_(
                User.first_name.ilike(f"%{q}%"),
                User.last_name.ilike(f"%{q}%")
            )
        ).limit(limit).all()
        
    elif search_type == "interest":
        users = db.query(User).join(UserInterest).join(Interest).filter(
            Interest.name.ilike(f"%{q}%")
        ).limit(limit).all()
        
    elif search_type == "skill":
        users = db.query(User).join(UserSkill).filter(
            UserSkill.skill_name.ilike(f"%{q}%")
        ).limit(limit).all()
    
    return users

@router.post("/collaborations", response_model=CollaborationResponse)
async def create_collaboration(
    collab_data: CreateCollaborationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new collaboration post"""
    
    new_collab = Collaboration(
        user_id=current_user.id,
        title=collab_data.title,
        description=collab_data.description,
        required_skills=collab_data.required_skills,
        budget_min=collab_data.budget_min,
        budget_max=collab_data.budget_max,
        duration_days=collab_data.duration_days
    )
    
    db.add(new_collab)
    db.commit()
    db.refresh(new_collab)
    
    return new_collab

@router.post("/skill-requests", response_model=SkillRequestResponse)
async def create_skill_request(
    request_data: CreateSkillRequestRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new skill request"""
    
    new_request = SkillRequest(
        user_id=current_user.id,
        skill_name=request_data.skill_name,
        description=request_data.description,
        payment_min=request_data.payment_min,
        payment_max=request_data.payment_max
    )
    
    db.add(new_request)
    db.commit()
    db.refresh(new_request)
    
    return new_request