# create_verification_table.py
from app.core.database import engine
from app.models.user import Base

# This will create the email_verifications table
Base.metadata.create_all(bind=engine)
print("✅ Email verification table created")