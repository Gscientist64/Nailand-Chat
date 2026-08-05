# backend/app/schemas/community_feed.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid
from enum import Enum

class FeedType(str, Enum):
    posts = "posts"
    collaborations = "collaborations"
    skills = "skills"
    all = "all"

class CreateCommunityPostRequest(BaseModel):
    content: str = Field(..., min_length=1, max_length=5000)
    media_urls: List[str] = Field(default_factory=list)

class CommunityPostResponse(BaseModel):
    id: uuid.UUID
    community_id: uuid.UUID
    user_id: uuid.UUID
    author_name: str
    author_rating: float = 0
    content: str
    media_urls: List[str] = []
    likes_count: int = 0
    comments_count: int = 0
    is_liked: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class LikeResponse(BaseModel):
    liked: bool
    likes_count: int

class FeedItemResponse(BaseModel):
    type: str
    id: str
    content: Optional[str] = None
    title: Optional[str] = None
    description: Optional[str] = None
    skill_name: Optional[str] = None
    required_skills: Optional[List[str]] = None
    budget_min: Optional[int] = None
    budget_max: Optional[int] = None
    duration_days: Optional[int] = None
    payment_min: Optional[int] = None
    payment_max: Optional[int] = None
    media_urls: Optional[List[str]] = None
    author_name: Optional[str] = None
    author_rating: Optional[float] = None
    likes_count: Optional[int] = None
    comments_count: Optional[int] = None
    is_liked: Optional[bool] = None
    created_at: datetime