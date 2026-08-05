# backend/app/schemas/dashboard.py
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
import uuid

class UserSkillResponse(BaseModel):
    skill_name: str
    proficiency_level: int
    years_experience: float
    
    class Config:
        from_attributes = True

class UserProfileResponse(BaseModel):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    region: Optional[str]
    avatar_url: Optional[str]
    bio: Optional[str]
    location: Optional[str]
    website: Optional[str]
    github: Optional[str]
    linkedin: Optional[str]
    twitter: Optional[str]
    rating: float
    skills: List[UserSkillResponse] = []
    interests: List[str] = []
    
    class Config:
        from_attributes = True

class CollaborationResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_name: Optional[str] = None
    title: str
    description: str
    required_skills: List[str] = []
    budget_min: Optional[int]
    budget_max: Optional[int]
    duration_days: Optional[int]
    views_count: int
    engagements_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class SkillRequestResponse(BaseModel):
    id: uuid.UUID
    user_id: uuid.UUID
    user_name: Optional[str] = None
    skill_name: str
    description: str
    payment_min: Optional[int]
    payment_max: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

class NotificationResponse(BaseModel):
    id: uuid.UUID
    type: str
    title: str
    message: str
    data: Dict[str, Any] = {}
    actions: List[str] = []
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

class MapPinResponse(BaseModel):
    id: uuid.UUID
    title: str
    description: Optional[str]
    latitude: float
    longitude: float
    category: Optional[str]
    created_at: datetime
    
    class Config:
        from_attributes = True

class DashboardStatsResponse(BaseModel):
    collaborations: int
    skill_requests: int
    notifications: int
    skills: int
    rating: float

class UpdateUserSkillsRequest(BaseModel):
    skills: List[UserSkillResponse]

class UpdateUserProfileRequest(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    region: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    github: Optional[str] = None
    linkedin: Optional[str] = None
    twitter: Optional[str] = None

class CreateCollaborationRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: str = Field(..., min_length=10)
    required_skills: List[str] = []
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    duration_days: Optional[int] = None

class CreateSkillRequestRequest(BaseModel):
    skill_name: str = Field(..., min_length=2, max_length=100)
    description: str = Field(..., min_length=10)
    payment_min: Optional[int] = None
    payment_max: Optional[int] = None

class CreateMapPinRequest(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    description: Optional[str] = None
    latitude: float
    longitude: float
    category: Optional[str] = None

class SearchUsersResponse(BaseModel):
    id: uuid.UUID
    first_name: str
    last_name: str
    email: str
    avatar_url: Optional[str]
    interests: List[str] = []
    skills: List[str] = []
    
    class Config:
        from_attributes = True