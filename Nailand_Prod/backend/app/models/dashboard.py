# backend/app/models/dashboard.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Text, Float, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

class Collaboration(Base):
    __tablename__ = "collaborations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    required_skills = Column(JSON, default=list)  # List of skills needed
    budget_min = Column(Integer, nullable=True)
    budget_max = Column(Integer, nullable=True)
    duration_days = Column(Integer, nullable=True)
    status = Column(String(50), default="open")  # open, in_progress, completed, cancelled
    views_count = Column(Integer, default=0)
    engagements_count = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="collaborations")

class SkillRequest(Base):
    __tablename__ = "skill_requests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    payment_min = Column(Integer, nullable=True)
    payment_max = Column(Integer, nullable=True)
    status = Column(String(50), default="open")  # open, filled, cancelled
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="skill_requests")

class UserSkill(Base):
    __tablename__ = "user_skills"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    skill_name = Column(String(100), nullable=False)
    proficiency_level = Column(Integer, default=3)  # 1-5 (1=beginner, 5=expert)
    years_experience = Column(Float, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="skills")

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    avatar_url = Column(String(500), nullable=True)
    bio = Column(Text, nullable=True)
    location = Column(String(255), nullable=True)
    website = Column(String(500), nullable=True)
    github = Column(String(500), nullable=True)
    linkedin = Column(String(500), nullable=True)
    twitter = Column(String(500), nullable=True)
    rating = Column(Float, default=0)
    total_ratings = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="profile")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # collaboration_request, skill_request, message, system
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    data = Column(JSON, default=dict)  # Additional data
    is_read = Column(Boolean, default=False)
    actions = Column(JSON, default=list)  # Available actions like ["Accept", "Decline"]
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")

class MapPin(Base):
    __tablename__ = "map_pins"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    title = Column(String(255), nullable=False)
    description = Column(String(500), nullable=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    category = Column(String(100), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="map_pins")