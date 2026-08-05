# backend/create_message_tables.py
import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from dotenv import load_dotenv
load_dotenv(Path(__file__).parent / '.env')

from app.core.database import engine
from app.models.message import Conversation, ConversationParticipant, Message
from app.models.user import Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_message_tables():
    try:
        # Create all tables (including new message tables)
        logger.info("Creating message tables...")
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Message tables created successfully!")
        
        # List all tables to verify
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"📊 Tables in database: {tables}")
        
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")

if __name__ == "__main__":
    create_message_tables()