# backend/app/services/email_service.py
import httpx
import re
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any, Tuple
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

REOON_API_URL = "https://emailverifier.reoon.com/api/v1/verify"

async def send_verification_email(to_email: str, code: str, first_name: str) -> bool:
    """
    Send verification code via email using Brevo SMTP with better error handling
    """
    import socket
    
    # Always log the code for development/testing
    logger.info(f"🔐 VERIFICATION CODE for {to_email}: {code}")
    
    # Check if SMTP is configured
    if not all([settings.SMTP_USER, settings.SMTP_PASSWORD]):
        logger.warning("SMTP not configured. Email not sent.")
        return False
    
    try:
        # Create message with proper headers
        msg = MIMEMultipart()
        msg["From"] = f"NaiLand Metaverse <{settings.SMTP_USER}>"
        msg["To"] = to_email
        msg["Subject"] = "Verify Your Email - NaiLand Metaverse"
        msg["Reply-To"] = settings.SMTP_USER
        msg["X-Priority"] = "1"  # High priority
        
        # Create HTML content
        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <div style="background-color: #fdc416; padding: 20px; text-align: center;">
                    <h1 style="color: #1a1a1a; margin: 0;">NaiLand Metaverse</h1>
                </div>
                
                <div style="padding: 30px;">
                    <h2 style="color: #333; margin-top: 0;">Hello {first_name}!</h2>
                    
                    <p style="color: #666; line-height: 1.6;">Thank you for signing up! Please use the verification code below to complete your registration:</p>
                    
                    <div style="background-color: #f8f8f8; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0; border: 2px solid #fdc416;">
                        <h1 style="font-size: 48px; letter-spacing: 10px; color: #fdc416; margin: 0; font-weight: bold;">{code}</h1>
                    </div>
                    
                    <p style="color: #666; line-height: 1.6;">This code will expire in <strong style="color: #fdc416;">10 minutes</strong>.</p>
                    
                    <p style="color: #666; line-height: 1.6;">If you didn't create an account with us, please ignore this email.</p>
                    
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        &copy; 2024 NaiLand Metaverse. All rights reserved.<br>
                        This is an automated message, please do not reply.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
        
        # Create plain text version as fallback
        text = f"""
        Welcome to NaiLand Metaverse!
        
        Hello {first_name},
        
        Your verification code is: {code}
        
        This code will expire in 10 minutes.
        
        If you didn't create an account with us, please ignore this email.
        """
        
        # Attach both HTML and plain text versions
        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))
        
        # Send email with timeout
        logger.info(f"Connecting to Brevo SMTP server {settings.SMTP_HOST}:{settings.SMTP_PORT}")
        
        # Set socket timeout
        socket.setdefaulttimeout(30)
        
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=30)
        server.set_debuglevel(1)  # Enable debug output to see SMTP conversation
        server.starttls()
        
        logger.info(f"Logging in as {settings.SMTP_USER}")
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        
        logger.info(f"Sending email to {to_email}")
        server.send_message(msg)
        server.quit()
        
        logger.info(f"✅ Verification email sent to {to_email} via Brevo")
        return True
        
    except smtplib.SMTPAuthenticationError as e:
        logger.error(f"❌ Brevo SMTP Authentication failed: {e}")
        logger.error("Check your SMTP username and password in .env")
        return False
    except smtplib.SMTPRecipientsRefused as e:
        logger.error(f"❌ Recipient refused: {e}")
        logger.error(f"The email address {to_email} might be invalid")
        return False
    except smtplib.SMTPServerDisconnected as e:
        logger.error(f"❌ Server disconnected: {e}")
        return False
    except socket.timeout:
        logger.error("❌ Connection timeout - Brevo server not responding")
        return False
    except Exception as e:
        logger.error(f"❌ Failed to send email: {e}")
        import traceback
        traceback.print_exc()
        return False

async def verify_email_reoon(email: str) -> Dict[str, Any]:
    """
    Verify email using Reoon API (free tier)
    """
    if not settings.EMAIL_VERIFIER_API_KEY:
        logger.warning("Email verifier API key not configured")
        return {"status": "unknown", "email": email}
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                REOON_API_URL,
                params={
                    "email": email,
                    "key": settings.EMAIL_VERIFIER_API_KEY,
                    "mode": "quick"  # Quick mode for instant results
                },
                timeout=10.0
            )
            
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Reoon verification for {email}: {data.get('status')}")
                return data
            else:
                logger.error(f"Reoon API error: {response.status_code}")
                return {"status": "unknown", "email": email}
    
    except Exception as e:
        logger.error(f"Reoon API exception: {e}")
        return {"status": "unknown", "email": email}

def validate_email_syntax(email: str) -> bool:
    """
    Basic email syntax validation
    """
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def is_email_valid(verification_result: Dict[str, Any]) -> bool:
    """
    Determine if email is valid based on Reoon verification result
    Reoon returns: "valid", "invalid", "unknown"
    """
    status = verification_result.get("status", "").lower()
    
    if status == "valid":
        return True
    elif status == "invalid":
        return False
    else:
        logger.warning(f"Email verification returned unknown status for {verification_result.get('email')}")
        return True  # Accept by default to avoid blocking users

async def verify_email(email: str) -> Tuple[bool, str, Dict[str, Any]]:
    """
    Main email verification function using Reoon
    Returns: (is_valid, message, verification_data)
    """
    # First, check syntax
    if not validate_email_syntax(email):
        return False, "Invalid email format", {}
    
    # Use Reoon API for verification
    if settings.EMAIL_VERIFIER_API_KEY:
        result = await verify_email_reoon(email)
        is_valid = is_email_valid(result)
        
        if result.get("status") == "valid":
            return True, "Email is valid", result
        elif result.get("status") == "invalid":
            return False, "Email is invalid or does not exist", result
        else:
            return True, "Email accepted (basic validation passed)", result
    
    return True, "Email accepted (basic validation only)", {}