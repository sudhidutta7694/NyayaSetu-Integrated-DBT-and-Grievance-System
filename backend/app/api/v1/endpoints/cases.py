
"""
Case management endpoints
"""

from typing import List, Optional

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

# Mock CCTNS API verification
@router.post("/pending/{case_id}/cctns-verify")
def cctns_verify_case(case_id: str, fir_number: str, db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    # Mock verification logic
    if fir_number.startswith("FIR"):
        verified = True
        message = "CCTNS verification successful."
    else:
        verified = False
        message = "CCTNS verification failed. Invalid FIR number."
    return {"verified": verified, "message": message}

# Forward or cancel case
@router.post("/pending/{case_id}/action")
def case_action(case_id: str, action: str, db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    case = db.query(Application).filter(Application.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    if action == "forward":
        case.status = ApplicationStatus.APPROVED
        db.commit()
        return {"message": "Case forwarded for next step."}
    elif action == "cancel":
        case.status = ApplicationStatus.REJECTED
        db.commit()
        return {"message": "Case cancelled."}
    else:
        raise HTTPException(status_code=400, detail="Invalid action")

