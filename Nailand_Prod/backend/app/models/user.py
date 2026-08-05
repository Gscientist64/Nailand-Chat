# app/models/user.py
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Table, Integer, Float, Text, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid

from app.core.database import Base

# Association table for user interests (MUST be defined before User class)
user_interests = Table(
    'user_interests',
    Base.metadata,
    Column('user_id', UUID(as_uuid=True), ForeignKey('users.id', ondelete="CASCADE"), primary_key=True),
    Column('interest_id', UUID(as_uuid=True), ForeignKey('interests.id', ondelete="CASCADE"), primary_key=True),
    Column('created_at', DateTime(timezone=True), server_default=func.now())
)

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    firebase_uid = Column(String(255), unique=True, index=True, nullable=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    region = Column(String(100))
    password_hash = Column(String(255), nullable=True)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    agreed_to_terms = Column(Boolean, default=False)
    agreed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    interests = relationship("Interest", secondary=user_interests, back_populates="users")
    sessions = relationship("Session", back_populates="user", cascade="all, delete-orphan")
    verifications = relationship("EmailVerification", back_populates="user", cascade="all, delete-orphan")
    collaborations = relationship("Collaboration", back_populates="user", cascade="all, delete-orphan")
    skill_requests = relationship("SkillRequest", back_populates="user", cascade="all, delete-orphan")
    skills = relationship("UserSkill", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("UserProfile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")
    map_pins = relationship("MapPin", back_populates="user", cascade="all, delete-orphan")
    community_memberships = relationship("CommunityMember", back_populates="user", cascade="all, delete-orphan")
    community_posts = relationship("CommunityPost", back_populates="user", cascade="all, delete-orphan")
    created_communities = relationship("Community", back_populates="creator", cascade="all, delete-orphan")

class Interest(Base):
    __tablename__ = "interests"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), unique=True, nullable=False)
    
    # Relationships
    users = relationship("User", secondary=user_interests, back_populates="interests")

class UserInterest(Base):
    __tablename__ = "user_interests"
    __table__ = user_interests  # This uses the existing table

class EmailVerification(Base):
    __tablename__ = "email_verifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    code = Column(String(6), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="verifications")

class Session(Base):
    __tablename__ = "sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    refresh_token = Column(String(255), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="sessions")

# Make sure these are exported for import
__all__ = ['User', 'Interest', 'UserInterest', 'EmailVerification', 'Session']