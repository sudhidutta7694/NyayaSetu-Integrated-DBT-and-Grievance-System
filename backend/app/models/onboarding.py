"""
Onboarding models and schemas
"""

from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator
from enum import Enum

from app.models.user import Gender, Category


class OnboardingStepType(str, Enum):
    PERSONAL_INFO = "PERSONAL_INFO"
    DOCUMENT_UPLOAD = "DOCUMENT_UPLOAD"
    BANK_DETAILS = "BANK_DETAILS"
    VERIFICATION = "VERIFICATION"
    COMPLETED = "COMPLETED"


class DocumentType(str, Enum):
    CASTE_CERTIFICATE = "CASTE_CERTIFICATE"
    BANK_PASSBOOK = "BANK_PASSBOOK"
    AADHAAR_CARD = "AADHAAR_CARD"
    INCOME_CERTIFICATE = "INCOME_CERTIFICATE"
    OTHER = "OTHER"


class OnboardingStepBase(BaseModel):
    """Base onboarding step model"""
    step_number: int
    step_name: str
    is_completed: bool = False
    data: Optional[Dict[str, Any]] = None


class OnboardingStepCreate(OnboardingStepBase):
    """Onboarding step creation model"""
    user_id: str


class OnboardingStepUpdate(BaseModel):
    """Onboarding step update model"""
    is_completed: Optional[bool] = None
    data: Optional[Dict[str, Any]] = None


class OnboardingStep(OnboardingStepBase):
    """Onboarding step response model"""
    id: str
    user_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PersonalInfoData(BaseModel):
    """Personal information data model"""
    father_name: str
    mother_name: str
    date_of_birth: datetime
    age: int
    gender: Gender
    category: Category
    address: str
    district: str
    state: str
    pincode: str

    @validator('age')
    def validate_age(cls, v):
        if v < 0 or v > 150:
            raise ValueError('Age must be between 0 and 150')
        return v


class DocumentUploadData(BaseModel):
    """Document upload data model"""
    document_type: DocumentType
    file_name: str
    file_size: int
    mime_type: str
    is_digilocker: bool = False
    digilocker_id: Optional[str] = None
    ocr_data: Optional[Dict[str, Any]] = None


class BankDetailsData(BaseModel):
    """Bank details data model"""
    account_number: str
    ifsc_code: str
    bank_name: str
    branch_name: str
    account_holder_name: str

    @validator('account_number')
    def validate_account_number(cls, v):
        if not v.isdigit() or len(v) < 9 or len(v) > 18:
            raise ValueError('Invalid account number format')
        return v

    @validator('ifsc_code')
    def validate_ifsc_code(cls, v):
        if len(v) != 11 or not v[:4].isalpha() or not v[4:].isalnum():
            raise ValueError('Invalid IFSC code format')
        return v


class OnboardingProgress(BaseModel):
    """Onboarding progress model"""
    user_id: str
    current_step: int
    total_steps: int
    is_completed: bool
    steps: List[OnboardingStep]


class OnboardingStatus(BaseModel):
    """Onboarding status model"""
    is_onboarded: bool
    current_step: int
    total_steps: int
    progress_percentage: float
    next_step_name: Optional[str] = None
    can_proceed: bool = False


class DigiLockerDocument(BaseModel):
    """DigiLocker document model"""
    document_id: str
    document_type: str
    document_name: str
    issued_by: str
    issued_date: datetime
    expiry_date: Optional[datetime] = None
    file_url: str
    is_verified: bool = False


class DocumentVerificationRequest(BaseModel):
    """Document verification request model"""
    document_id: str
    status: str  # VERIFIED, REJECTED
    comments: Optional[str] = None
    verified_by: str


class DocumentVerificationResponse(BaseModel):
    """Document verification response model"""
    document_id: str
    status: str
    verified_at: datetime
    verified_by: str
    comments: Optional[str] = None

