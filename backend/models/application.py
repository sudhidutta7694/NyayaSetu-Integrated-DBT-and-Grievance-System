from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Text, Numeric
from sqlalchemy.orm import relationship
from .base import Base
import datetime
import enum
import uuid

class ApplicationStatus(enum.Enum):
    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    UNDER_REVIEW = "UNDER_REVIEW"
    DOCUMENT_VERIFICATION_PENDING = "DOCUMENT_VERIFICATION_PENDING"
    APPROVED = "APPROVED"
    SOCIAL_WELFARE_APPROVED = "SOCIAL_WELFARE_APPROVED"
    REJECTED = "REJECTED"
    FUND_DISBURSED = "FUND_DISBURSED"
    COMPLETED = "COMPLETED"

class ApplicationType(enum.Enum):
    SCHOLARSHIP = "SCHOLARSHIP"
    PENSION = "PENSION"
    SUBSIDY = "SUBSIDY"
    COMPENSATION = "COMPENSATION"
    POA_COMPENSATION = "POA_COMPENSATION"

class Application(Base):
    __tablename__ = "applications"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_number = Column(String, unique=True, nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    application_type = Column(Enum(ApplicationType))
    status = Column(Enum(ApplicationStatus), default=ApplicationStatus.DRAFT)
    amount_requested = Column(Numeric(10, 2))
    amount_approved = Column(Numeric(10, 2))
    amount_disbursed = Column(Numeric(10, 2))
    bank_account_number = Column(String)
    bank_ifsc_code = Column(String)
    bank_name = Column(String)
    bank_branch = Column(String)
    account_holder_name = Column(String)
    fir_number = Column(String)
    district_comments = Column(Text)
    cctns_verified = Column(Boolean, default=False)
    cctns_verification_date = Column(DateTime)
    district_reviewed_by = Column(String)
    district_reviewed_at = Column(DateTime)
    submitted_at = Column(DateTime)
    reviewed_at = Column(DateTime)
    approved_at = Column(DateTime)
    disbursed_at = Column(DateTime)
    rejection_reason = Column(Text)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    user = relationship("User", back_populates="applications")
    documents = relationship("Document", back_populates="application")