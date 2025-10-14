from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum

class ApplicationStageEnum(str, Enum):
    DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
    SOCIAL_WELFARE = "SOCIAL_WELFARE"
    FINANCIAL_INSTITUTION = "FINANCIAL_INSTITUTION"
    COMPLETED = "COMPLETED"

class StageStatusEnum(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class ApplicationStatusLogBase(BaseModel):
    stage: ApplicationStageEnum
    status: StageStatusEnum
    comments: Optional[str] = None
    rejection_reason: Optional[str] = None

class ApplicationStatusLogCreate(ApplicationStatusLogBase):
    application_id: str
    reviewed_by: Optional[str] = None
    reviewer_role: Optional[str] = None

class ApplicationStatusLogUpdate(BaseModel):
    status: Optional[StageStatusEnum] = None
    comments: Optional[str] = None
    rejection_reason: Optional[str] = None
    reviewed_by: Optional[str] = None
    reviewer_role: Optional[str] = None

class ApplicationStatusLogResponse(ApplicationStatusLogBase):
    id: str
    application_id: str
    reviewed_by: Optional[str] = None
    reviewer_role: Optional[str] = None
    stage_entered_at: datetime
    stage_completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class StageActionRequest(BaseModel):
    """Request to update stage status (approve/reject)"""
    status: StageStatusEnum
    comments: Optional[str] = Field(None, description="Required if status is REJECTED")
    rejection_reason: Optional[str] = Field(None, description="Detailed reason for rejection")

class ApplicationStatusTracker(BaseModel):
    """Complete status tracking for an application"""
    application_id: str
    current_stage: ApplicationStageEnum
    district_authority: Optional[ApplicationStatusLogResponse] = None
    social_welfare: Optional[ApplicationStatusLogResponse] = None
    financial_institution: Optional[ApplicationStatusLogResponse] = None

    class Config:
        from_attributes = True
