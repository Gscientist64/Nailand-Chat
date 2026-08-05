# seed_data.py
from app.core.database import SessionLocal
from app.models.user import Interest
from app.utils.constants import AVAILABLE_INTERESTS
import logging
import uuid

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def seed_interests():
    db = SessionLocal()
    try:
        # Check if interests already exist
        existing = db.query(Interest).count()
        if existing > 0:
            logger.info(f"Interests already exist ({existing} records). Skipping seed.")
            return
        
        # Add all interests
        for interest_name in AVAILABLE_INTERESTS:
            interest = Interest(
                id=uuid.uuid4(),
                name=interest_name
            )
            db.add(interest)
        
        db.commit()
        logger.info(f"✅ Successfully seeded {len(AVAILABLE_INTERESTS)} interests!")
        
        # Verify
        interests = db.query(Interest).all()
        logger.info(f"Interests in DB: {[i.name for i in interests]}")
        
    except Exception as e:
        logger.error(f"❌ Error seeding interests: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_interests()