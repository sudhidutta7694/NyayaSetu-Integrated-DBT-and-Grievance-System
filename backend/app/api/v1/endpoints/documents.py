"""
Document management endpoints
"""

from fastapi import APIRouter

router = APIRouter()

# List pending documents for verification (district authority only)
from sqlalchemy.orm import Session
from typing import List, Optional
from models.document import Document, DocumentStatus
from models.user import UserRole
from app.core.database import get_db
from app.core.security import verify_token
from fastapi import Depends, HTTPException

@router.get("/pending", response_model=List[dict])
def list_pending_documents(db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    docs = db.query(Document).filter(Document.status == DocumentStatus.PENDING).all()
    return [
        {
            "id": doc.id,
            "user_id": doc.user_id,
            "document_type": doc.document_type,
            "document_name": doc.document_name,
            "status": doc.status.value,
            "created_at": doc.created_at,
        } for doc in docs
    ]

@router.get("/pending/{document_id}", response_model=dict)
def get_pending_document(document_id: str, db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    return {
        "id": doc.id,
        "user_id": doc.user_id,
        "document_type": doc.document_type,
        "document_name": doc.document_name,
        "status": doc.status.value,
        "verification_notes": doc.verification_notes,
        "created_at": doc.created_at,
        "file_path": doc.file_path,
    }

@router.post("/pending/{document_id}/verify")
def verify_document(document_id: str, db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    doc.status = DocumentStatus.VERIFIED
    db.commit()
    return {"message": "Document verified"}

@router.post("/pending/{document_id}/comment")
def comment_on_document(document_id: str, comment: str, status: Optional[str] = "PENDING", db: Session = Depends(get_db), token: dict = Depends(verify_token)):
    if token.get("role") != UserRole.DISTRICT_AUTHORITY:
        raise HTTPException(status_code=403, detail="Not authorized")
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    # Only allow valid status
    if status not in [s.value for s in DocumentStatus]:
        raise HTTPException(status_code=400, detail="Invalid status")
    doc.status = DocumentStatus(status)
    doc.verification_notes = comment
    db.commit()
    return {"message": f"Document status updated to {status}", "comment": comment}