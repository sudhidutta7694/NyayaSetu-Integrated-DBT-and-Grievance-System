from datetime import datetime, date
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, validator
from enum import Enum

from app.schema.user import Gender, Category


class DocumentType(str, Enum):
    CASTE_CERTIFICATE = "CASTE_CERTIFICATE"
    BANK_PASSBOOK = "BANK_PASSBOOK"
    AADHAAR_CARD = "AADHAAR_CARD"
    INCOME_CERTIFICATE = "INCOME_CERTIFICATE"
    OTHER = "OTHER"


class OnboardingStep(BaseModel):
    id: str
    user_id: str
    step_number: int
    step_name: str
    is_completed: bool
    data: Optional[Dict[str, Any]] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class OnboardingStepCreate(BaseModel):
    """Create onboarding step"""
    user_id: str
    step_number: int
    step_name: str


class OnboardingStepUpdate(BaseModel):
    """Update onboarding step"""
    is_completed: Optional[bool] = None
    data: Optional[Dict[str, Any]] = None


class PersonalInfoData(BaseModel):
    """Personal information data for step 1"""
    full_name: str
    father_name: str
    mother_name: str
    date_of_birth: date
    age: int
    gender: Gender
    category: Category
    mobile_number: str
    email: Optional[str] = None
    address: str
    district: str
    state: str
    pincode: str

    @validator('age')
    def validate_age(cls, v):
        if v < 0 or v > 150:
            raise ValueError('Age must be between 0 and 150')
        return v

    @validator('mobile_number')
    def validate_mobile_number(cls, v):
        if not v.isdigit() or len(v) != 10:
            raise ValueError('Mobile number must be 10 digits')
        return v

    @validator('pincode')
    def validate_pincode(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError('Pincode must be 6 digits')
        return v


class DocumentUploadData(BaseModel):
    """Document upload data for step 2"""
    document_type: DocumentType
    file_name: str
    file_size: int
    mime_type: str
    is_digilocker: bool = False
    digilocker_id: Optional[str] = None


class BankDetailsData(BaseModel):
    """Bank details data for step 3"""
    account_number: str
    ifsc_code: str
    bank_name: str
    branch_name: str
    account_holder_name: str

    @validator('account_number')
    def validate_account_number(cls, v):
        if not v.isdigit() or len(v) < 9 or len(v) > 18:
            raise ValueError('Account number must be 9-18 digits')
        return v

    @validator('ifsc_code')
    def validate_ifsc_code(cls, v):
        import re
        v = v.upper()
        # IFSC format: First 4 letters (bank code), 5th character is 0, last 6 are alphanumeric (branch code)
        # Example: SBIN0001234, HDFC0000123
        if len(v) != 11:
            raise ValueError('IFSC code must be exactly 11 characters')
        if not re.match(r'^[A-Z]{4}0[A-Z0-9]{6}$', v):
            raise ValueError('Invalid IFSC code format. Must start with 4 letters, followed by 0, then 6 alphanumeric characters (e.g., SBIN0001234)')
        return v


class OnboardingProgress(BaseModel):
    user_id: str
    current_step: int
    total_steps: int
    is_completed: bool
    steps: List[OnboardingStep]


class OnboardingStatus(BaseModel):
    is_onboarded: bool
    current_step: int
    total_steps: int
    progress_percentage: float
    next_step_name: Optional[str] = None
    can_proceed: bool = False


