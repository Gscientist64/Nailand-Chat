# test_brevo.py
import asyncio
import logging
from app.services.email_service import send_verification_email
from app.core.config import settings

logging.basicConfig(level=logging.INFO)

async def test_brevo():
    print("=== Testing Brevo SMTP Configuration ===")
    print(f"SMTP Host: {settings.SMTP_HOST}")
    print(f"SMTP Port: {settings.SMTP_PORT}")
    print(f"SMTP User: {settings.SMTP_USER}")
    print(f"SMTP Password: {'[SET]' if settings.SMTP_PASSWORD else '[MISSING]'}")
    
    if not all([settings.SMTP_USER, settings.SMTP_PASSWORD]):
        print("❌ SMTP credentials not configured!")
        return
    
    # Send test email to yourself
    test_email = input("Enter your email address to receive test: ")
    
    result = await send_verification_email(
        to_email=test_email,
        code="123456",
        first_name="Test"
    )
    
    if result:
        print("✅ Test email sent successfully! Check your inbox.")
        print("   (Don't forget to check spam folder)")
    else:
        print("❌ Failed to send test email. Check the logs above.")

if __name__ == "__main__":
    asyncio.run(test_brevo())