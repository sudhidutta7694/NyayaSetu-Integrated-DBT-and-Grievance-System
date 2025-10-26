"""
Application management endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
import structlog

from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.auth import (
    get_current_user_dependency, get_current_active_user_dependency,
    require_application_access, require_application_edit_access,
    require_approval_permission, require_disbursement_permission,
    PermissionChecker
)
from app.schema.user import User
from app.schema.application import (
    Application, ApplicationCreate, ApplicationUpdate, ApplicationSubmission,
    ApplicationReview, ApplicationDisbursement, ApplicationFilter,
    ApplicationStats, ApplicationStatus, ApplicationType
)
from app.services.application_service import ApplicationService

logger = structlog.get_logger()
router = APIRouter()


@router.post("/create", response_model=Application)
async def create_application(
    application_data: ApplicationCreate,
    current_user: User = Depends(get_current_active_user_dependency()),
    db: Session = Depends(get_db)
):
    try:
        application_service = ApplicationService(db)
        application = await application_service.create_application(
            current_user.id, application_data
        )
        logger.info("Application created", application_id=application.id, user_id=current_user.id)
        return application
    except Exception as e:
        logger.error("Failed to create application", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.get("/", response_model=List[Application])
async def get_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[ApplicationStatus] = None,
    application_type: Optional[ApplicationType] = None,
    current_user: User = Depends(get_current_active_user_dependency()),
    db: Session = Depends(get_db)
):
    """Get applications with optional filters"""
    try:
        application_service = ApplicationService(db)
        
        # Create filter
        filters = ApplicationFilter(
            status=status,
            application_type=application_type
        )
        
        # If user is not admin, only show their applications
        if current_user.role == "PUBLIC":
            filters.user_id = current_user.id
        
        applications = await application_service.get_applications(
            filters=filters, skip=skip, limit=limit
        )
        
        return applications
    except Exception as e:
        logger.error("Failed to get applications", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get applications"
        )


@router.get("/my", response_model=List[Application])
def get_my_applications(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_active_user_dependency()),
    db: Session = Depends(get_db)
):
    """Get current user's applications"""
    try:
        logger.info(f"get_my_applications called with skip={skip} (type={type(skip)}), limit={limit} (type={type(limit)}), current_user={getattr(current_user, 'id', None)}")
        application_service = ApplicationService(db)
        applications = application_service.get_user_applications(
            current_user.id, skip=skip, limit=limit
        )
        return applications
    except Exception as e:
        logger.error("Failed to get user applications", error=str(e), skip=skip, limit=limit, current_user=str(current_user))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to get applications: {str(e)}"
        )


@router.get("/stats", response_model=ApplicationStats)
async def get_application_stats(
    current_user: User = Depends(get_current_active_user_dependency()),
    db: Session = Depends(get_db)
):
    """Get application statistics"""
    try:
        application_service = ApplicationService(db)
        
        # Create filter based on user role
        filters = None
        if current_user.role == "PUBLIC":
            filters = ApplicationFilter(user_id=current_user.id)
        
        stats = await application_service.get_application_stats(filters=filters)
        return stats
    except Exception as e:
        logger.error("Failed to get application stats", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get application statistics"
        )


@router.get("/{application_id}", response_model=Application)
async def get_application(
    application_id: str,
    current_user: User = Depends(get_current_user_dependency()),
    db: Session = Depends(get_db)
):
    """Get application by ID"""
    try:
        application_service = ApplicationService(db)
        application = await application_service.get_application(application_id)
        
        # Check if application exists first
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Debug logging for permission check
        logger.info("Permission check", 
                   user_id=current_user.id, 
                   user_role=current_user.role,
                   application_user_id=application.user_id,
                   application_id=application_id)
        
        # Check permission
        if not PermissionChecker.can_view_application(current_user, application.user_id):
            logger.warning("Permission denied", 
                          user_id=current_user.id,
                          user_role=current_user.role, 
                          application_user_id=application.user_id,
                          match=current_user.id == application.user_id)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this application"
            )
        
        return application
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get application", application_id=application_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get application"
        )


@router.put("/{application_id}", response_model=Application)
async def update_application(
    application_id: str,
    update_data: ApplicationUpdate,
    current_user: User = Depends(get_current_user_dependency()),
    db: Session = Depends(get_db)
):
    """Update application"""
    try:
        application_service = ApplicationService(db)
        
        # Get the application first to check permissions
        existing_application = await application_service.get_application(application_id)
        if not existing_application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check permission
        if not PermissionChecker.can_edit_application(current_user, existing_application.user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Edit access denied to this application"
            )
        
        application = await application_service.update_application(
            application_id, update_data
        )
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        logger.info("Application updated", application_id=application_id, user_id=current_user.id)
        return application
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to update application", application_id=application_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{application_id}/submit", response_model=Application)
async def submit_application(
    application_id: str,
    submission_data: ApplicationSubmission,
    current_user: User = Depends(get_current_user_dependency()),
    db: Session = Depends(get_db)
):
    """Submit application for review"""
    try:
        application_service = ApplicationService(db)
        
        # Get the application first to check permissions
        existing_application = await application_service.get_application(application_id)
        if not existing_application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check permission
        if not PermissionChecker.can_edit_application(current_user, existing_application.user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Edit access denied to this application"
            )
        
        application = await application_service.submit_application(application_id)
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        logger.info("Application submitted", application_id=application_id, user_id=current_user.id)
        return application
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to submit application", application_id=application_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{application_id}/review", response_model=Application)
async def review_application(
    application_id: str,
    review_data: ApplicationReview,
    current_user: User = Depends(require_approval_permission),
    db: Session = Depends(get_db)
):
    """Review application"""
    try:
        application_service = ApplicationService(db)
        application = await application_service.review_application(
            application_id, review_data, current_user.id
        )
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        logger.info("Application reviewed", application_id=application_id, reviewer_id=current_user.id)
        return application
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to review application", application_id=application_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/{application_id}/disburse", response_model=Application)
async def disburse_funds(
    application_id: str,
    disbursement_data: ApplicationDisbursement,
    current_user: User = Depends(require_disbursement_permission),
    db: Session = Depends(get_db)
):
    """Disburse funds for approved application"""
    try:
        application_service = ApplicationService(db)
        application = await application_service.disburse_funds(
            application_id, disbursement_data, current_user.id
        )
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        logger.info("Funds disbursed", application_id=application_id, disburser_id=current_user.id)
        return application
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to disburse funds", application_id=application_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.delete("/{application_id}")
async def delete_application(
    application_id: str,
    current_user: User = Depends(get_current_user_dependency()),
    db: Session = Depends(get_db)
):
    """Delete application (only if in draft status)"""
    try:
        application_service = ApplicationService(db)
        
        # Get the application first to check permissions
        existing_application = await application_service.get_application(application_id)
        if not existing_application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check permission
        if not PermissionChecker.can_edit_application(current_user, existing_application.user_id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Edit access denied to this application"
            )
        
        success = await application_service.delete_application(application_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        logger.info("Application deleted", application_id=application_id, user_id=current_user.id)
        return {"message": "Application deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to delete application", application_id=application_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
