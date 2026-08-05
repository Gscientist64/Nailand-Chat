# app/api/v1/auth.py
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import secrets
import logging

from app.core.database import get_db
from app.core.security import (
    get_password_hash, verify_password, create_access_token,
    create_refresh_token
)
from app.core.firebase import verify_firebase_token
from app.schemas.user import (
    UserCreate, UserLogin, GoogleLoginRequest, TokenResponse,
    MessageResponse, VerifyEmailRequest, ResendCodeRequest,  # Make sure these are imported
    UserResponse
)
from app.models.user import User, Session as UserSession, EmailVerification
from app.services.email_service import send_verification_email, verify_email
from app.core.config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/signup", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def signup(
    user_data: UserCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Sign up with email and password"""
    logger.info(f"========== SIGNUP ATTEMPT ==========")
    logger.info(f"Email: {user_data.email}")
    logger.info(f"First Name: {user_data.first_name}")
    logger.info(f"Last Name: {user_data.last_name}")
    
    # Check if user exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        logger.info(f"User already exists: {user_data.email}, verified: {existing_user.is_verified}")
        if existing_user.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        else:
            logger.info(f"Resending verification code for unverified user")
            return await resend_verification_code(
                ResendCodeRequest(email=user_data.email),
                background_tasks,
                db
            )
    
    # Verify email using Reoon
    logger.info(f"Verifying email with Reoon: {user_data.email}")
    is_valid, message, verification_data = await verify_email(user_data.email)
    if not is_valid:
        logger.error(f"Email verification failed: {message}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Email verification failed: {message}"
        )
    logger.info(f"Email verification passed: {is_valid}")
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    logger.info(f"Creating new user in database")
    new_user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        email=user_data.email,
        password_hash=hashed_password,
        agreed_to_terms=True,
        agreed_at=datetime.utcnow(),
        is_verified=False
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    logger.info(f"User created with ID: {new_user.id}")
    
    # Generate 6-digit verification code
    verification_code = ''.join(secrets.choice('0123456789') for _ in range(6))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    logger.info(f"Generated verification code: {verification_code} for user {new_user.id}")
    
    # Save verification code
    verification = EmailVerification(
        user_id=new_user.id,
        code=verification_code,
        expires_at=expires_at
    )
    db.add(verification)
    db.commit()
    logger.info(f"Verification code saved to database with expiry: {expires_at}")
    
    # Send email in background
    logger.info(f"Adding email task to background tasks")
    background_tasks.add_task(
        send_verification_email,
        to_email=new_user.email,
        code=verification_code,
        first_name=new_user.first_name
    )
    logger.info(f"Email task added. Function will return now.")
    logger.info(f"========== SIGNUP COMPLETE ==========")
    
    return MessageResponse(
        message="User created successfully. Please verify your email.",
        detail=f"Verification code sent to {new_user.email}"
    )
    
@router.post("/verify-email", response_model=MessageResponse)
async def verify_email_endpoint(
    request: VerifyEmailRequest,
    db: Session = Depends(get_db)
):
    """Verify email with code (Step 2)"""
    # Find user
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        return MessageResponse(message="Email already verified")
    
    # Find valid verification code
    verification = db.query(EmailVerification).filter(
        EmailVerification.user_id == user.id,
        EmailVerification.code == request.code,
        EmailVerification.is_used == False,
        EmailVerification.expires_at > datetime.utcnow()
    ).first()
    
    if not verification:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code"
        )
    
    # Mark as verified
    verification.is_used = True
    user.is_verified = True
    db.commit()
    
    return MessageResponse(message="Email verified successfully")

@router.post("/resend-code", response_model=MessageResponse)
async def resend_verification_code(
    request: ResendCodeRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Resend verification code"""
    user = db.query(User).filter(User.email == request.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already verified"
        )
    
    # Check rate limiting (prevent spam)
    recent_codes = db.query(EmailVerification).filter(
        EmailVerification.user_id == user.id,
        EmailVerification.created_at > datetime.utcnow() - timedelta(minutes=5)
    ).count()
    
    if recent_codes >= 3:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Too many verification requests. Please wait 5 minutes."
        )
    
    # Generate new code
    verification_code = ''.join(secrets.choice('0123456789') for _ in range(6))
    expires_at = datetime.utcnow() + timedelta(minutes=10)
    
    # Invalidate old codes
    db.query(EmailVerification).filter(
        EmailVerification.user_id == user.id,
        EmailVerification.is_used == False
    ).update({"is_used": True})
    
    # Save new code
    verification = EmailVerification(
        user_id=user.id,
        code=verification_code,
        expires_at=expires_at
    )
    db.add(verification)
    db.commit()
    
    # Send email
    background_tasks.add_task(
        send_verification_email,
        to_email=user.email,
        code=verification_code,
        first_name=user.first_name
    )
    
    return MessageResponse(
        message="Verification code resent successfully",
        detail=f"Code sent to {user.email}"
    )

@router.post("/google", response_model=TokenResponse)
async def google_login(
    request: GoogleLoginRequest,
    db: Session = Depends(get_db)
):
    """Login or signup with Google"""
    try:
        from app.core.firebase import firebase_initialized
        
        if not firebase_initialized:
            raise HTTPException(
                status_code=status.HTTP_501_NOT_IMPLEMENTED,
                detail="Firebase is not configured on this server"
            )
        
        firebase_user = verify_firebase_token(request.id_token)
        
        if not firebase_user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid Firebase token"
            )
        
        user = db.query(User).filter(
            (User.firebase_uid == firebase_user['uid']) | 
            (User.email == firebase_user.get('email', ''))
        ).first()
        
        if user:
            if not user.firebase_uid:
                user.firebase_uid = firebase_user['uid']
                user.last_login_at = datetime.utcnow()
                db.commit()
        else:
            name_parts = firebase_user.get('name', '').split(' ')
            first_name = name_parts[0] if name_parts else 'User'
            last_name = ' '.join(name_parts[1:]) if len(name_parts) > 1 else ''
            
            user = User(
                firebase_uid=firebase_user['uid'],
                email=firebase_user.get('email', ''),
                first_name=first_name,
                last_name=last_name,
                is_verified=True,
                agreed_to_terms=True,
                agreed_at=datetime.utcnow()
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email}
        )
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=None,
            user=UserResponse.model_validate(user)
        )
    
    except Exception as e:
        logger.error(f"Google login failed: {e}")
        if "Firebase is not configured" in str(e):
            raise
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed"
        )

@router.post("/login", response_model=TokenResponse)
async def login(
    login_data: UserLogin,
    db: Session = Depends(get_db)
):
    """Login with email and password"""
    user = db.query(User).filter(User.email == login_data.email).first()
    
    if not user or not user.password_hash:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not verify_password(login_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please verify your email before logging in"
        )
    
    user.last_login_at = datetime.utcnow()
    
    # Create access token
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    # Create response data
    response_data = {
        "access_token": access_token,
        "refresh_token": None,  # ALWAYS include this, even if None
        "user": UserResponse.model_validate(user)
    }
    
    # Only create refresh token if remember_me is True
    if login_data.remember_me:
        refresh_token = create_refresh_token()
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        session = UserSession(
            user_id=user.id,
            refresh_token=refresh_token,
            expires_at=expires_at
        )
        db.add(session)
        response_data["refresh_token"] = refresh_token  # Override with actual token
    
    db.commit()
    
    # Now create the response - it will always have refresh_token field
    return TokenResponse(**response_data)

@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Get new access token using refresh token"""
    session = db.query(UserSession).filter(
        UserSession.refresh_token == refresh_token,
        UserSession.expires_at > datetime.utcnow()
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    user = session.user
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive"
        )
    
    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=UserResponse.model_validate(user)
    )

@router.post("/logout")
async def logout(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    """Logout user by invalidating refresh token"""
    db.query(UserSession).filter(UserSession.refresh_token == refresh_token).delete()
    db.commit()
    
    return MessageResponse(message="Logged out successfully")