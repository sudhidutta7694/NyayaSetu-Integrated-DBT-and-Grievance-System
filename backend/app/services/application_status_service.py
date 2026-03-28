from sqlalchemy.orm import Session
from sqlalchemy import and_, desc
from typing import List, Optional
from datetime import datetime, timezone

from models.application_status_log import ApplicationStatusLog, ApplicationStage, StageStatus
from models.application import Application, ApplicationStatus
from app.schema.application_status import (
    ApplicationStatusLogCreate,
    ApplicationStatusLogUpdate,
    StageActionRequest,
    ApplicationStatusTracker
)

class ApplicationStatusService:
    """Service to manage application status tracking across stages"""

    @staticmethod
    def create_initial_status_log(db: Session, application_id: str) -> ApplicationStatusLog:
        """
        Create initial status log when application is submitted.
        Sets status to DISTRICT_AUTHORITY stage with PENDING status.
        """
        status_log = ApplicationStatusLog(
            application_id=application_id,
            stage=ApplicationStage.DISTRICT_AUTHORITY,
            status=StageStatus.PENDING,
            stage_entered_at=datetime.now(timezone.utc)
        )
        db.add(status_log)
        db.commit()
        db.refresh(status_log)
        return status_log

    @staticmethod
    def get_application_status_logs(db: Session, application_id: str) -> List[ApplicationStatusLog]:
        """Get all status logs for an application, ordered by creation date"""
        return db.query(ApplicationStatusLog)\
            .filter(ApplicationStatusLog.application_id == application_id)\
            .order_by(ApplicationStatusLog.created_at)\
            .all()

    @staticmethod
    def get_current_stage_log(db: Session, application_id: str) -> Optional[ApplicationStatusLog]:
        """Get the most recent status log for an application"""
        return db.query(ApplicationStatusLog)\
            .filter(ApplicationStatusLog.application_id == application_id)\
            .order_by(desc(ApplicationStatusLog.created_at))\
            .first()

    @staticmethod
    def get_stage_log(db: Session, application_id: str, stage: ApplicationStage) -> Optional[ApplicationStatusLog]:
        """Get status log for a specific stage"""
        return db.query(ApplicationStatusLog)\
            .filter(
                and_(
                    ApplicationStatusLog.application_id == application_id,
                    ApplicationStatusLog.stage == stage
                )
            )\
            .first()

    @staticmethod
    def update_stage_status(
        db: Session,
        application_id: str,
        stage: ApplicationStage,
        action: StageActionRequest,
        reviewed_by: str,
        reviewer_role: str
    ) -> ApplicationStatusLog:
        """
        Update the status of a stage (approve/reject).
        If approved, creates the next stage log.
        """
        # Validate rejection has comments
        if action.status == StageStatus.REJECTED and not action.comments:
            raise ValueError("Comments are required when rejecting an application")

        # Get or create the stage log
        stage_log = ApplicationStatusService.get_stage_log(db, application_id, stage)
        
        if not stage_log:
            # Create new stage log if it doesn't exist
            stage_log = ApplicationStatusLog(
                application_id=application_id,
                stage=stage,
                status=action.status,
                comments=action.comments,
                rejection_reason=action.rejection_reason,
                reviewed_by=reviewed_by,
                reviewer_role=reviewer_role,
                stage_entered_at=datetime.now(timezone.utc),
                stage_completed_at=datetime.now(timezone.utc)
            )
            db.add(stage_log)
        else:
            # Update existing stage log
            stage_log.status = action.status
            stage_log.comments = action.comments
            stage_log.rejection_reason = action.rejection_reason
            stage_log.reviewed_by = reviewed_by
            stage_log.reviewer_role = reviewer_role
            stage_log.stage_completed_at = datetime.now(timezone.utc)

        # Update main application status
        application = db.query(Application).filter(Application.id == application_id).first()
        if application:
            if action.status == StageStatus.REJECTED:
                application.status = ApplicationStatus.REJECTED
                application.rejection_reason = action.comments or action.rejection_reason
            elif action.status == StageStatus.APPROVED:
                # Move to next stage based on current stage
                if stage == ApplicationStage.DISTRICT_AUTHORITY:
                    application.status = ApplicationStatus.UNDER_REVIEW
                    # Create next stage log for Social Welfare
                    next_stage_log = ApplicationStatusLog(
                        application_id=application_id,
                        stage=ApplicationStage.SOCIAL_WELFARE,
                        status=StageStatus.PENDING,
                        stage_entered_at=datetime.now(timezone.utc)
                    )
                    db.add(next_stage_log)
                elif stage == ApplicationStage.SOCIAL_WELFARE:
                    application.status = ApplicationStatus.APPROVED
                    application.approved_at = datetime.now(timezone.utc)
                    # Create next stage log for Financial Institution
                    next_stage_log = ApplicationStatusLog(
                        application_id=application_id,
                        stage=ApplicationStage.FINANCIAL_INSTITUTION,
                        status=StageStatus.PENDING,
                        stage_entered_at=datetime.now(timezone.utc)
                    )
                    db.add(next_stage_log)
                elif stage == ApplicationStage.FINANCIAL_INSTITUTION:
                    application.status = ApplicationStatus.FUND_DISBURSED
                    application.disbursed_at = datetime.now(timezone.utc)
                    # Create completion log
                    completion_log = ApplicationStatusLog(
                        application_id=application_id,
                        stage=ApplicationStage.COMPLETED,
                        status=StageStatus.APPROVED,
                        stage_entered_at=datetime.now(timezone.utc),
                        stage_completed_at=datetime.now(timezone.utc)
                    )
                    db.add(completion_log)

        db.commit()
        db.refresh(stage_log)
        return stage_log

    @staticmethod
    def get_application_status_tracker(db: Session, application_id: str) -> ApplicationStatusTracker:
        """Get complete status tracker for an application"""
        logs = ApplicationStatusService.get_application_status_logs(db, application_id)
        
        tracker = ApplicationStatusTracker(
            application_id=application_id,
            current_stage=ApplicationStage.DISTRICT_AUTHORITY
        )
        
        for log in logs:
            if log.stage == ApplicationStage.DISTRICT_AUTHORITY:
                tracker.district_authority = log
            elif log.stage == ApplicationStage.SOCIAL_WELFARE:
                tracker.social_welfare = log
                tracker.current_stage = ApplicationStage.SOCIAL_WELFARE
            elif log.stage == ApplicationStage.FINANCIAL_INSTITUTION:
                tracker.financial_institution = log
                tracker.current_stage = ApplicationStage.FINANCIAL_INSTITUTION
            elif log.stage == ApplicationStage.COMPLETED:
                tracker.current_stage = ApplicationStage.COMPLETED
        
        return tracker

    @staticmethod
    def get_pending_applications_for_stage(db: Session, stage: ApplicationStage) -> List[Application]:
        """Get all applications pending at a specific stage"""
        pending_logs = db.query(ApplicationStatusLog)\
            .filter(
                and_(
                    ApplicationStatusLog.stage == stage,
                    ApplicationStatusLog.status == StageStatus.PENDING
                )
            )\
            .all()
        
        application_ids = [log.application_id for log in pending_logs]
        return db.query(Application)\
            .filter(Application.id.in_(application_ids))\
            .all()
