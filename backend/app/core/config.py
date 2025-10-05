"""
Application configuration settings
"""

from typing import List, Optional
from pydantic_settings import BaseSettings
from pydantic import field_validator, validator
import os
from decouple import config


class Settings(BaseSettings):
    """Application settings"""
    
    # Basic settings
    PROJECT_NAME: str = "NyayaSetu DBT System"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = config("SECRET_KEY", default="your-super-secret-key-change-this-in-production")
    DEBUG: bool = config("DEBUG", default=True, cast=bool)
    ENVIRONMENT: str = config("ENVIRONMENT", default="development")
    
    # Database
    DATABASE_URL: str = config(
        "DATABASE_URL", 
        default="postgresql://nyayasetu:password@postgres:5432/nyayasetu_db"
    )
    
    # JWT
    JWT_SECRET_KEY: str = config("JWT_SECRET_KEY", default="your-super-secret-jwt-key")
    JWT_ALGORITHM: str = config("JWT_ALGORITHM", default="HS256")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = config("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", default=30, cast=int)
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = config(
        "BACKEND_CORS_ORIGINS",
        default="http://localhost:3000,http://localhost:8000,https://nyaya-setu-integrated-dbt-and-griev.vercel.app",
        cast=lambda v: [s.strip() for s in v.split(",")]
    )
    
    # Allowed hosts
    ALLOWED_HOSTS: List[str] = config(
        "ALLOWED_HOSTS",
        default="localhost,127.0.0.1,0.0.0.0",
        cast=lambda v: [s.strip() for s in v.split(",")]
    )
    
    # Aadhaar API (Simulated)
    AADHAAR_API_URL: str = config("AADHAAR_API_URL", default="https://api.uidai.gov.in/otp")
    AADHAAR_API_KEY: str = config("AADHAAR_API_KEY", default="your-aadhaar-api-key")
    
    # OTP
    OTP_EXPIRE_MINUTES: int = config("OTP_EXPIRE_MINUTES", default=5, cast=int)
    OTP_LENGTH: int = config("OTP_LENGTH", default=6, cast=int)
    
    # Twilio Settings
    TWILIO_ACCOUNT_SID: str = config("TWILIO_ACCOUNT_SID", default="ACad6c04f93879628a6a1dd83e62e64428")
    TWILIO_AUTH_TOKEN: str = config("TWILIO_AUTH_TOKEN", default="2464c08b1381736d819ed5e7ae7b13e7")
    TWILIO_PHONE_NUMBER: str = config("TWILIO_PHONE_NUMBER", default="+1234567890")
    TWILIO_VERIFY_SERVICE_SID: str = config("TWILIO_VERIFY_SERVICE_SID", default="VA351caddc6a704c64c85b2b88f2dda889")
    
    # DigiLocker (Simulated)
    DIGILOCKER_API_URL: str = config("DIGILOCKER_API_URL", default="https://api.digilocker.gov.in")
    DIGILOCKER_CLIENT_ID: str = config("DIGILOCKER_CLIENT_ID", default="your-digilocker-client-id")
    DIGILOCKER_CLIENT_SECRET: str = config("DIGILOCKER_CLIENT_SECRET", default="your-digilocker-client-secret")
    
    # Gemini AI
    GEMINI_API_KEY: str = config("GEMINI_API_KEY", default="AIzaSyCzxQGmrgHa_v1tFJdfzdth2PCdZALFCfE")
    GEMINI_MODEL: str = config("GEMINI_MODEL", default="gemini-pro")
    
    # File upload
    MAX_FILE_SIZE: int = config("MAX_FILE_SIZE", default=10485760, cast=int)  # 10MB
    ALLOWED_FILE_TYPES: List[str] = config(
        "ALLOWED_FILE_TYPES",
        default="pdf,jpg,jpeg,png,doc,docx",
        cast=lambda v: [s.strip() for s in v.split(",")]
    )
    UPLOAD_DIR: str = "uploads"
    
    # Redis
    REDIS_URL: str = config("REDIS_URL", default="redis://redis:6379")
    
    # Email
    SMTP_HOST: str = config("SMTP_HOST", default="smtp.gmail.com")
    SMTP_PORT: int = config("SMTP_PORT", default=587, cast=int)
    SMTP_USERNAME: str = config("SMTP_USERNAME", default="")
    SMTP_PASSWORD: str = config("SMTP_PASSWORD", default="")
    SMTP_FROM_EMAIL: str = config("SMTP_FROM_EMAIL", default="noreply@nyayasetu.gov.in")
    
    # Push notifications
    FCM_SERVER_KEY: str = config("FCM_SERVER_KEY", default="")
    FCM_PROJECT_ID: str = config("FCM_PROJECT_ID", default="")
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = config("RATE_LIMIT_PER_MINUTE", default=60, cast=int)
    RATE_LIMIT_BURST: int = config("RATE_LIMIT_BURST", default=100, cast=int)
    
    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)
    
    @field_validator("ALLOWED_HOSTS", mode="before")
    @classmethod
    def assemble_allowed_hosts(cls, v):
        if isinstance(v, str):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, list):
            return v
        raise ValueError(v)
    
    class Config:
        case_sensitive = True
        env_file = ".env"


# Create settings instance
settings = Settings()