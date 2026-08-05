# backend/create_dashboard_tables.py
from app.core.database import engine
from app.models.dashboard import Collaboration, SkillRequest, UserSkill, UserProfile, Notification, MapPin
from app.models.user import Base
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_dashboard_tables():
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Dashboard tables created successfully!")
        
        # List all tables
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"📊 Tables in database: {tables}")
        
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")

if __name__ == "__main__":
    create_dashboard_tables()