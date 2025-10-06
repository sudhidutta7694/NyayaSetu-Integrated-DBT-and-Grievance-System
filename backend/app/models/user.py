"""
User models and schemas
"""

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, validator
from enum import Enum

from app.core.security import validate_aadhaar_number, validate_phone_number, validate_pincode


class UserRole(str, Enum):
    PUBLIC = "PUBLIC"
    DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
    SOCIAL_WELFARE = "SOCIAL_WELFARE"
    FINANCIAL_INSTITUTION = "FINANCIAL_INSTITUTION"
    ADMIN = "ADMIN"


class Gender(str, Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"


class Category(str, Enum):
    SC = "SC"
    ST = "ST"
    OBC = "OBC"
    GENERAL = "GENERAL"
    OTHER = "OTHER"


class UserBase(BaseModel):
    """Base user model"""
    email: EmailStr
    phone_number: Optional[str] = None
    full_name: str
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    aadhaar_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    category: Optional[Category] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    profile_image: Optional[str] = None

    @validator('aadhaar_number')
    def validate_aadhaar(cls, v):
        if v and not validate_aadhaar_number(v):
            raise ValueError('Invalid Aadhaar number format')
        return v

    @validator('phone_number')
    def validate_phone(cls, v):
        if v in (None, ""):
            return v
        if not validate_phone_number(v):
            raise ValueError('Invalid phone number format')
        return v

    @validator('pincode')
    def validate_pincode(cls, v):
        if v and not validate_pincode(v):
            raise ValueError('Invalid pincode format')
        return v


class UserCreate(UserBase):
    """User creation model"""
    role: Optional[UserRole] = None


class UserUpdate(BaseModel):
    """User update model"""
    full_name: Optional[str] = None
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    category: Optional[Category] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    profile_image: Optional[str] = None

    @validator('pincode')
    def validate_pincode(cls, v):
        if v and not validate_pincode(v):
            raise ValueError('Invalid pincode format')
        return v


class UserLogin(BaseModel):
    """User login model"""
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None

    @validator('phone_number')
    def validate_phone(cls, v):
        if v and not validate_phone_number(v):
            raise ValueError('Invalid phone number format')
        return v


class User(UserBase):
    """User response model"""
    id: str
    role: UserRole
    is_active: bool
    is_verified: bool
    is_onboarded: bool
    onboarding_step: int
    created_at: datetime
    updated_at: datetime
    last_login: Optional[datetime] = None

    class Config:
        from_attributes = True


class UserProfile(BaseModel):
    """User profile model"""
    id: str
    full_name: str
    father_name: Optional[str] = None
    mother_name: Optional[str] = None
    email: str
    phone_number: Optional[str] = None
    aadhaar_number: Optional[str] = None
    date_of_birth: Optional[datetime] = None
    age: Optional[int] = None
    gender: Optional[Gender] = None
    category: Optional[Category] = None
    address: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    profile_image: Optional[str] = None
    role: UserRole
    is_active: bool
    is_verified: bool
    is_onboarded: bool
    onboarding_step: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OTPRequest(BaseModel):
    """OTP request model"""
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    purpose: str = "LOGIN"  # LOGIN, VERIFICATION, RESET_PASSWORD

    @validator('phone_number')
    def validate_phone(cls, v):
        if v and not validate_phone_number(v):
            raise ValueError('Invalid phone number format')
        return v


class OTPVerify(BaseModel):
    """OTP verification model"""
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    otp_code: str

    @validator('phone_number')
    def validate_phone(cls, v):
        if v and not validate_phone_number(v):
            raise ValueError('Invalid phone number format')
        return v


class AadhaarVerification(BaseModel):
    """Aadhaar verification model"""
    aadhaar_number: str
    otp: str

    @validator('aadhaar_number')
    def validate_aadhaar(cls, v):
        if not validate_aadhaar_number(v):
            raise ValueError('Invalid Aadhaar number format')
        return v


class PasswordReset(BaseModel):
    """Password reset model"""
    phone_number: Optional[str] = None
    email: Optional[EmailStr] = None
    otp: str
    new_password: str

    @validator('phone_number')
    def validate_phone(cls, v):
        if v and not validate_phone_number(v):
            raise ValueError('Invalid phone number format')
        return v

    @validator('new_password')
    def validate_password(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v
