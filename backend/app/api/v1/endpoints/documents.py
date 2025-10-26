"""
Document management endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel
from app.core.dependencies import get_current_user, get_db
from app.services.s3_service import S3Service
from models.user import User
from models.document import Document, DocumentStatus, DocumentType
from datetime import datetime

router = APIRouter()


class PresignedUrlRequest(BaseModel):
    filename: str
    content_type: str
    document_type: str


class ConfirmUploadRequest(BaseModel):
    s3_key: str
    document_type: str
    filename: str
    file_size: int
    content_type: str
    digilocker_id: Optional[str] = None


@router.post("/generate-upload-url")
async def generate_presigned_upload_url(
    request: PresignedUrlRequest,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a presigned URL for uploading a file directly to S3
    
    Flow:
    1. Frontend requests presigned URL with file details
    2. Backend generates secure temporary URL
    3. Frontend uploads file directly to S3 using this URL
    4. Frontend confirms upload by calling /confirm-upload
    """
    try:
        # Check if user has Aadhaar number
        if not current_user.aadhaar_number:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Aadhaar number is required for document upload. Please complete your profile first."
            )
        
        # Validate file type
        allowed_types = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
        if request.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only PDF, JPG, and PNG files are allowed"
            )
        
        s3_service = S3Service()
        result = s3_service.generate_presigned_upload_url(
            filename=request.filename,
            content_type=request.content_type,
            aadhaar_number=current_user.aadhaar_number,  # Changed from user_id
            document_type=request.document_type,
            expires_in=300  # 5 minutes
        )
        
        return {
            "success": True,
            "data": result
        }
        
    except Exception as e:
        print(f"Error generating presigned URL: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate upload URL: {str(e)}"
        )


@router.post("/confirm-upload")
async def confirm_upload(
    request: ConfirmUploadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
   
    try:
        # Validate file size (10MB)
        if request.file_size > 10 * 1024 * 1024:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size must be less than 10MB"
            )
        
        # Verify the file exists in S3
        s3_service = S3Service()
        if not s3_service.check_file_exists(request.s3_key):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File was not found in S3. Upload may have failed."
            )
        
        # Construct file URL (for preview/download)
        bucket_name = s3_service.bucket_name
        region = s3_service.s3_client.meta.region_name
        file_url = f"https://{bucket_name}.s3.{region}.amazonaws.com/{request.s3_key}"
        
        # If user is already onboarded, save document to database immediately
        if current_user.is_onboarded:
            # Check if document of this type already exists
            existing_doc = db.query(Document).filter(
                Document.user_id == str(current_user.id),
                Document.document_type == request.document_type
            ).first()
            
            if existing_doc:
                # Replace existing document - delete old S3 file if different
                if existing_doc.file_path != request.s3_key and not existing_doc.is_digilocker:
                    try:
                        s3_service.delete_document(existing_doc.file_path)
                    except Exception as e:
                        print(f"Could not delete old S3 file: {e}")
                
                # Update existing document
                existing_doc.document_name = request.filename
                existing_doc.file_path = request.s3_key
                existing_doc.file_size = str(request.file_size)
                existing_doc.mime_type = request.content_type
                existing_doc.is_digilocker = False
                existing_doc.digilocker_uri = request.digilocker_id
                existing_doc.status = DocumentStatus.PENDING
                existing_doc.verified_at = None
                existing_doc.verified_by = None
                existing_doc.verification_notes = None
                db.commit()
                db.refresh(existing_doc)
                document_id = existing_doc.id
            else:
                # Create new document
                new_doc = Document(
                    user_id=str(current_user.id),
                    document_type=request.document_type,
                    document_name=request.filename,
                    file_path=request.s3_key,
                    file_size=str(request.file_size),
                    mime_type=request.content_type,
                    is_digilocker=False,
                    digilocker_uri=request.digilocker_id
                )
                db.add(new_doc)
                db.commit()
                db.refresh(new_doc)
                document_id = new_doc.id
            
            return {
                "success": True,
                "message": "Document uploaded and saved successfully",
                "data": {
                    "document_id": document_id,
                    "s3_key": request.s3_key,
                    "file_url": file_url,
                    "document_type": request.document_type,
                    "file_name": request.filename,
                    "file_size": request.file_size,
                    "content_type": request.content_type,
                    "status": "PENDING"
                }
            }
        
        # For non-onboarded users, return S3 metadata without saving to DB
        # Frontend will store this and send it during onboarding completion
        return {
            "success": True,
            "message": "File uploaded to S3 successfully",
            "data": {
                "s3_key": request.s3_key,
                "file_url": file_url,
                "document_type": request.document_type,
                "file_name": request.filename,
                "file_size": request.file_size,
                "content_type": request.content_type,
                "status": "PENDING"  # Temporary status until saved to DB
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error confirming upload: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to confirm upload: {str(e)}"
        )


@router.get("/{document_id}/download")
async def get_document_download_url(
    document_id: str,  # Changed to str since Document.id is String
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get a presigned URL to download a document
    
    - Public users can only view their own documents
    - Authority users (District Authority, Social Welfare, Financial Institution, Admin) can view any document
    """
    from models.user import UserRole
    
    # Check if user is an authority (can view any document)
    is_authority = current_user.role in [
        UserRole.DISTRICT_AUTHORITY,
        UserRole.SOCIAL_WELFARE,
        UserRole.FINANCIAL_INSTITUTION,
        UserRole.ADMIN
    ]
    
    # Query document with appropriate filter
    if is_authority:
        # Authority users can view any document
        document = db.query(Document).filter(
            Document.id == document_id
        ).first()
    else:
        # Public users can only view their own documents
        document = db.query(Document).filter(
            Document.id == document_id,
            Document.user_id == str(current_user.id)
        ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    # file_path contains the S3 key
    s3_service = S3Service()
    presigned_url = s3_service.generate_presigned_download_url(document.file_path, expiration=3600)
    
    return {
        "success": True,
        "data": {
            "download_url": presigned_url,
            "expires_in": 3600,
            "file_name": document.document_name  # Correct field name
        }
    }


@router.delete("/{document_id}")
async def delete_document(
    document_id: str,  # Changed to str since Document.id is String
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Delete a document from S3 and database
    """
    document = db.query(Document).filter(
        Document.id == document_id,
        Document.user_id == str(current_user.id)
    ).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    try:
        # Delete from S3 (file_path contains the S3 key)
        s3_service = S3Service()
        s3_service.delete_document(document.file_path)
        
        # Delete from database
        db.delete(document)
        db.commit()
        
        return {
            "success": True,
            "message": "Document deleted successfully"
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete document: {str(e)}"
        )


@router.get("")
async def get_documents_by_application(
    application_id: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get documents by application_id or list all user documents with presigned URLs
    """
    from models.user import UserRole
    from models.application import Application
    
    # Check if user is an authority
    is_authority = current_user.role in [
        UserRole.DISTRICT_AUTHORITY,
        UserRole.SOCIAL_WELFARE,
        UserRole.FINANCIAL_INSTITUTION,
        UserRole.ADMIN
    ]
    
    # If application_id provided, get documents for that application
    if application_id:
        # First verify the application exists
        application = db.query(Application).filter(
            Application.id == application_id
        ).first()
        
        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found"
            )
        
        # Check permission to view this application's documents
        if not is_authority and application.user_id != str(current_user.id):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied to this application's documents"
            )
        
        # Get documents for the application's user
        documents = db.query(Document).filter(
            Document.user_id == application.user_id
        ).all()
    else:
        # List all documents for the current user
        documents = db.query(Document).filter(
            Document.user_id == str(current_user.id)
        ).all()
    
    # Generate presigned URLs for all documents
    document_list = []
    for doc in documents:
        doc_data = {
            "id": doc.id,
            "document_type": doc.document_type,
            "file_name": doc.document_name,
            "file_size": doc.file_size,
            "file_path": doc.file_path,
            "status": doc.status.value,
            "is_digilocker": doc.is_digilocker,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "verified_at": doc.verified_at.isoformat() if doc.verified_at else None,
            "file_url": None
        }
        
        # Generate presigned URL if file exists in S3
        if doc.file_path and not doc.is_digilocker:
            try:
                s3_service = S3Service()
                doc_data["file_url"] = s3_service.generate_presigned_download_url(doc.file_path, expiration=3600)
            except Exception as e:
                print(f"Failed to generate presigned URL for {doc.id}: {e}")
        
        document_list.append(doc_data)
    
    return {
        "success": True,
        "data": document_list
    }


@router.get("/list")
async def list_user_documents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all documents for the current user with presigned URLs
    """
    documents = db.query(Document).filter(
        Document.user_id == str(current_user.id)
    ).all()
    
    # Generate presigned URLs for all documents
    document_list = []
    for doc in documents:
        doc_data = {
            "id": doc.id,
            "document_type": doc.document_type,
            "file_name": doc.document_name,
            "file_size": doc.file_size,
            "file_path": doc.file_path,
            "status": doc.status.value,
            "is_digilocker": doc.is_digilocker,
            "created_at": doc.created_at.isoformat() if doc.created_at else None,
            "verified_at": doc.verified_at.isoformat() if doc.verified_at else None,
            "file_url": None
        }
        
        # Generate presigned URL if file exists in S3
        if doc.file_path and not doc.is_digilocker:
            try:
                s3_service = S3Service()
                doc_data["file_url"] = s3_service.generate_presigned_download_url(doc.file_path, expiration=3600)
            except Exception as e:
                print(f"Failed to generate presigned URL for {doc.id}: {e}")
        
        document_list.append(doc_data)
    
    return {
        "success": True,
        "data": document_list
    }
