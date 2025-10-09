"""
District Authority endpoints for case and document management
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import structlog

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.exceptions import ValidationException, NotFoundException
from models.user import User, UserRole
from app.services.district_authority_service import DistrictAuthorityService
from sqlalchemy.orm import Session

logger = structlog.get_logger()
router = APIRouter()
security = HTTPBearer()


# Request/Response Models
class DocumentVerificationRequest(BaseModel):
    status: str  # "VERIFIED", "REJECTED", "PENDING"
    comments: Optional[str] = None

class CCTNSVerificationRequest(BaseModel):
    fir_number: str

class ApplicationReviewRequest(BaseModel):
    action: str  # "approve", "reject", "pending"
    comments: Optional[str] = None


@router.get("/applications/pending")
async def get_pending_applications(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_role([UserRole.DISTRICT_AUTHORITY, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get applications pending district authority review"""
    try:
        district_service = DistrictAuthorityService(db)
        applications = district_service.get_pending_applications(limit, offset)
        
        result = []
        for app in applications:
            result.append({
                "id": app.id,
                "application_number": app.application_number,
                "user_id": app.user_id,
                "title": app.title,
                "description": app.description,
                "application_type": app.application_type.value if app.application_type else None,
                "status": app.status.value,
                "amount_requested": float(app.amount_requested) if app.amount_requested else None,
                "fir_number": app.fir_number,
                "cctns_verified": app.cctns_verified,
                "submitted_at": app.submitted_at,
                "created_at": app.created_at
            })
        
        return {
            "applications": result,
            "total": len(result),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error("Failed to get pending applications", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get pending applications"
        )


@router.get("/applications/{application_id}")
async def get_application_details(
    application_id: str,
    current_user: User = Depends(require_role([UserRole.DISTRICT_AUTHORITY, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get detailed application information with user and documents"""
    try:
        district_service = DistrictAuthorityService(db)
        details = district_service.get_application_with_details(application_id)
        
        app = details["application"]
        user = details["user"]
        documents = details["documents"]
        
        return {
            "application": {
                "id": app.id,
                "application_number": app.application_number,
                "title": app.title,
                "description": app.description,
                "application_type": app.application_type.value if app.application_type else None,
                "status": app.status.value,
                "amount_requested": float(app.amount_requested) if app.amount_requested else None,
                "amount_approved": float(app.amount_approved) if app.amount_approved else None,
                "bank_account_number": app.bank_account_number,
                "bank_ifsc_code": app.bank_ifsc_code,
                "bank_name": app.bank_name,
                "bank_branch": app.bank_branch,
                "account_holder_name": app.account_holder_name,
                "fir_number": app.fir_number,
                "cctns_verified": app.cctns_verified,
                "cctns_verification_date": app.cctns_verification_date,
                "district_comments": app.district_comments,
                "district_reviewed_by": app.district_reviewed_by,
                "district_reviewed_at": app.district_reviewed_at,
                "submitted_at": app.submitted_at,
                "created_at": app.created_at
            },
            "applicant": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "aadhaar_number": user.aadhaar_number,
                "father_name": user.father_name,
                "mother_name": user.mother_name,
                "date_of_birth": user.date_of_birth,
                "age": user.age,
                "gender": user.gender.value if user.gender else None,
                "caste": user.caste.value if user.caste else None,
                "religion": user.religion.value if user.religion else None,
                "address": user.address,
                "district": user.district,
                "state": user.state,
                "pin_code": user.pin_code
            },
            "documents": [
                {
                    "id": doc.id,
                    "document_type": doc.document_type,
                    "document_name": doc.document_name,
                    "file_path": doc.file_path,
                    "mime_type": doc.mime_type,
                    "status": doc.status.value,
                    "verification_notes": doc.verification_notes,
                    "verified_by": doc.verified_by,
                    "verified_at": doc.verified_at,
                    "is_digilocker": doc.is_digilocker,
                    "created_at": doc.created_at
                }
                for doc in documents
            ]
        }
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to get application details", application_id=application_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get application details"
        )


@router.post("/applications/{application_id}/cctns-verify")
async def verify_fir_cctns(
    application_id: str,
    request: CCTNSVerificationRequest,
    current_user: User = Depends(require_role([UserRole.DISTRICT_AUTHORITY, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Verify FIR number through CCTNS system"""
    try:
        district_service = DistrictAuthorityService(db)
        
        # Verify FIR through CCTNS
        verification_result = district_service.verify_fir_cctns(request.fir_number)
        
        # Update application with verification result
        application = district_service.update_application_cctns_status(
            application_id=application_id,
            fir_number=request.fir_number,
            verified=verification_result["verified"],
            reviewer_id=current_user.id
        )
        
        return {
            "message": "CCTNS verification completed",
            "verification_result": verification_result,
            "application_status": application.status.value,
            "cctns_verified": application.cctns_verified
        }
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to verify FIR", application_id=application_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify FIR through CCTNS"
        )


@router.post("/documents/{document_id}/verify")
async def verify_document(
    document_id: str,
    request: DocumentVerificationRequest,
    current_user: User = Depends(require_role([UserRole.DISTRICT_AUTHORITY, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Verify a document - approve, reject, or add comments"""
    try:
        district_service = DistrictAuthorityService(db)
        document = district_service.verify_document(
            document_id=document_id,
            status=request.status,
            comments=request.comments,
            reviewer_id=current_user.id
        )
        
        action_text = {
            "VERIFIED": "approved",
            "REJECTED": "rejected", 
            "PENDING": "marked as pending with comments"
        }.get(request.status, "updated")
        
        return {
            "message": f"Document {action_text} successfully",
            "document": {
                "id": document.id,
                "status": document.status.value,
                "verification_notes": document.verification_notes,
                "verified_by": document.verified_by,
                "verified_at": document.verified_at
            }
        }
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to verify document", document_id=document_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify document"
        )


@router.post("/applications/{application_id}/review")
async def review_application(
    application_id: str,
    request: ApplicationReviewRequest,
    current_user: User = Depends(require_role([UserRole.DISTRICT_AUTHORITY, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Review application - approve, reject, or send back with comments"""
    try:
        district_service = DistrictAuthorityService(db)
        application = district_service.review_application(
            application_id=application_id,
            action=request.action,
            comments=request.comments,
            reviewer_id=current_user.id
        )
        
        action_messages = {
            "approve": "approved and forwarded to Social Welfare department",
            "reject": "rejected",
            "pending": "sent back to user for additional information"
        }
        
        return {
            "message": f"Application {action_messages.get(request.action, 'updated')}",
            "application": {
                "id": application.id,
                "status": application.status.value,
                "district_comments": application.district_comments,
                "district_reviewed_by": application.district_reviewed_by,
                "district_reviewed_at": application.district_reviewed_at,
                "approved_at": application.approved_at,
                "rejection_reason": application.rejection_reason
            }
        }
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except NotFoundException as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to review application", application_id=application_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to review application"
        )


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(require_role([UserRole.DISTRICT_AUTHORITY, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics for district authority"""
    try:
        district_service = DistrictAuthorityService(db)
        stats = district_service.get_dashboard_stats()
        
        return stats
    except Exception as e:
        logger.error("Failed to get dashboard stats", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard statistics"
        )