"""
Financial Institution Service
Handles FI-specific operations like viewing pending approvals and approving/rejecting applications
"""

from typing import List, Optional
from decimal import Decimal
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import or_

from models.application import Application, ApplicationStatus
from models.user import User
from models.application_status_log import ApplicationStage, StageStatus
from app.services.application_status_service import ApplicationStatusService
from app.schema.application_status import StageActionRequest, StageStatusEnum, ApplicationStageEnum
from app.core.exceptions import NotFoundException, ValidationException


class FIService:
    def __init__(self, db: Session):
        self.db = db

    def get_pending_applications(self) -> List[Application]:
        """
        Get all applications that are approved by social welfare and pending FI approval
        Status: SOCIAL_WELFARE_APPROVED
        """
        applications = self.db.query(Application).filter(
            Application.status == ApplicationStatus.SOCIAL_WELFARE_APPROVED
        ).order_by(Application.submitted_at.desc()).all()
        
        return applications

    def get_processed_applications(self) -> List[Application]:
        """
        Get all applications that have been processed by FI (approved for disbursement or rejected)
        Status: FUND_DISBURSED, COMPLETED, FI_REJECTED, or REJECTED (for backward compatibility)
        """
        applications = self.db.query(Application).filter(
            or_(
                Application.status == ApplicationStatus.FUND_DISBURSED,
                Application.status == ApplicationStatus.COMPLETED,
                Application.status == ApplicationStatus.FI_REJECTED,
                Application.status == ApplicationStatus.REJECTED  # Include generic for backward compatibility
            )
        ).order_by(Application.updated_at.desc()).all()
        
        return applications

    def approve_for_disbursement(
        self,
        application_id: str,
        comments: Optional[str] = None
    ) -> Application:
        """
        Approve an application for fund disbursement
        """
        application = self.db.query(Application).filter(
            Application.id == application_id
        ).first()

        if not application:
            raise NotFoundException(f"Application {application_id} not found")

        if application.status != ApplicationStatus.SOCIAL_WELFARE_APPROVED:
            raise ValidationException(
                f"Application must be in SOCIAL_WELFARE_APPROVED status. Current status: {application.status.value}"
            )

        # Update application status to FUND_DISBURSED
        application.status = ApplicationStatus.FUND_DISBURSED
        application.updated_at = datetime.utcnow()

        # Update application status log using static method
        action = StageActionRequest(
            status=StageStatusEnum.APPROVED,
            comments=comments or "Approved for disbursement by Financial Institution"
        )
        ApplicationStatusService.update_stage_status(
            db=self.db,
            application_id=application_id,
            stage=ApplicationStage.FINANCIAL_INSTITUTION,
            action=action,
            reviewed_by="FI Officer",  # TODO: Get from current user
            reviewer_role="FINANCIAL_INSTITUTION"
        )

        self.db.commit()
        self.db.refresh(application)

        return application

    def reject_application(
        self,
        application_id: str,
        rejection_reason: str
    ) -> Application:
        """
        Reject an application at FI stage
        """
        if not rejection_reason or not rejection_reason.strip():
            raise ValidationException("Rejection reason is required")

        application = self.db.query(Application).filter(
            Application.id == application_id
        ).first()

        if not application:
            raise NotFoundException(f"Application {application_id} not found")

        if application.status != ApplicationStatus.SOCIAL_WELFARE_APPROVED:
            raise ValidationException(
                f"Application must be in SOCIAL_WELFARE_APPROVED status. Current status: {application.status.value}"
            )

        # Update application status to FI_REJECTED
        application.status = ApplicationStatus.FI_REJECTED
        application.updated_at = datetime.utcnow()

        # Update application status log using static method
        action = StageActionRequest(
            status=StageStatusEnum.REJECTED,
            comments=rejection_reason,
            rejection_reason=rejection_reason
        )
        ApplicationStatusService.update_stage_status(
            db=self.db,
            application_id=application_id,
            stage=ApplicationStage.FINANCIAL_INSTITUTION,
            action=action,
            reviewed_by="FI Officer",  # TODO: Get from current user
            reviewer_role="FINANCIAL_INSTITUTION"
        )

        self.db.commit()
        self.db.refresh(application)

        return application

    def get_application_details(self, application_id: str) -> Optional[Application]:
        """
        Get full application details for review
        """
        application = self.db.query(Application).filter(
            Application.id == application_id
        ).first()

        if not application:
            raise NotFoundException(f"Application {application_id} not found")

        return application

    def disburse_batch(self) -> dict:
        """
        Demo method: Disburse all FUND_DISBURSED applications in a batch
        Updates status from FUND_DISBURSED to COMPLETED
        """
        # Get all applications that are approved for disbursement
        applications = self.db.query(Application).filter(
            Application.status == ApplicationStatus.FUND_DISBURSED
        ).all()

        if not applications:
            raise ValidationException("No applications ready for disbursement")

        disbursed_count = 0
        total_amount = Decimal('0')

        for application in applications:
            # Update status to COMPLETED
            application.status = ApplicationStatus.COMPLETED
            application.updated_at = datetime.utcnow()

            # Update application status log - mark COMPLETED stage as APPROVED
            action = StageActionRequest(
                status=StageStatusEnum.APPROVED,
                comments="Funds successfully disbursed via batch processing"
            )
            ApplicationStatusService.update_stage_status(
                db=self.db,
                application_id=application.id,
                stage=ApplicationStage.COMPLETED,
                action=action,
                reviewed_by="FI System",
                reviewer_role="FINANCIAL_INSTITUTION"
            )

            disbursed_count += 1
            if application.amount_approved:
                total_amount += application.amount_approved

        self.db.commit()

        return {
            "disbursed_count": disbursed_count,
            "total_amount": total_amount
        }
