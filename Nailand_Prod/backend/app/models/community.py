from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Community(Base):
    __tablename__ = "communities"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(150), nullable=False, unique=True, index=True)
    slug = Column(String(180), nullable=False, unique=True, index=True)
    description = Column(Text, nullable=True)
    is_private = Column(Boolean, default=False)
    cover_image_url = Column(String(500), nullable=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    member_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    creator = relationship("User", back_populates="created_communities")
    members = relationship("CommunityMember", back_populates="community", cascade="all, delete-orphan")
    posts = relationship("CommunityPost", back_populates="community", cascade="all, delete-orphan")

    @property
    def created_by_name(self):
        if self.creator:
            return f"{self.creator.first_name} {self.creator.last_name}".strip()
        return None

class CommunityMember(Base):
    __tablename__ = "community_members"

    community_id = Column(UUID(as_uuid=True), ForeignKey("communities.id", ondelete="CASCADE"), primary_key=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String(50), default="member")
    joined_at = Column(DateTime(timezone=True), server_default=func.now())

    community = relationship("Community", back_populates="members")
    user = relationship("User", back_populates="community_memberships")

class CommunityPost(Base):
    __tablename__ = "community_posts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    community_id = Column(UUID(as_uuid=True), ForeignKey("communities.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    content = Column(Text, nullable=False)
    media_urls = Column(JSON, default=list)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    community = relationship("Community", back_populates="posts")
    user = relationship("User", back_populates="community_posts")

    @property
    def user_name(self):
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}".strip()
        return None
