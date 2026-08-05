# check_db.py
from app.core.database import SessionLocal
from app.models.user import User, EmailVerification
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def check_database():
    db = SessionLocal()
    try:
        # Check all users
        users = db.query(User).all()
        logger.info(f"📊 Total users: {len(users)}")
        
        for user in users:
            logger.info(f"👤 User: {user.email}")
            logger.info(f"   - Verified: {user.is_verified}")
            logger.info(f"   - First Name: {user.first_name}")
            logger.info(f"   - Created: {user.created_at}")
            
            # Check verification codes for this user
            verifications = db.query(EmailVerification).filter(
                EmailVerification.user_id == user.id
            ).all()
            
            for v in verifications:
                logger.info(f"   🔐 Verification code: {v.code}")
                logger.info(f"      - Used: {v.is_used}")
                logger.info(f"      - Expires: {v.expires_at}")
        
        # Check all verification codes
        all_codes = db.query(EmailVerification).all()
        logger.info(f"\n📊 Total verification codes: {len(all_codes)}")
        
    except Exception as e:
        logger.error(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_database()