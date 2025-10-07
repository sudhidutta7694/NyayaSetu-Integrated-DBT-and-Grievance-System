
"""
Case management endpoints
"""

from typing import List, Optional
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.database import get_db
from app.core.security import verify_token
from sqlalchemy.orm import Session
from models.application import Application, ApplicationStatus
from models.user import User, UserRole
from models.document import Document

security = HTTPBearer()
router = APIRouter()

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
    documents = db.query(Document).filter(Document.application_id == case_id).all()
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
        "amount_requested": str(case.amount_requested) if case.amount_requested else None,
        "amount_approved": str(case.amount_approved) if case.amount_approved else None,
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
        "documents": [
            {
                "id": doc.id,
                "document_type": doc.document_type,
                "document_name": doc.document_name,
                "file_path": doc.file_path,
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
            for doc in documents
        ],
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
    cases = db.query(Application).filter(Application.status == ApplicationStatus.APPROVED).all()
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

@router.get("/social-welfare/approved", response_model=List[dict])
def list_approved_cases_social_welfare(
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.SOCIAL_WELFARE.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    cases = db.query(Application).filter(Application.status == ApplicationStatus.SOCIAL_WELFARE_APPROVED).all()
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

@router.post("/social-welfare/{case_id}/approve")
def approve_case_social_welfare(
    case_id: str,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials
    payload = verify_token(token)
    if payload.get("role") != UserRole.SOCIAL_WELFARE.value:
        raise HTTPException(status_code=403, detail="Not authorized")
    case = db.query(Application).filter(Application.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if case.status != ApplicationStatus.APPROVED:
        raise HTTPException(status_code=400, detail="Case is not pending for social welfare approval")
    case.status = ApplicationStatus.SOCIAL_WELFARE_APPROVED
    db.commit()
    return {"message": "Case approved by social welfare."}

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
        documents = db.query(Document).filter(Document.application_id == case_id).all()
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
        documents = db.query(Document).filter(Document.application_id == case.id).all()
        
        result.append({
            "id": case.id,
            "application_number": case.application_number,
            "title": case.title,
            "description": case.description,
            "status": case.status.value,
            "application_type": case.application_type.value if case.application_type else None,
            "amount_requested": float(case.amount_requested) if case.amount_requested else None,
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

