from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user
from models.user import User
from models.application_status_log import ApplicationStage, StageStatus
from app.schema.application_status import (
    ApplicationStatusLogResponse,
    StageActionRequest,
    ApplicationStatusTracker
)
from app.services.application_status_service import ApplicationStatusService

router = APIRouter(prefix="/application-status", tags=["Application Status Tracking"])


@router.get("/{application_id}", response_model=ApplicationStatusTracker)
def get_application_status_tracker(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get the complete status tracker for an application.
    Shows all stages and their current status.
    """
    tracker = ApplicationStatusService.get_application_status_tracker(db, application_id)
    if not tracker:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    return tracker


@router.get("/{application_id}/logs", response_model=List[ApplicationStatusLogResponse])
def get_application_status_logs(
    application_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all status logs for an application"""
    logs = ApplicationStatusService.get_application_status_logs(db, application_id)
    return logs


@router.post("/{application_id}/stage/{stage}/action", response_model=ApplicationStatusLogResponse)
def update_stage_status(
    application_id: str,
    stage: ApplicationStage,
    action: StageActionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Update the status of a specific stage (approve/reject).
    
    Workflow:
    - District Authority reviews documents → Approve/Reject
    - Social Welfare Officer reviews case → Approve/Reject
    - Financial Institution approves disbursement → Approve/Reject
    
    If approved, automatically moves to the next stage.
    If rejected, application is marked as rejected with comments.
    """
    # Validate rejection has comments
    if action.status == StageStatus.REJECTED and not action.comments:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Comments are required when rejecting an application"
        )
    
    # Get reviewer role
    reviewer_role = "UNKNOWN"
    if hasattr(current_user, 'role'):
        reviewer_role = current_user.role
    elif hasattr(current_user, 'roles') and current_user.roles:
        reviewer_role = current_user.roles[0].name if current_user.roles else "UNKNOWN"
    
    try:
        updated_log = ApplicationStatusService.update_stage_status(
            db=db,
            application_id=application_id,
            stage=stage,
            action=action,
            reviewed_by=current_user.id,
            reviewer_role=reviewer_role
        )
        return updated_log
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update stage status: {str(e)}"
        )


@router.get("/stage/{stage}/pending")
def get_pending_applications_for_stage(
    stage: ApplicationStage,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get all applications pending at a specific stage.
    Useful for authority dashboards to show pending work.
    """
    applications = ApplicationStatusService.get_pending_applications_for_stage(db, stage)
    return applications
