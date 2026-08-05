# create_tables.py
from app.core.database import engine
from app.models.user import Base
import app.models.dashboard  # ensure dashboard models are registered
import app.models.community  # ensure community models are registered
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_tables():
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully!")
        
        # Verify tables were created
        from sqlalchemy import inspect
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        logger.info(f"Tables in database: {tables}")
        
    except Exception as e:
        logger.error(f"❌ Error creating tables: {e}")
        raise

if __name__ == "__main__":
    create_tables()