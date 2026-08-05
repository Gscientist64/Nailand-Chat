# backend/app/services/message_service.py
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, desc
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from app.models.user import User
from app.models.message import Conversation, ConversationParticipant, Message
from app.schemas.message import ConversationResponse, MessageResponse, MessageCreate

class MessageService:
    
    @staticmethod
    def get_or_create_conversation(db: Session, user1_id: uuid.UUID, user2_id: uuid.UUID) -> Conversation:
        """Get existing conversation between two users or create a new one"""
        
        # Find existing conversation
        existing = db.query(Conversation).join(
            ConversationParticipant
        ).filter(
            ConversationParticipant.user_id.in_([user1_id, user2_id])
        ).group_by(
            Conversation.id
        ).having(
            db.func.count(ConversationParticipant.user_id) == 2
        ).first()
        
        if existing:
            return existing
        
        # Create new conversation
        conversation = Conversation()
        db.add(conversation)
        db.flush()
        
        # Add participants
        participant1 = ConversationParticipant(
            conversation_id=conversation.id,
            user_id=user1_id
        )
        participant2 = ConversationParticipant(
            conversation_id=conversation.id,
            user_id=user2_id
        )
        db.add_all([participant1, participant2])
        db.flush()
        
        return conversation
    
    @staticmethod
    def get_user_conversations(db: Session, user_id: uuid.UUID) -> List[Dict[str, Any]]:
        """Get all conversations for a user with last message and unread count"""
        
        # Get all conversations where user is a participant
        conversations = db.query(Conversation).join(
            ConversationParticipant
        ).filter(
            ConversationParticipant.user_id == user_id
        ).order_by(
            Conversation.updated_at.desc()
        ).all()
        
        result = []
        
        for conv in conversations:
            # Get the other participant
            other_participant = db.query(ConversationParticipant).filter(
                ConversationParticipant.conversation_id == conv.id,
                ConversationParticipant.user_id != user_id
            ).first()
            
            if not other_participant:
                continue
            
            other_user = db.query(User).filter(User.id == other_participant.user_id).first()
            
            # Get last message
            last_message = db.query(Message).filter(
                Message.conversation_id == conv.id
            ).order_by(Message.created_at.desc()).first()
            
            # Get unread count (messages not read by current user)
            user_participant = db.query(ConversationParticipant).filter(
                ConversationParticipant.conversation_id == conv.id,
                ConversationParticipant.user_id == user_id
            ).first()
            
            unread_count = db.query(Message).filter(
                Message.conversation_id == conv.id,
                Message.sender_id != user_id,
                Message.created_at > user_participant.last_read_at if user_participant.last_read_at else True,
                Message.is_read == False
            ).count()
            
            result.append({
                "id": conv.id,
                "other_person_id": other_user.id,
                "other_person_name": f"{other_user.first_name} {other_user.last_name}",
                "other_person_avatar": other_user.profile.avatar_url if other_user.profile else None,
                "last_message": last_message.message_text if last_message else None,
                "last_message_time": last_message.created_at if last_message else None,
                "unread_count": unread_count,
                "created_at": conv.created_at,
                "updated_at": conv.updated_at
            })
        
        return result
    
    @staticmethod
    def get_conversation_messages(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID, limit: int = 50, offset: int = 0) -> Dict[str, Any]:
        """Get messages for a specific conversation"""
        
        # Verify user is in conversation
        participant = db.query(ConversationParticipant).filter(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id
        ).first()
        
        if not participant:
            raise ValueError("User is not a participant in this conversation")
        
        # Get other participant
        other_participant = db.query(ConversationParticipant).filter(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id != user_id
        ).first()
        
        other_user = db.query(User).filter(User.id == other_participant.user_id).first()
        
        # Get messages
        messages = db.query(Message).filter(
            Message.conversation_id == conversation_id
        ).order_by(
            Message.created_at.desc()
        ).offset(offset).limit(limit).all()
        
        # Reverse to get chronological order
        messages.reverse()
        
        message_responses = []
        for msg in messages:
            message_responses.append({
                "id": msg.id,
                "sender_id": msg.sender_id,
                "sender_name": f"{msg.sender.first_name} {msg.sender.last_name}",
                "sender_avatar": msg.sender.profile.avatar_url if msg.sender.profile else None,
                "message_text": msg.message_text,
                "is_mine": msg.sender_id == user_id,
                "is_read": msg.is_read,
                "created_at": msg.created_at
            })
        
        return {
            "conversation_id": conversation_id,
            "other_person_name": f"{other_user.first_name} {other_user.last_name}",
            "other_person_avatar": other_user.profile.avatar_url if other_user.profile else None,
            "messages": message_responses
        }
    
    @staticmethod
    def send_message(db: Session, conversation_id: uuid.UUID, sender_id: uuid.UUID, message_text: str) -> Message:
        """Send a new message in a conversation"""
        
        # Verify user is in conversation
        participant = db.query(ConversationParticipant).filter(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == sender_id
        ).first()
        
        if not participant:
            raise ValueError("User is not a participant in this conversation")
        
        # Create message
        message = Message(
            conversation_id=conversation_id,
            sender_id=sender_id,
            message_text=message_text,
            is_read=False
        )
        db.add(message)
        
        # Update conversation's updated_at
        conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
        conversation.updated_at = datetime.utcnow()
        
        db.flush()
        
        return message
    
    @staticmethod
    def mark_conversation_read(db: Session, conversation_id: uuid.UUID, user_id: uuid.UUID):
        """Mark all messages in a conversation as read for the user"""
        
        # Update participant's last_read_at
        participant = db.query(ConversationParticipant).filter(
            ConversationParticipant.conversation_id == conversation_id,
            ConversationParticipant.user_id == user_id
        ).first()
        
        if not participant:
            raise ValueError("User is not a participant in this conversation")
        
        participant.last_read_at = datetime.utcnow()
        
        # Mark all messages from other user as read
        db.query(Message).filter(
            Message.conversation_id == conversation_id,
            Message.sender_id != user_id,
            Message.is_read == False
        ).update({"is_read": True})
        
        db.flush()