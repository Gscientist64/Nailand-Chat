# init_db.py
from app.core.database import engine
from app.models.user import Base
import app.models.dashboard  # register dashboard models for initialization
import app.models.community  # register community models for initialization
from app.utils.constants import AVAILABLE_INTERESTS
from sqlalchemy import inspect
import logging
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_database():
    """Initialize database with all tables and seed data"""
    try:
        # Create all tables
        logger.info("Creating database tables...")
        Base.metadata.create_all(bind=engine)
        
        # Verify tables were created
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"✅ Tables created: {tables}")
        
        # Seed interests if table is empty
        from sqlalchemy.orm import Session
        from app.models.user import Interest
        
        with Session(engine) as session:
            # Check if interests already exist
            existing = session.query(Interest).count()
            if existing == 0:
                logger.info("Seeding interests...")
                for interest_name in AVAILABLE_INTERESTS:
                    interest = Interest(
                        id=uuid.uuid4(),
                        name=interest_name
                    )
                    session.add(interest)
                session.commit()
                logger.info(f"✅ Seeded {len(AVAILABLE_INTERESTS)} interests")
            else:
                logger.info(f"✅ Interests already exist ({existing} records)")
        
        logger.info("🎉 Database initialization complete!")
        
    except Exception as e:
        logger.error(f"❌ Database initialization failed: {e}")
        raise

if __name__ == "__main__":
    init_database()