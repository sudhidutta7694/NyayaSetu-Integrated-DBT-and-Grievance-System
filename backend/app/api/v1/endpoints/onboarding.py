"""
Onboarding endpoints for user registration and profile completion
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog

from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.dependencies import require_public_user
from app.core.exceptions import ValidationException, AuthenticationException
from app.models.user import User
from app.models.onboarding import (
    OnboardingStatus,
    OnboardingProgress,
    PersonalInfoData,
    BankDetailsData,
    DocumentType,
    DocumentUploadData
)
from app.services.onboarding_service import OnboardingService
from app.services.document_service import DocumentService

logger = structlog.get_logger()
router = APIRouter()
security = HTTPBearer()


@router.get("/status", response_model=OnboardingStatus)
async def get_onboarding_status(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Get current onboarding status for the authenticated user"""
    try:
        onboarding_service = OnboardingService(db)
        status = await onboarding_service.get_onboarding_status(current_user.id)
        return status
    except Exception as e:
        logger.error("Failed to get onboarding status", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get onboarding status"
        )


@router.get("/progress", response_model=OnboardingProgress)
async def get_onboarding_progress(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Get detailed onboarding progress for the authenticated user"""
    try:
        onboarding_service = OnboardingService(db)
        progress = await onboarding_service.get_onboarding_progress(current_user.id)
        return progress
    except Exception as e:
        logger.error("Failed to get onboarding progress", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get onboarding progress"
        )


@router.post("/initialize")
async def initialize_onboarding(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Initialize onboarding process for a new user"""
    try:
        onboarding_service = OnboardingService(db)
        success = await onboarding_service.initialize_onboarding(current_user.id)
        
        if success:
            return {"message": "Onboarding initialized successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to initialize onboarding"
            )
    except Exception as e:
        logger.error("Failed to initialize onboarding", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize onboarding"
        )


@router.post("/step/1/personal-info")
async def complete_personal_info_step(
    personal_info: PersonalInfoData,
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Complete personal information step"""
    try:
        onboarding_service = OnboardingService(db)
        success = await onboarding_service.complete_personal_info_step(
            current_user.id, personal_info
        )
        
        if success:
            return {"message": "Personal information saved successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save personal information"
            )
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to complete personal info step", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save personal information"
        )


@router.post("/step/2/documents")
async def upload_documents(
    document_type: str = Form(...),
    file: UploadFile = File(...),
    is_digilocker: bool = Form(False),
    digilocker_id: Optional[str] = Form(None),
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Upload documents for verification"""
    try:
        # Validate document type
        try:
            doc_type = DocumentType(document_type)
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document type"
            )

        document_service = DocumentService(db)
        
        if is_digilocker and digilocker_id:
            # Import from DigiLocker
            result = await document_service.import_digilocker_document(
                current_user.id, doc_type, digilocker_id
            )
        else:
            # Upload file
            result = await document_service.upload_document(
                current_user.id, doc_type, file, is_digilocker, digilocker_id
            )

        return {
            "message": "Document uploaded successfully",
            "document": result
        }
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to upload document", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload document"
        )


@router.get("/step/2/digilocker")
async def get_digilocker_documents(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Get available documents from DigiLocker"""
    try:
        document_service = DocumentService(db)
        documents = await document_service.get_digilocker_documents(current_user.id)
        return {"documents": documents}
    except Exception as e:
        logger.error("Failed to get DigiLocker documents", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get DigiLocker documents"
        )


@router.post("/step/2/complete")
async def complete_document_upload_step(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Mark document upload step as completed"""
    try:
        onboarding_service = OnboardingService(db)
        
        # Get user's uploaded documents
        documents = await onboarding_service.get_user_documents(current_user.id)
        
        if not documents:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No documents uploaded. Please upload at least one document."
            )

        # Create document upload data
        doc_data = []
        for doc in documents:
            doc_data.append(DocumentUploadData(
                document_type=DocumentType(doc["document_type"]),
                file_name=doc["document_name"],
                file_size=doc["file_size"],
                mime_type=doc["mime_type"],
                is_digilocker=doc["is_digilocker"],
                digilocker_id=doc["digilocker_id"],
                ocr_data=doc["ocr_data"]
            ))

        success = await onboarding_service.complete_document_upload_step(
            current_user.id, doc_data
        )
        
        if success:
            return {"message": "Document upload step completed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to complete document upload step"
            )
    except Exception as e:
        logger.error("Failed to complete document upload step", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete document upload step"
        )


@router.post("/step/3/bank-details")
async def complete_bank_details_step(
    bank_details: BankDetailsData,
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Complete bank details step"""
    try:
        onboarding_service = OnboardingService(db)
        success = await onboarding_service.complete_bank_details_step(
            current_user.id, bank_details
        )
        
        if success:
            return {"message": "Bank details saved successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to save bank details"
            )
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to complete bank details step", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save bank details"
        )


@router.post("/step/4/verification")
async def complete_verification_step(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Complete verification step"""
    try:
        onboarding_service = OnboardingService(db)
        success = await onboarding_service.complete_verification_step(current_user.id)
        
        if success:
            return {"message": "Verification step completed successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to complete verification step"
            )
    except Exception as e:
        logger.error("Failed to complete verification step", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to complete verification step"
        )


@router.get("/documents")
async def get_user_documents(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Get all documents for the authenticated user"""
    try:
        onboarding_service = OnboardingService(db)
        documents = await onboarding_service.get_user_documents(current_user.id)
        return {"documents": documents}
    except Exception as e:
        logger.error("Failed to get user documents", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user documents"
        )


@router.get("/bank-accounts")
async def get_user_bank_accounts(
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Get all bank accounts for the authenticated user"""
    try:
        onboarding_service = OnboardingService(db)
        bank_accounts = await onboarding_service.get_user_bank_accounts(current_user.id)
        return {"bank_accounts": bank_accounts}
    except Exception as e:
        logger.error("Failed to get user bank accounts", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user bank accounts"
        )


@router.delete("/documents/{document_id}")
async def delete_document(
    document_id: str,
    current_user: User = Depends(require_public_user()),
    db: Session = Depends(get_db)
):
    """Delete a document"""
    try:
        document_service = DocumentService(db)
        success = await document_service.delete_document(document_id, current_user.id)
        
        if success:
            return {"message": "Document deleted successfully"}
        else:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete document"
            )
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to delete document", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete document"
        )
