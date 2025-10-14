"""
Social Welfare Service
Handles social welfare officer operations including case approval and rejection
"""
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from typing import Optional
from decimal import Decimal

from models.application import Application, ApplicationStatus
from models.application_status_log import ApplicationStatusLog, ApplicationStage, StageStatus
from models.user import User


class SocialWelfareService:
    """Service for social welfare officer operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def approve_case(
        self,
        application_id: str,
        amount_approved: Decimal,
        comments: Optional[str] = None
    ) -> Application:
        """
        Approve a case and set the approved amount
        
        Args:
            application_id: ID of the application to approve
            amount_approved: Amount approved for disbursement
            comments: Optional approval comments
            
        Returns:
            Updated application
            
        Raises:
            ValueError: If application not found or invalid status
        """
        # Get application
        application = self.db.query(Application).filter(
            Application.id == application_id
        ).first()
        
        if not application:
            raise ValueError("Application not found")
        
        # Accept both APPROVED (legacy) and DOCUMENTS_APPROVED (new district authority status)
        if application.status not in [ApplicationStatus.APPROVED, ApplicationStatus.DOCUMENTS_APPROVED]:
            raise ValueError("Application is not in APPROVED or DOCUMENTS_APPROVED status")
        
        # Validate amount
        if amount_approved <= 0:
            raise ValueError("Approved amount must be positive")
        
        # Update application
        application.status = ApplicationStatus.SOCIAL_WELFARE_APPROVED
        application.amount_approved = amount_approved
        application.social_welfare_comments = comments
        application.social_welfare_reviewed_by = None
        application.social_welfare_reviewed_at = datetime.now(timezone.utc)
        application.approved_at = datetime.now(timezone.utc)
        application.updated_at = datetime.now(timezone.utc)
        
        # Create status log entry for SOCIAL_WELFARE stage completion
        status_log = ApplicationStatusLog(
            application_id=application_id,
            stage=ApplicationStage.SOCIAL_WELFARE,
            status=StageStatus.APPROVED,
            comments=comments or f"Approved with amount: ₹{amount_approved}",
            stage_entered_at=application.district_reviewed_at or application.submitted_at,
            stage_completed_at=datetime.now(timezone.utc)
        )
        
        self.db.add(status_log)
        self.db.commit()
        self.db.refresh(application)
        
        return application
    
    def reject_case(
        self,
        application_id: str,
        rejection_reason: str
    ) -> Application:
        """
        Reject a case with mandatory rejection reason
        
        Args:
            application_id: ID of the application to reject
            rejection_reason: Mandatory reason for rejection
            
        Returns:
            Updated application
            
        Raises:
            ValueError: If application not found, invalid status, or missing rejection reason
        """
        # Validate rejection reason
        if not rejection_reason or not rejection_reason.strip():
            raise ValueError("Rejection reason is required")
        
        # Get application
        application = self.db.query(Application).filter(
            Application.id == application_id
        ).first()
        
        if not application:
            raise ValueError("Application not found")
        
        # Accept both APPROVED (legacy) and DOCUMENTS_APPROVED (new district authority status)
        if application.status not in [ApplicationStatus.APPROVED, ApplicationStatus.DOCUMENTS_APPROVED]:
            raise ValueError("Application is not in APPROVED or DOCUMENTS_APPROVED status")
        
        # Update application - use specific social welfare rejection status
        application.status = ApplicationStatus.SOCIAL_WELFARE_REJECTED
        application.rejection_reason = rejection_reason
        application.social_welfare_comments = rejection_reason
        application.social_welfare_reviewed_by = None
        application.social_welfare_reviewed_at = datetime.now(timezone.utc)
        application.updated_at = datetime.now(timezone.utc)
        
        # Create status log entry for SOCIAL_WELFARE stage rejection
        status_log = ApplicationStatusLog(
            application_id=application_id,
            stage=ApplicationStage.SOCIAL_WELFARE,
            status=StageStatus.REJECTED,
            rejection_reason=rejection_reason,
            comments=rejection_reason,
            stage_entered_at=application.district_reviewed_at or application.submitted_at,
            stage_completed_at=datetime.now(timezone.utc)
        )
        
        self.db.add(status_log)
        self.db.commit()
        self.db.refresh(application)
        
        return application
