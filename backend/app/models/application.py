"""
Application models and schemas
"""

from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, validator
from enum import Enum

from app.core.security import generate_application_number  # (leave as is, since security is in app/core)


class ApplicationStatus(str, Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    DOCUMENT_VERIFICATION_PENDING = "DOCUMENT_VERIFICATION_PENDING"
    APPROVED = "APPROVED"  # Approved by district authority
    SOCIAL_WELFARE_APPROVED = "SOCIAL_WELFARE_APPROVED"  # Approved by social welfare
    REJECTED = "REJECTED"
    FUND_DISBURSED = "FUND_DISBURSED"
    COMPLETED = "COMPLETED"


class ApplicationType(str, Enum):
    PCR_RELIEF = "PCR_RELIEF"
    POA_COMPENSATION = "POA_COMPENSATION"
    INTER_CASTE_MARRIAGE = "INTER_CASTE_MARRIAGE"
    OTHER = "OTHER"


class ApplicationBase(BaseModel):
    """Base application model"""
    title: str
    description: Optional[str] = None
    application_type: ApplicationType
    amount_requested: Optional[Decimal] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    account_holder_name: Optional[str] = None

    @validator('amount_requested')
    def validate_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError('Amount cannot be negative')
        return v

    @validator('bank_account_number')
    def validate_account_number(cls, v):
        if v and not v.isdigit():
            raise ValueError('Bank account number must contain only digits')
        if v and len(v) < 10:
            raise ValueError('Bank account number must be at least 10 digits')
        return v

    @validator('bank_ifsc_code')
    def validate_ifsc_code(cls, v):
        if v and len(v) != 11:
            raise ValueError('IFSC code must be 11 characters')
        return v


class ApplicationCreate(ApplicationBase):
    """Application creation model"""
    pass


class ApplicationUpdate(BaseModel):
    """Application update model"""
    title: Optional[str] = None
    description: Optional[str] = None
    application_type: Optional[ApplicationType] = None
    amount_requested: Optional[Decimal] = None
    bank_account_number: Optional[str] = None
    bank_ifsc_code: Optional[str] = None
    bank_name: Optional[str] = None
    bank_branch: Optional[str] = None
    account_holder_name: Optional[str] = None

    @validator('amount_requested')
    def validate_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError('Amount cannot be negative')
        return v

    @validator('bank_account_number')
    def validate_account_number(cls, v):
        if v and not v.isdigit():
            raise ValueError('Bank account number must contain only digits')
        if v and len(v) < 10:
            raise ValueError('Bank account number must be at least 10 digits')
        return v

    @validator('bank_ifsc_code')
    def validate_ifsc_code(cls, v):
        if v and len(v) != 11:
            raise ValueError('IFSC code must be 11 characters')
        return v


class Application(ApplicationBase):
    """Application response model"""
    id: str
    application_number: str
    user_id: str
    status: ApplicationStatus
    amount_approved: Optional[Decimal] = None
    amount_disbursed: Optional[Decimal] = None
    submitted_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None
    disbursed_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ApplicationSubmission(BaseModel):
    """Application submission model"""
    confirm_terms: bool
    confirm_accuracy: bool

    @validator('confirm_terms')
    def validate_terms(cls, v):
        if not v:
            raise ValueError('You must accept the terms and conditions')
        return v

    @validator('confirm_accuracy')
    def validate_accuracy(cls, v):
        if not v:
            raise ValueError('You must confirm the accuracy of information')
        return v


class ApplicationReview(BaseModel):
    """Application review model"""
    status: ApplicationStatus
    amount_approved: Optional[Decimal] = None
    rejection_reason: Optional[str] = None
    review_notes: Optional[str] = None

    @validator('amount_approved')
    def validate_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError('Amount cannot be negative')
        return v

    @validator('rejection_reason')
    def validate_rejection_reason(cls, v, values):
        if values.get('status') == ApplicationStatus.REJECTED and not v:
            raise ValueError('Rejection reason is required when rejecting application')
        return v


class ApplicationDisbursement(BaseModel):
    """Application disbursement model"""
    amount: Decimal
    transaction_id: Optional[str] = None
    bank_reference: Optional[str] = None
    disbursement_notes: Optional[str] = None

    @validator('amount')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Disbursement amount must be positive')
        return v


class ApplicationStats(BaseModel):
    """Application statistics model"""
    total_applications: int
    pending_applications: int
    approved_applications: int
    rejected_applications: int
    disbursed_applications: int
    total_amount_requested: Decimal
    total_amount_approved: Decimal
    total_amount_disbursed: Decimal


class ApplicationFilter(BaseModel):
    """Application filter model"""
    status: Optional[ApplicationStatus] = None
    application_type: Optional[ApplicationType] = None
    user_id: Optional[str] = None
    district: Optional[str] = None
    state: Optional[str] = None
    date_from: Optional[datetime] = None
    date_to: Optional[datetime] = None
    amount_min: Optional[Decimal] = None
    amount_max: Optional[Decimal] = None


class ApplicationSearch(BaseModel):
    """Application search model"""
    query: str
    search_fields: Optional[List[str]] = None  # title, description, application_number, user_name


class ApplicationExport(BaseModel):
    """Application export model"""
    format: str  # csv, excel, pdf
    filters: Optional[ApplicationFilter] = None
    include_documents: bool = False
    include_audit_log: bool = False

