# test_gmail.py
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Your Gmail credentials
SMTP_HOST = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_USER = "emmanuelpatricia888@gmail.com"
SMTP_PASSWORD = "kqsgkwtjkrrsaeus"  # No spaces!

# Email details
FROM_EMAIL = SMTP_USER
TO_EMAIL = "ekpeusa@gmail.com"
SUBJECT = "Gmail SMTP Test"

# Create message
msg = MIMEMultipart()
msg["From"] = FROM_EMAIL
msg["To"] = TO_EMAIL
msg["Subject"] = SUBJECT

body = MIMEText("This is a test from Gmail SMTP", "plain")
msg.attach(body)

try:
    print(f"Connecting to Gmail SMTP...")
    server = smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=30)
    server.set_debuglevel(True)
    server.starttls()
    
    print(f"Logging in as {SMTP_USER}...")
    server.login(SMTP_USER, SMTP_PASSWORD)
    
    print(f"Sending to {TO_EMAIL}...")
    server.send_message(msg)
    server.quit()
    
    print("✅ Email sent successfully via Gmail!")
except Exception as e:
    print(f"❌ Error: {e}")