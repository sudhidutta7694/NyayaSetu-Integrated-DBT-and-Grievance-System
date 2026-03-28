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
    SECRET_KEY: str = config("SECRET_KEY")
    DEBUG: bool = config("DEBUG", default=True, cast=bool)
    ENVIRONMENT: str = config("ENVIRONMENT", default="development")
    
    # Database
    DATABASE_URL: str = config("DATABASE_URL")
    
    # JWT
    JWT_SECRET_KEY: str = config("JWT_SECRET_KEY")
    JWT_ALGORITHM: str = config("JWT_ALGORITHM")
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = config("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", cast=int)
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = config(
        "BACKEND_CORS_ORIGINS",
        cast=lambda v: [s.strip() for s in v.split(",")]
    )
    
    # Allowed hosts
    ALLOWED_HOSTS: List[str] = config(
        "ALLOWED_HOSTS",
        cast=lambda v: [s.strip() for s in v.split(",")]
    )
    
    # Aadhaar API (Simulated)
    AADHAAR_API_URL: str = config("AADHAAR_API_URL")
    AADHAAR_API_KEY: str = config("AADHAAR_API_KEY")
    
    # OTP
    OTP_EXPIRE_MINUTES: int = config("OTP_EXPIRE_MINUTES", default=5, cast=int)
    OTP_LENGTH: int = config("OTP_LENGTH", default=6, cast=int)
    
    # Twilio Settings
    TWILIO_ACCOUNT_SID: str = config("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN: str = config("TWILIO_AUTH_TOKEN")
    TWILIO_PHONE_NUMBER: str = config("TWILIO_PHONE_NUMBER")
    TWILIO_VERIFY_SERVICE_SID: str = config("TWILIO_VERIFY_SERVICE_SID")
    
    # DigiLocker (Simulated)
    DIGILOCKER_API_URL: str = config("DIGILOCKER_API_URL")
    DIGILOCKER_CLIENT_ID: str = config("DIGILOCKER_CLIENT_ID")
    DIGILOCKER_CLIENT_SECRET: str = config("DIGILOCKER_CLIENT_SECRET")
    
    # Gemini AI
    GEMINI_API_KEY: str = config("GEMINI_API_KEY")
    GEMINI_MODEL: str = config("GEMINI_MODEL")
    
    # File upload
    MAX_FILE_SIZE: int = config("MAX_FILE_SIZE", cast=int)
    ALLOWED_FILE_TYPES: List[str] = config(
        "ALLOWED_FILE_TYPES",
        cast=lambda v: [s.strip() for s in v.split(",")]
    )
    UPLOAD_DIR: str = "uploads"
    
    # AWS S3
    AWS_ACCESS_KEY_ID: str = config("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = config("AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = config("AWS_REGION")
    S3_BUCKET_NAME: str = config("S3_BUCKET_NAME")
    
    # Email
    SMTP_HOST: str = config("SMTP_HOST")
    SMTP_PORT: int = config("SMTP_PORT", cast=int)
    SMTP_USERNAME: str = config("SMTP_USERNAME")
    SMTP_PASSWORD: str = config("SMTP_PASSWORD")
    SMTP_FROM_EMAIL: str = config("SMTP_FROM_EMAIL")
    
    # Push notifications
    FCM_SERVER_KEY: str = config("FCM_SERVER_KEY")
    FCM_PROJECT_ID: str = config("FCM_PROJECT_ID")
    
    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = config("RATE_LIMIT_PER_MINUTE", cast=int)
    RATE_LIMIT_BURST: int = config("RATE_LIMIT_BURST", cast=int)
    
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