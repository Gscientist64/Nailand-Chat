# app/schemas/user.py
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
import uuid

# Request Schemas
class UserCreate(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=8)
    agree_terms: bool
    
    @validator('agree_terms')
    def validate_terms(cls, v):
        if not v:
            raise ValueError('You must agree to the terms and conditions')
        return v

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    remember_me: bool = False

class GoogleLoginRequest(BaseModel):
    id_token: str

class UpdateInterestsRequest(BaseModel):
    interests: List[str]

class UpdateRegionRequest(BaseModel):
    region: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str
    new_password: str = Field(..., min_length=8)

# ADD THESE TWO NEW MODELS
class VerifyEmailRequest(BaseModel):
    email: EmailStr
    code: str

class ResendCodeRequest(BaseModel):
    email: EmailStr

# Response Schemas
class UserResponse(BaseModel):
    id: uuid.UUID
    email: str
    first_name: str
    last_name: str
    region: Optional[str]
    is_verified: bool
    interests: List[str] = []
    created_at: datetime
    
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"
    user: UserResponse
    
    class Config:
        from_attributes = True

class MessageResponse(BaseModel):
    message: str
    detail: Optional[str] = None