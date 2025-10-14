
"""
Case management endpoints
"""

from typing import List, Optional
from datetime import datetime
from decimal import Decimal

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, validator
from app.core.database import get_db
from app.core.security import verify_token
from sqlalchemy.orm import Session
from models.application import Application, ApplicationStatus
from models.user import User, UserRole
from models.document import Document
from app.services.social_welfare_service import SocialWelfareService

security = HTTPBearer()
router = APIRouter()


def get_application_documents(db: Session, application: Application) -> List[Document]:
    """
    Helper function to get documents for an application.
    Uses many-to-many relationship first, falls back to application_id for backward compatibility.
    """
    if application.linked_documents:
        return application.linked_documents
    # Fallback to old relationship
    return db.query(Document).filter(Document.application_id == application.id).all()


# Request models for social welfare actions
class SocialWelfareApprovalRequest(BaseModel):
    """Request model for social welfare approval"""
    amount_approved: Decimal = Field(..., description="Amount approved for disbursement", gt=0)
    comments: Optional[str] = Field(None, description="Optional approval comments")
    
    @validator('amount_approved')
    def validate_amount(cls, v):
        if v <= 0:
            raise ValueError('Amount must be positive')
        return v


class SocialWelfareRejectionRequest(BaseModel):
    """Request model for social welfare rejection"""
    rejection_reason: str = Field(..., description="Mandatory reason for rejection")
    
    @validator('rejection_reason')
    def validate_rejection_reason(cls, v):
        if not v or not v.strip():
            raise ValueError('Rejection reason is required')
        return v.strip()

# Social Welfare: Get full case details for review
@router.get(
    "/social-welfare/case/{case_id}",
    response_model=dict,
    tags=["cases"],
    summary="Get Social Welfare Case Details",
    description="Retrieve full details of a case for review by social welfare officers."
)
def get_case_details_social_welfare(
    case_id: str,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get full case details for review by social welfare officers."""
    from app.services.s3_service import S3Service
    import structlog
    
    logger = structlog.get_logger()
    
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.SOCIAL_WELFARE.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    case = db.query(Application).filter(Application.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    user = db.query(User).filter(User.id == case.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Applicant not found")
    documents = get_application_documents(db, case)
    
    # Generate presigned URLs for documents
    s3_service = S3Service()
    document_list = []
    for doc in documents:
        doc_data = {
            "id": doc.id,
            "document_type": doc.document_type,
            "document_name": doc.document_name,
            "file_path": None,
            "file_url": None,
            "file_size": doc.file_size,
            "mime_type": doc.mime_type,
            "status": doc.status.value if doc.status else None,
            "is_digilocker": doc.is_digilocker,
            "digilocker_uri": doc.digilocker_uri,
            "verification_notes": doc.verification_notes,
            "verified_by": doc.verified_by,
            "verified_at": doc.verified_at,
            "created_at": doc.created_at,
            "updated_at": doc.updated_at,
        }
        
        # Generate presigned URL if file exists and not from digilocker
        if doc.file_path and not doc.is_digilocker:
            try:
                presigned_url = s3_service.generate_presigned_download_url(
                    doc.file_path, 
                    expiration=3600
                )
                doc_data["file_url"] = presigned_url
                doc_data["file_path"] = presigned_url  # Keep backward compatibility
            except Exception as e:
                logger.warning(
                    "Failed to generate presigned URL",
                    document_id=doc.id,
                    error=str(e)
                )
        
        document_list.append(doc_data)
    
    return {
        "id": case.id,
        "application_number": case.application_number,
        "user_id": case.user_id,
        "title": case.title,
        "description": case.description,
        "application_type": case.application_type.value if case.application_type else None,
        "status": case.status.value,
        "submitted_at": case.submitted_at,
        "bank_account_number": case.bank_account_number,
        "bank_ifsc_code": case.bank_ifsc_code,
        "bank_name": case.bank_name,
        "bank_branch": case.bank_branch,
        "account_holder_name": case.account_holder_name,
        "amount_approved": str(case.amount_approved) if case.amount_approved else None,
        "fir_number": case.fir_number,
        "cctns_verified": case.cctns_verified,
        "cctns_verification_date": case.cctns_verification_date,
        "incident_date": case.incident_date,
        "incident_description": case.incident_description,
        "incident_district": case.incident_district,
        "police_station": case.police_station,
        "applicant": {
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "aadhaar_number": user.aadhaar_number,
            "father_name": user.father_name,
            "mother_name": user.mother_name,
            "date_of_birth": user.date_of_birth,
            "age": user.age,
            "gender": user.gender.value if user.gender else None,
            "category": user.category.value if user.category else None,
            "address": user.address,
            "district": user.district,
            "state": user.state,
            "pincode": user.pincode,
            "profile_image": user.profile_image,
        },
        "documents": document_list,
    }

# Social Welfare endpoints for case management
@router.get("/social-welfare/pending", response_model=List[dict])
def list_pending_cases_social_welfare(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.SOCIAL_WELFARE.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    # Accept both APPROVED (legacy) and DOCUMENTS_APPROVED (new district authority status)
    cases = db.query(Application).filter(
        Application.status.in_([
            ApplicationStatus.APPROVED,
            ApplicationStatus.DOCUMENTS_APPROVED
        ])
    ).all()
    return [
        {
            "id": case.id,
            "application_number": case.application_number,
            "user_id": case.user_id,
            "title": case.title,
            "application_type": case.application_type.value if case.application_type else None,
            "status": case.status.value,
            "submitted_at": case.submitted_at,
            "fir_number": case.fir_number,
            "cctns_verified": case.cctns_verified,
        } for case in cases
    ]

@router.get("/social-welfare/approved", response_model=List[dict])
def list_approved_cases_social_welfare(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all cases processed by social welfare (approved or rejected)"""
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.SOCIAL_WELFARE.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Fetch cases that have been processed by social welfare (approved or rejected)
    cases = db.query(Application).filter(
        Application.status.in_([
            ApplicationStatus.SOCIAL_WELFARE_APPROVED,
            ApplicationStatus.SOCIAL_WELFARE_REJECTED,
            ApplicationStatus.REJECTED  # Include generic rejection for backward compatibility
        ])
    ).order_by(Application.updated_at.desc()).all()
    
    result = []
    for case in cases:
        # Get user details for each case
        user = db.query(User).filter(User.id == case.user_id).first()
        
        result.append({
            "id": case.id,
            "application_number": case.application_number,
            "user_id": case.user_id,
            "title": case.title,
            "description": case.description,
            "application_type": case.application_type.value if case.application_type else None,
            "status": case.status.value,
            "submitted_at": case.submitted_at,
            "amount_approved": case.amount_approved,
            "social_welfare_comments": case.social_welfare_comments,
            "rejection_reason": case.rejection_reason,
            "fir_number": case.fir_number,
            "cctns_verified": case.cctns_verified,
            "created_at": case.created_at,
            "updated_at": case.updated_at,
            # Include user data
            "applicant_name": user.full_name if user else None,
            "user": {
                "full_name": user.full_name if user else None,
                "email": user.email if user else None,
                "phone_number": user.phone_number if user else None,
                "address": user.address if user else None
            } if user else None
        })
    
    return result

@router.post("/social-welfare/{case_id}/approve")
def approve_case_social_welfare(
    case_id: str,
    request: SocialWelfareApprovalRequest,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Approve a case and set the approved amount.
    Requires amount_approved in the request body.
    Comments are optional.
    """
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.SOCIAL_WELFARE.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        social_welfare_service = SocialWelfareService(db)
        application = social_welfare_service.approve_case(
            application_id=case_id,
            amount_approved=request.amount_approved,
            comments=request.comments
        )
        
        return {
            "message": "Case approved by social welfare",
            "application_id": application.id,
            "status": application.status.value,
            "amount_approved": str(application.amount_approved)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to approve case")


@router.post("/social-welfare/{case_id}/reject")
def reject_case_social_welfare(
    case_id: str,
    request: SocialWelfareRejectionRequest,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Reject a case with mandatory rejection reason.
    Rejection reason is required and cannot be empty.
    """
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.SOCIAL_WELFARE.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        social_welfare_service = SocialWelfareService(db)
        application = social_welfare_service.reject_case(
            application_id=case_id,
            rejection_reason=request.rejection_reason
        )
        
        return {
            "message": "Case rejected by social welfare",
            "application_id": application.id,
            "status": application.status.value,
            "rejection_reason": application.rejection_reason
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to reject case")

# District authority endpoints for pending cases

@router.get("/pending", response_model=List[dict])
def list_pending_cases(db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    cases = db.query(Application).filter(Application.status == ApplicationStatus.UNDER_REVIEW).all()
    return [
        {
            "id": case.id,
            "application_number": case.application_number,
            "user_id": case.user_id,
            "title": case.title,
            "status": case.status.value,
            "submitted_at": case.submitted_at,
        } for case in cases
    ]

@router.get("/pending/{case_id}", response_model=dict)
def get_pending_case(case_id: str, db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    case = db.query(Application).filter(Application.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    return {
        "id": case.id,
        "application_number": case.application_number,
        "user_id": case.user_id,
        "title": case.title,
        "description": case.description,
        "status": case.status.value,
        "submitted_at": case.submitted_at,
        "bank_account_number": case.bank_account_number,
        "bank_ifsc_code": case.bank_ifsc_code,
        "bank_name": case.bank_name,
        "bank_branch": case.bank_branch,
        "account_holder_name": case.account_holder_name,
    }

# Mock CCTNS API verification (Enhanced)
@router.post("/pending/{case_id}/cctns-verify")
def cctns_verify_case(case_id: str, fir_number: str, db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    # Get the application
    case = db.query(Application).filter(Application.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Enhanced mock verification logic
    if not fir_number:
        return {"verified": False, "message": "FIR number is required", "error": "MISSING_FIR"}
    
    # Basic format validation
    if not fir_number.upper().startswith("FIR"):
        return {"verified": False, "message": "Invalid FIR number format. FIR number should start with 'FIR'", "error": "INVALID_FORMAT"}
    
    # Mock verification based on FIR number format
    if len(fir_number) >= 8 and fir_number.upper().startswith("FIR"):
        # Update application with verification result
        case.fir_number = fir_number
        case.cctns_verified = True
        case.cctns_verification_date = datetime.utcnow()
        db.commit()
        
        return {
            "verified": True, 
            "message": "FIR verified successfully through CCTNS",
            "verification_date": case.cctns_verification_date
        }
    else:
        # Update application with failed verification
        case.fir_number = fir_number
        case.cctns_verified = False
        case.cctns_verification_date = datetime.utcnow()
        db.commit()
        
        return {
            "verified": False, 
            "message": "FIR not found in CCTNS database or invalid format",
            "error": "NOT_FOUND_IN_CCTNS"
        }

# Forward, cancel, or send back case with comments
@router.post("/pending/{case_id}/action")
def case_action(
    case_id: str, 
    action: str, 
    comments: Optional[str] = None,
    db: Session = Depends(get_db), 
    token: dict = Depends(verify_token)
):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    case = db.query(Application).filter(Application.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    user_id = token.get("sub")  # Get user ID from token
    
    if action == "approve":
        # Check if all documents are verified
        documents = get_application_documents(db, case)
        unverified_docs = [doc for doc in documents if doc.status.value == "PENDING"]
        rejected_docs = [doc for doc in documents if doc.status.value == "REJECTED"]
        
        if unverified_docs:
            raise HTTPException(
                status_code=400, 
                detail="All documents must be verified before approval"
            )
        
        if rejected_docs:
            raise HTTPException(
                status_code=400, 
                detail="Application cannot be approved with rejected documents"
            )
        
        # Check CCTNS verification for compensation cases
        if case.application_type in ["COMPENSATION", "POA_COMPENSATION"]:
            if not case.cctns_verified:
                raise HTTPException(
                    status_code=400, 
                    detail="CCTNS verification required for compensation cases"
                )
        
        case.status = ApplicationStatus.APPROVED
        case.approved_at = datetime.utcnow()
        case.district_comments = comments
        case.district_reviewed_by = user_id
        case.district_reviewed_at = datetime.utcnow()
        db.commit()
        return {"message": "Case approved and forwarded to Social Welfare department."}
        
    elif action == "reject":
        case.status = ApplicationStatus.REJECTED
        case.rejection_reason = comments
        case.district_comments = comments
        case.district_reviewed_by = user_id
        case.district_reviewed_at = datetime.utcnow()
        db.commit()
        return {"message": "Case rejected."}
        
    elif action == "pending":
        # Send back to user with comments for clarification
        case.status = ApplicationStatus.DOCUMENT_VERIFICATION_PENDING
        case.district_comments = comments
        case.district_reviewed_by = user_id
        case.district_reviewed_at = datetime.utcnow()
        db.commit()
        return {"message": "Case sent back to user for additional information."}
        
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use 'approve', 'reject', or 'pending'")


# District Authority: Document verification with comments
@router.post("/pending/{case_id}/documents/{document_id}/verify")
def verify_document_district(
    case_id: str,
    document_id: str,
    status: str,  # "VERIFIED", "REJECTED", "PENDING" 
    comments: Optional[str] = None,
    db: Session = Depends(get_db),
    token: dict = Depends(verify_token)
):
    """Verify document by district authority - approve, reject, or add comments"""
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if status not in ["VERIFIED", "REJECTED", "PENDING"]:
        raise HTTPException(
            status_code=400, 
            detail="Status must be 'VERIFIED', 'REJECTED', or 'PENDING'"
        )
    
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.application_id == case_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    user_id = token.get("sub")
    
    # Update document status
    document.status = status
    document.verification_notes = comments
    document.verified_by = user_id
    document.verified_at = datetime.utcnow() if status in ["VERIFIED", "REJECTED"] else None
    
    db.commit()
    
    action_text = {
        "VERIFIED": "approved",
        "REJECTED": "rejected", 
        "PENDING": "marked as pending with comments"
    }.get(status, "updated")
    
    return {
        "message": f"Document {action_text} successfully",
        "document": {
            "id": document.id,
            "status": document.status.value if hasattr(document.status, 'value') else document.status,
            "verification_notes": document.verification_notes,
            "verified_by": document.verified_by,
            "verified_at": document.verified_at
        }
    }


# District Authority: Get all cases with enhanced details
@router.get("/district/cases")
def get_district_cases(
    status: Optional[str] = None,
    limit: int = 50,
    offset: int = 0,
    db: Session = Depends(get_db),
    token: dict = Depends(verify_token)
):
    """Get cases for district authority with filtering options"""
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    query = db.query(Application)
    
    if status:
        query = query.filter(Application.status == status)
    else:
        # Default to cases that need district authority attention
        query = query.filter(Application.status.in_([
            ApplicationStatus.SUBMITTED,
            ApplicationStatus.UNDER_REVIEW,
            ApplicationStatus.DOCUMENT_VERIFICATION_PENDING
        ]))
    
    cases = query.offset(offset).limit(limit).all()
    
    result = []
    for case in cases:
        user = db.query(User).filter(User.id == case.user_id).first()
        documents = get_application_documents(db, case)
        
        result.append({
            "id": case.id,
            "application_number": case.application_number,
            "title": case.title,
            "description": case.description,
            "status": case.status.value,
            "application_type": case.application_type.value if case.application_type else None,
            "fir_number": case.fir_number,
            "cctns_verified": case.cctns_verified,
            "district_comments": case.district_comments,
            "submitted_at": case.submitted_at,
            "applicant": {
                "full_name": user.full_name if user else None,
                "email": user.email if user else None,
                "phone_number": user.phone_number if user else None
            },
            "documents_summary": {
                "total": len(documents),
                "verified": len([d for d in documents if d.status.value == "VERIFIED"]),
                "pending": len([d for d in documents if d.status.value == "PENDING"]),
                "rejected": len([d for d in documents if d.status.value == "REJECTED"])
            }
        })
    
    return {
        "cases": result,
        "total": len(result),
        "limit": limit,
        "offset": offset
    }


# ==================== FINANCIAL INSTITUTION ENDPOINTS ====================

from app.services.fi_service import FIService

class FIApprovalRequest(BaseModel):
    """Request model for FI approval"""
    comments: Optional[str] = Field(None, description="Optional approval comments")


class FIRejectionRequest(BaseModel):
    """Request model for FI rejection"""
    rejection_reason: str = Field(..., description="Mandatory reason for rejection")
    
    @validator('rejection_reason')
    def validate_rejection_reason(cls, v):
        if not v or not v.strip():
            raise ValueError('Rejection reason is required')
        return v.strip()


@router.get("/fi/pending", response_model=List[dict])
def list_pending_fi_applications(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get all applications pending FI approval (SOCIAL_WELFARE_APPROVED status)
    """
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.FINANCIAL_INSTITUTION.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    fi_service = FIService(db)
    applications = fi_service.get_pending_applications()
    
    return [
        {
            "id": app.id,
            "application_number": app.application_number,
            "user_id": app.user_id,
            "title": app.title,
            "application_type": app.application_type.value if app.application_type else None,
            "amount_approved": str(app.amount_approved) if app.amount_approved else None,
            "status": app.status.value,
            "submitted_at": app.submitted_at,
            "updated_at": app.updated_at,
        } for app in applications
    ]


@router.get("/fi/processed", response_model=List[dict])
def list_processed_fi_applications(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get all applications processed by FI (FUND_DISBURSED, COMPLETED, or REJECTED)
    """
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.FINANCIAL_INSTITUTION.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    fi_service = FIService(db)
    applications = fi_service.get_processed_applications()
    
    return [
        {
            "id": app.id,
            "application_number": app.application_number,
            "user_id": app.user_id,
            "title": app.title,
            "application_type": app.application_type.value if app.application_type else None,
            "amount_approved": str(app.amount_approved) if app.amount_approved else None,
            "status": app.status.value,
            "submitted_at": app.submitted_at,
            "updated_at": app.updated_at,
        } for app in applications
    ]


@router.get("/fi/case/{case_id}", response_model=dict)
def get_fi_case_details(
    case_id: str,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get full case details for FI review
    """
    from app.services.s3_service import S3Service
    import structlog
    
    logger = structlog.get_logger()
    
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.FINANCIAL_INSTITUTION.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    fi_service = FIService(db)
    case = fi_service.get_application_details(case_id)
    
    user = db.query(User).filter(User.id == case.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Applicant not found")
    
    documents = get_application_documents(db, case)
    
    # Generate presigned URLs for documents
    s3_service = S3Service()
    document_list = []
    for doc in documents:
        doc_data = {
            "id": doc.id,
            "document_type": doc.document_type,
            "file_name": doc.document_name,
            "file_path": None,
            "file_url": None,
            "file_size": doc.file_size,
            "mime_type": doc.mime_type,
            "status": doc.status.value if doc.status else None,
            "is_digilocker": doc.is_digilocker,
            "digilocker_uri": doc.digilocker_uri,
            "verification_notes": doc.verification_notes,
            "verified_by": doc.verified_by,
            "verified_at": doc.verified_at,
            "created_at": doc.created_at,
            "updated_at": doc.updated_at,
        }
        
        # Generate presigned URL if file exists and not from digilocker
        if doc.file_path and not doc.is_digilocker:
            try:
                presigned_url = s3_service.generate_presigned_download_url(doc.file_path)
                doc_data["file_url"] = presigned_url
                doc_data["file_path"] = doc.file_path
            except Exception as e:
                logger.error("presigned_url_generation_failed", document_id=doc.id, error=str(e))
        
        document_list.append(doc_data)
    
    return {
        "id": case.id,
        "application_number": case.application_number,
        "title": case.title,
        "description": case.description,
        "application_type": case.application_type.value if case.application_type else None,
        "status": case.status.value,
        "fir_number": case.fir_number,
        "cctns_verified": case.cctns_verified,
        "amount_approved": str(case.amount_approved) if case.amount_approved else None,
        "district_comments": case.district_comments,
        "social_welfare_comments": case.social_welfare_comments,
        "submitted_at": case.submitted_at,
        "updated_at": case.updated_at,
        "applicant": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "phone_number": user.phone_number,
            "father_name": user.father_name,
            "mother_name": user.mother_name,
            "aadhaar_number": user.aadhaar_number,
            "date_of_birth": user.date_of_birth,
            "age": user.age,
            "gender": user.gender.value if user.gender else None,
            "category": user.category.value if user.category else None,
            "address": user.address,
            "district": user.district,
            "state": user.state,
            "pincode": user.pincode,
        },
        "documents": document_list
    }


@router.post("/fi/{case_id}/approve")
def approve_fi_case(
    case_id: str,
    request: FIApprovalRequest,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Approve a case for fund disbursement
    """
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.FINANCIAL_INSTITUTION.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        fi_service = FIService(db)
        application = fi_service.approve_for_disbursement(
            application_id=case_id,
            comments=request.comments
        )
        
        return {
            "message": "Application approved for disbursement",
            "application_id": application.id,
            "status": application.status.value,
            "amount_approved": str(application.amount_approved)
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/fi/{case_id}/reject")
def reject_fi_case(
    case_id: str,
    request: FIRejectionRequest,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Reject a case at FI stage
    """
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.FINANCIAL_INSTITUTION.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        fi_service = FIService(db)
        application = fi_service.reject_application(
            application_id=case_id,
            rejection_reason=request.rejection_reason
        )
        
        return {
            "message": "Application rejected",
            "application_id": application.id,
            "status": application.status.value
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/fi/disburse-batch")
def disburse_batch(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Demo endpoint: Disburse all FUND_DISBURSED applications in a batch
    This simulates the actual fund disbursement process
    """
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.FINANCIAL_INSTITUTION.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    try:
        fi_service = FIService(db)
        result = fi_service.disburse_batch()
        
        return {
            "message": "Successfully disbursed allocated funds",
            "disbursed_count": result["disbursed_count"],
            "total_amount": str(result["total_amount"])
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

