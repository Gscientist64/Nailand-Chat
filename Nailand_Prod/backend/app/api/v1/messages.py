# backend/app/api/v1/messages.py
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import uuid

from app.core.database import get_db
from app.api.dependencies import get_current_user
from app.models.user import User
from app.schemas.message import (
    ConversationResponse, 
    MessageResponse, 
    MessageCreate,
    ConversationMessagesResponse,
    StartConversationRequest,
    StartConversationResponse
)
from app.services.message_service import MessageService

router = APIRouter(prefix="/messages", tags=["messages"])

@router.get("/conversations", response_model=List[ConversationResponse])
async def get_conversations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all conversations for the current user.
    
    Returns a list of chats with:
    - id: conversation ID
    - other_person_id: ID of the other person
    - other_person_name: Name of the other person
    - last_message: Last message text
    - last_message_time: Timestamp of last message
    - unread_count: Number of unread messages
    """
    conversations = MessageService.get_user_conversations(db, current_user.id)
    return conversations

@router.get("/conversations/{conversation_id}/messages", response_model=ConversationMessagesResponse)
async def get_conversation_messages(
    conversation_id: uuid.UUID,
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all messages for a specific conversation.
    
    Returns:
    - conversation_id: ID of the conversation
    - other_person_name: Name of the other person
    - messages: List of messages with sender info, text, time, and is_mine flag
    """
    try:
        result = MessageService.get_conversation_messages(
            db, conversation_id, current_user.id, limit, offset
        )
        return result
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

@router.post("/conversations/{conversation_id}/messages", response_model=MessageResponse)
async def send_message(
    conversation_id: uuid.UUID,
    message_data: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Send a new message in a conversation.
    
    Request body:
    - message_text: The message content (1-5000 characters)
    
    Returns the created message with sender info.
    """
    try:
        message = MessageService.send_message(
            db, conversation_id, current_user.id, message_data.message_text
        )
        db.commit()
        
        # Refresh to get relationships
        db.refresh(message)
        
        return MessageResponse(
            id=message.id,
            sender_id=message.sender_id,
            sender_name=f"{message.sender.first_name} {message.sender.last_name}",
            sender_avatar=message.sender.profile.avatar_url if message.sender.profile else None,
            message_text=message.message_text,
            is_mine=True,
            is_read=message.is_read,
            created_at=message.created_at
        )
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

@router.post("/conversations/{conversation_id}/read")
async def mark_conversation_read(
    conversation_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Mark all messages in a conversation as read for the current user.
    
    This updates the last_read_at timestamp for the user in this conversation
    and marks all unread messages from the other user as read.
    """
    try:
        MessageService.mark_conversation_read(db, conversation_id, current_user.id)
        db.commit()
        return {"message": "Conversation marked as read", "success": True}
    except ValueError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e)
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found"
        )

@router.post("/conversations/start", response_model=StartConversationResponse)
async def start_conversation(
    request: StartConversationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Start a new conversation with another user.
    
    Request body:
    - user_id: ID of the user to start conversation with
    - initial_message: First message to send
    
    Returns the conversation ID and confirmation message.
    """
    # Check if the other user exists
    other_user = db.query(User).filter(User.id == request.user_id).first()
    if not other_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Don't allow starting conversation with yourself
    if request.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot start a conversation with yourself"
        )
    
    try:
        # Get or create conversation
        conversation = MessageService.get_or_create_conversation(
            db, current_user.id, request.user_id
        )
        
        # Send the initial message
        message = MessageService.send_message(
            db, conversation.id, current_user.id, request.initial_message
        )
        
        db.commit()
        
        return StartConversationResponse(
            conversation_id=conversation.id,
            message="Conversation started successfully"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )