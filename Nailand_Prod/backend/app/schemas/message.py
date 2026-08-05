# backend/app/schemas/message.py
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
import uuid

# Conversation Schemas
class ConversationParticipantResponse(BaseModel):
    user_id: uuid.UUID
    name: str
    last_read_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: uuid.UUID
    other_person_id: uuid.UUID
    other_person_name: str
    other_person_avatar: Optional[str] = None
    last_message: Optional[str] = None
    last_message_time: Optional[datetime] = None
    unread_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Message Schemas
class MessageResponse(BaseModel):
    id: uuid.UUID
    sender_id: uuid.UUID
    sender_name: str
    sender_avatar: Optional[str] = None
    message_text: str
    is_mine: bool = False
    is_read: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class MessageCreate(BaseModel):
    message_text: str = Field(..., min_length=1, max_length=5000)

class ConversationMessagesResponse(BaseModel):
    conversation_id: uuid.UUID
    other_person_name: str
    other_person_avatar: Optional[str] = None
    messages: List[MessageResponse] = []
    
    class Config:
        from_attributes = True

# Request/Response for creating/starting a conversation
class StartConversationRequest(BaseModel):
    user_id: uuid.UUID  # ID of the user to start conversation with
    initial_message: str = Field(..., min_length=1, max_length=5000)

class StartConversationResponse(BaseModel):
    conversation_id: uuid.UUID
    message: str