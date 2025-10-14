from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from .base import Base
import datetime
import enum
import uuid

class ApplicationStage(enum.Enum):
    """
    Stages in the application workflow:
    1. DISTRICT_AUTHORITY - Document verification and initial review
    2. SOCIAL_WELFARE - Social welfare officer review
    3. FINANCIAL_INSTITUTION - Final approval and disbursement
    4. COMPLETED - Application closed
    """
    DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
    SOCIAL_WELFARE = "SOCIAL_WELFARE"
    FINANCIAL_INSTITUTION = "FINANCIAL_INSTITUTION"
    COMPLETED = "COMPLETED"

class StageStatus(enum.Enum):
    """Status of each stage"""
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ApplicationStatusLog(Base):
    """
    Tracks the status of an application at each stage of the workflow.
    Each application will have multiple entries as it progresses through stages.
    """
    __tablename__ = "application_status_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, ForeignKey("applications.id"), nullable=False)
    
    # Stage information
    stage = Column(Enum(ApplicationStage), nullable=False)
    status = Column(Enum(StageStatus), default=StageStatus.PENDING, nullable=False)
    
    # Comments and feedback
    comments = Column(Text, nullable=True)  # Required if status is REJECTED
    rejection_reason = Column(Text, nullable=True)  # More detailed rejection reason
    
    # Reviewer information
    reviewed_by = Column(String, nullable=True)  # Name/identifier of reviewer (not a foreign key)
    reviewer_role = Column(String, nullable=True)  # Role of the reviewer
    
    # Timestamps
    stage_entered_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    stage_completed_at = Column(DateTime, nullable=True)  # When status changed from PENDING
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), 
                       onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Relationships
    application = relationship("Application", backref="status_logs")
