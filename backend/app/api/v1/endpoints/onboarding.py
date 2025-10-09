"""
Onboarding endpoints for user registration and profile completion
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import structlog

from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.dependencies import require_public_user
from app.schema.user import User
from app.schema.onboarding import (
    PersonalInfoData,
    BankDetailsData,
)
from models.document import Document, DocumentStatus
from models.user import User as UserModel
from models.onboarding import BankAccount
from models.uidai import UIDAI

logger = structlog.get_logger()
router = APIRouter()


@router.get("/uidai-profile")
async def get_uidai_profile(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """
    Fetch UIDAI profile data for the authenticated user
    Returns personal information from UIDAI database based on Aadhaar number
    """
    try:
        # Get user's Aadhaar number
        user = db.query(UserModel).filter(UserModel.id == str(current_user.id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.aadhaar_number:
            raise HTTPException(
                status_code=400, 
                detail="Aadhaar number not found for user"
            )
        
        # Fetch UIDAI profile data
        uidai_profile = db.query(UIDAI).filter(
            UIDAI.aadhaar_number == user.aadhaar_number
        ).first()
        
        if not uidai_profile:
            raise HTTPException(
                status_code=404,
                detail="UIDAI profile not found for this Aadhaar number"
            )
        
        # Calculate age from date of birth
        from datetime import date
        age = None
        if uidai_profile.date_of_birth:
            today = date.today()
            age = today.year - uidai_profile.date_of_birth.year - (
                (today.month, today.day) < (uidai_profile.date_of_birth.month, uidai_profile.date_of_birth.day)
            )
        
        # Return profile data (mapping UIDAI model fields to expected format)
        return {
            "success": True,
            "data": {
                "full_name": uidai_profile.name,  # UIDAI model uses 'name'
                "father_name": uidai_profile.father_name,
                "mother_name": None,  # Not available in UIDAI model
                "date_of_birth": uidai_profile.date_of_birth.isoformat() if uidai_profile.date_of_birth else None,
                "age": age,
                "gender": uidai_profile.gender,
                "category": None,  # Not available in UIDAI model
                "mobile_number": uidai_profile.phone_number,  # UIDAI model uses 'phone_number'
                "address": uidai_profile.address,
                "district": None,  # Not available in UIDAI model
                "state": None,  # Not available in UIDAI model
                "pincode": None,  # Not available in UIDAI model
                "aadhaar_number": uidai_profile.aadhaar_number
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to fetch UIDAI profile", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch UIDAI profile: {str(e)}"
        )


@router.get("/step/2/digilocker")
async def get_digilocker_documents(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """
    Get available documents from DigiLocker for the authenticated user
    This simulates fetching documents from DigiLocker API
    """
    try:
        # TODO: Implement actual DigiLocker API integration
        # For now, return mock data structure
        
        logger.info("Fetching DigiLocker documents", user_id=current_user.id)
        
        # Mock response - replace with actual DigiLocker API call
        available_documents = [
            {
                "document_id": "DL_AADHAAR_001",
                "document_type": "aadhaar",
                "document_name": "Aadhaar Card",
                "issuer": "UIDAI",
                "issue_date": "2020-01-15",
                "is_verified": True
            },
            {
                "document_id": "DL_PAN_001",
                "document_type": "pan",
                "document_name": "PAN Card",
                "issuer": "Income Tax Department",
                "issue_date": "2019-06-20",
                "is_verified": True
            },
            {
                "document_id": "DL_DL_001",
                "document_type": "driving_license",
                "document_name": "Driving License",
                "issuer": "Transport Department",
                "issue_date": "2021-03-10",
                "is_verified": True
            }
        ]
        
        return {
            "success": True,
            "documents": available_documents,
            "message": "DigiLocker documents fetched successfully"
        }
        
    except Exception as e:
        logger.error("Failed to get DigiLocker documents", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get DigiLocker documents"
        )


class CompleteOnboardingRequest(BaseModel):
    """Complete onboarding data in one request"""
    personal_info: PersonalInfoData
    bank_details: Optional[BankDetailsData] = None
    uploaded_documents: List[dict]  # List of {s3_key, document_type, filename, file_size, content_type}


@router.post("/complete")
async def complete_onboarding(
    data: CompleteOnboardingRequest,
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """
    Complete entire onboarding in one API call
    - Updates personal information
    - Saves document metadata (S3 keys already uploaded)
    - Saves bank details (optional)
    - Marks user as onboarded
    """
    try:
        # 1. Update personal information
        user = db.query(UserModel).filter(UserModel.id == str(current_user.id)).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Update user fields
        user.full_name = data.personal_info.full_name
        user.father_name = data.personal_info.father_name
        user.mother_name = data.personal_info.mother_name
        user.date_of_birth = data.personal_info.date_of_birth
        user.age = data.personal_info.age
        user.gender = data.personal_info.gender
        user.category = data.personal_info.category
        user.phone_number = data.personal_info.mobile_number
        user.address = data.personal_info.address
        user.district = data.personal_info.district
        user.state = data.personal_info.state
        user.pincode = data.personal_info.pincode
        
        # 2. Save document metadata (files already uploaded to S3)
        # Handle document replacement - each user can have only ONE document of each type
        saved_documents = []
        for doc_data in data.uploaded_documents:
            # Check if document of this type already exists
            existing_doc = db.query(Document).filter(
                Document.user_id == str(current_user.id),
                Document.document_type == doc_data['document_type']
            ).first()
            
            if existing_doc:
                # Replace existing document - delete old S3 file if different
                if existing_doc.file_path != doc_data['s3_key'] and not existing_doc.is_digilocker:
                    try:
                        from app.services.s3_service import S3Service
                        s3_service = S3Service()
                        s3_service.delete_document(existing_doc.file_path)
                        logger.info(f"Deleted old S3 file: {existing_doc.file_path}")
                    except Exception as e:
                        logger.warning(f"Could not delete old S3 file: {e}")
                
                # Update existing document
                existing_doc.document_name = doc_data['filename']
                existing_doc.file_path = doc_data['s3_key']
                existing_doc.file_size = str(doc_data['file_size'])
                existing_doc.mime_type = doc_data['content_type']
                existing_doc.is_digilocker = doc_data.get('is_digilocker', False)
                existing_doc.digilocker_uri = doc_data.get('digilocker_id')
                existing_doc.status = DocumentStatus.PENDING  # Reset verification status
                existing_doc.verified_at = None
                existing_doc.verified_by = None
                existing_doc.verification_notes = None
                saved_documents.append(existing_doc)
                logger.info(f"Replaced document: {doc_data['document_type']}")
            else:
                # Create new document
                document = Document(
                    user_id=str(current_user.id),
                    document_type=doc_data['document_type'],
                    document_name=doc_data['filename'],
                    file_path=doc_data['s3_key'],  # S3 key
                    file_size=str(doc_data['file_size']),
                    mime_type=doc_data['content_type'],
                    is_digilocker=doc_data.get('is_digilocker', False),
                    digilocker_uri=doc_data.get('digilocker_id')
                )
                db.add(document)
                saved_documents.append(document)
                logger.info(f"Created new document: {doc_data['document_type']}")
        
        # 3. Save bank details if provided
        bank_account_saved = False
        if data.bank_details and data.bank_details.account_number:
            bank_account = BankAccount(
                user_id=str(current_user.id),
                account_number=data.bank_details.account_number,
                ifsc_code=data.bank_details.ifsc_code,
                bank_name=data.bank_details.bank_name,
                branch_name=data.bank_details.branch_name,
                account_holder_name=data.bank_details.account_holder_name,
                is_verified=False
            )
            db.add(bank_account)
            bank_account_saved = True
        
        # 4. Mark user as onboarded
        user.is_onboarded = True
        user.onboarding_step = 3  # Completed all steps
        
        db.commit()
        db.refresh(user)
        
        logger.info(
            "Onboarding completed",
            user_id=user.id,
            documents_count=len(saved_documents),
            bank_details_saved=bank_account_saved
        )
        
        return {
            "success": True,
            "message": "Onboarding completed successfully!",
            "data": {
                "user_id": user.id,
                "is_onboarded": user.is_onboarded,
                "documents_uploaded": len(saved_documents),
                "bank_details_saved": bank_account_saved
            }
        }
        
    except Exception as e:
        db.rollback()
        logger.error("Failed to complete onboarding", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to complete onboarding: {str(e)}"
        )
