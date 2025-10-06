"""
Case management endpoints
"""

from fastapi import APIRouter

router = APIRouter()

# TODO: Implement case endpoints
# - Register case
# - Get cases
# - Update case status
# - Add case updates
# - Case tracking

# District authority endpoints for pending cases
from sqlalchemy.orm import Session
from typing import List, Optional
from models.application import Application, ApplicationStatus
from models.user import UserRole
from app.core.database import get_db
from app.core.security import verify_token
from fastapi import Depends, HTTPException

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

