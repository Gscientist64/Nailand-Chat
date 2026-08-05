from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator
import json
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    # Environment
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database
    DATABASE_URL: str = "sqlite:///./nailand.db"
    
    # Security
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    
    # Firebase
    FIREBASE_TYPE: Optional[str] = None
    FIREBASE_PROJECT_ID: Optional[str] = None
    FIREBASE_PRIVATE_KEY_ID: Optional[str] = None
    FIREBASE_PRIVATE_KEY: Optional[str] = None
    FIREBASE_CLIENT_EMAIL: Optional[str] = None
    FIREBASE_CLIENT_ID: Optional[str] = None
    FIREBASE_AUTH_URI: Optional[str] = None
    FIREBASE_TOKEN_URI: Optional[str] = None
    FIREBASE_AUTH_PROVIDER_X509_CERT_URL: Optional[str] = None
    FIREBASE_CLIENT_X509_CERT_URL: Optional[str] = None
    FIREBASE_UNIVERSE_DOMAIN: str = "googleapis.com"
    
    # Email Verification (Reoon)
    EMAIL_VERIFIER_API_KEY: Optional[str] = None
    
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: Optional[int] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v):
        if isinstance(v, str):
            return json.loads(v)
        return v
    
    @property
    def database_url(self) -> str:
        """Get database URL with proper formatting"""
        url = self.DATABASE_URL
        # Ensure it uses postgresql:// not postgres://
        if url.startswith('postgres://'):
            url = url.replace('postgres://', 'postgresql://', 1)
        return url
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()