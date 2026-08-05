from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

class CommunityResponse(BaseModel):
    id: uuid.UUID
    name: str
    slug: str
    description: Optional[str] = None
    is_private: bool
    cover_image_url: Optional[str] = None
    member_count: int
    created_by: Optional[uuid.UUID] = None
    created_by_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class CommunityPostResponse(BaseModel):
    id: uuid.UUID
    community_id: uuid.UUID
    user_id: uuid.UUID
    user_name: Optional[str] = None
    content: str
    media_urls: List[str] = Field(default_factory=list)
    likes_count: int
    comments_count: int
    created_at: datetime

    class Config:
        from_attributes = True

class CreateCommunityRequest(BaseModel):
    name: str = Field(..., min_length=3, max_length=150)
    description: Optional[str] = Field(None, max_length=1000)
    is_private: bool = False
    cover_image_url: Optional[str] = None

class CreateCommunityPostRequest(BaseModel):
    content: str = Field(..., min_length=1)
    media_urls: List[str] = Field(default_factory=list)

class ActionResponse(BaseModel):
    success: bool
    message: Optional[str] = None
