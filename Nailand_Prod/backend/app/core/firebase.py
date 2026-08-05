import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings
import json
import logging

logger = logging.getLogger(__name__)

firebase_initialized = False

# Initialize Firebase Admin SDK with all fields from env (if credentials provided)
if settings.FIREBASE_PRIVATE_KEY is not None:
    try:
        cred_dict = {
            "type": settings.FIREBASE_TYPE,
            "project_id": settings.FIREBASE_PROJECT_ID,
            "private_key_id": settings.FIREBASE_PRIVATE_KEY_ID,
            "private_key": settings.FIREBASE_PRIVATE_KEY.replace("\\n", "\n"),
            "client_email": settings.FIREBASE_CLIENT_EMAIL,
            "client_id": settings.FIREBASE_CLIENT_ID,
            "auth_uri": settings.FIREBASE_AUTH_URI,
            "token_uri": settings.FIREBASE_TOKEN_URI,
            "auth_provider_x509_cert_url": settings.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            "client_x509_cert_url": settings.FIREBASE_CLIENT_X509_CERT_URL,
            "universe_domain": settings.FIREBASE_UNIVERSE_DOMAIN
        }
        cred = credentials.Certificate(cred_dict)
        firebase_admin.initialize_app(cred)
        firebase_initialized = True
        logger.info(f"Firebase Admin SDK initialized successfully for project: {settings.FIREBASE_PROJECT_ID}")
    except Exception as e:
        logger.error(f"Failed to initialize Firebase Admin SDK: {e}")
        logger.warning("Continuing without Firebase support")
else:
    logger.warning("Firebase credentials not configured. Firebase features will be disabled.")

def verify_firebase_token(id_token: str) -> dict:
    """Verify Firebase ID token and return user info"""
    if not firebase_initialized or not id_token:
        return None
    try:
        decoded_token = auth.verify_id_token(id_token)
        logger.info(f"Firebase token verified for user: {decoded_token.get('uid')}")
        return decoded_token
    except Exception as e:
        logger.error(f"Firebase token verification failed: {e}")
        return None

def create_firebase_user(email: str, password: str, display_name: str = None):
    """Create a user in Firebase"""
    try:
        user = auth.create_user(
            email=email,
            password=password,
            display_name=display_name
        )
        logger.info(f"Firebase user created: {user.uid}")
        return user
    except Exception as e:
        logger.error(f"Firebase user creation failed: {e}")
        raise

def get_firebase_user(uid: str):
    """Get Firebase user by UID"""
    try:
        user = auth.get_user(uid)
        return user
    except Exception as e:
        logger.error(f"Firebase user fetch failed: {e}")
        return None