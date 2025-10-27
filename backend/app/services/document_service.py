"""
Document service for handling document uploads and DigiLocker integration
"""

import json
import os
import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any, BinaryIO
import structlog
from sqlalchemy.orm import Session
import aiofiles
from fastapi import UploadFile

from app.core.config import settings
from app.core.exceptions import ValidationException, DatabaseException
from app.schema.onboarding import DocumentType, DocumentUploadData

logger = structlog.get_logger()


class DocumentService:
    """Service for managing document uploads and processing"""

    def __init__(self, db: Session):
        self.db = db
        self.upload_dir = "uploads"
        self.max_file_size = 10 * 1024 * 1024  # 10MB
        self.allowed_extensions = {'.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'}

    async def upload_document(
        self,
        user_id: str,
        document_type: DocumentType,
        file: UploadFile,
        is_digilocker: bool = False,
        digilocker_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Upload a document for a user"""
        try:
            # Validate file
            await self._validate_file(file)

            # Generate unique filename
            file_extension = os.path.splitext(file.filename)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            
            # Create user-specific directory
            user_dir = os.path.join(self.upload_dir, user_id)
            os.makedirs(user_dir, exist_ok=True)
            
            file_path = os.path.join(user_dir, unique_filename)

            # Save file
            async with aiofiles.open(file_path, 'wb') as f:
                content = await file.read()
                await f.write(content)

            # Process OCR if it's a bank passbook
            ocr_data = None
            if document_type == DocumentType.BANK_PASSBOOK:
                ocr_data = await self._process_ocr(file_path)

            # Save document record
            from models.document import Document, DocumentStatus, DocumentType as DBDocumentType
            
            document = Document(
                id=str(uuid.uuid4()),
                user_id=user_id,
                document_type=DBDocumentType[document_type.value],
                document_name=file.filename,
                file_path=file_path,
                file_size=str(len(content)),
                mime_type=file.content_type,
                is_digilocker=is_digilocker,
                digilocker_uri=digilocker_id,
                status=DocumentStatus.PENDING
            )
            
            self.db.add(document)
            self.db.commit()
            self.db.refresh(document)

            logger.info(
                "Document uploaded successfully",
                user_id=user_id,
                document_id=document.id,
                document_type=document_type.value
            )

            return {
                "id": document.id,
                "document_type": document.document_type.value,
                "document_name": document.document_name,
                "file_path": document.file_path,
                "file_size": document.file_size,
                "mime_type": document.mime_type,
                "status": document.status.value,
                "is_digilocker": document.is_digilocker,
                "digilocker_id": document.digilocker_uri,
                "ocr_data": ocr_data,
                "created_at": document.created_at.isoformat() if document.created_at else None
            }

        except Exception as e:
            logger.error(
                "Failed to upload document",
                user_id=user_id,
                document_type=document_type.value,
                error=str(e)
            )
            raise DatabaseException(f"Failed to upload document: {str(e)}")

    async def get_digilocker_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get available documents from DigiLocker for a user"""
        try:
            # This would integrate with DigiLocker API
            # For now, return mock data
            mock_documents = [
                {
                    "document_id": "DL_001",
                    "document_type": "CASTE_CERTIFICATE",
                    "document_name": "Caste Certificate",
                    "issued_by": "District Magistrate",
                    "issued_date": "2023-01-15",
                    "expiry_date": None,
                    "file_url": "https://digilocker.example.com/doc/001",
                    "is_verified": True
                },
                {
                    "document_id": "DL_002",
                    "document_type": "AADHAAR_CARD",
                    "document_name": "Aadhaar Card",
                    "issued_by": "UIDAI",
                    "issued_date": "2022-06-10",
                    "expiry_date": None,
                    "file_url": "https://digilocker.example.com/doc/002",
                    "is_verified": True
                }
            ]

            logger.info("Retrieved DigiLocker documents", user_id=user_id)
            return mock_documents

        except Exception as e:
            logger.error("Failed to get DigiLocker documents", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to get DigiLocker documents: {str(e)}")

    async def import_digilocker_document(
        self,
        user_id: str,
        document_type: DocumentType,
        digilocker_id: str
    ) -> Dict[str, Any]:
        """Import a document from DigiLocker"""
        try:
            from models.document import Document, DocumentStatus, DocumentType as DBDocumentType
            
            # This would fetch the actual document from DigiLocker
            # For now, create a mock document record
            document = Document(
                id=str(uuid.uuid4()),
                user_id=user_id,
                document_type=DBDocumentType[document_type.value],
                document_name=f"DigiLocker {document_type.value}",
                file_path=f"digilocker://{digilocker_id}",
                file_size="0",
                mime_type="application/pdf",
                is_digilocker=True,
                digilocker_uri=digilocker_id,
                status=DocumentStatus.PENDING  # DigiLocker documents also need verification by district authority
            )
            
            self.db.add(document)
            self.db.commit()
            self.db.refresh(document)

            logger.info(
                "DigiLocker document imported",
                user_id=user_id,
                document_id=document.id,
                digilocker_id=digilocker_id
            )

            return {
                "id": document.id,
                "document_type": document.document_type.value,
                "document_name": document.document_name,
                "file_path": document.file_path,
                "status": document.status.value,
                "is_digilocker": document.is_digilocker,
                "digilocker_id": document.digilocker_uri,
                "created_at": document.created_at.isoformat() if document.created_at else None
            }

        except Exception as e:
            logger.error(
                "Failed to import DigiLocker document",
                user_id=user_id,
                digilocker_id=digilocker_id,
                error=str(e)
            )
            raise DatabaseException(f"Failed to import DigiLocker document: {str(e)}")

    async def verify_document(
        self,
        document_id: str,
        status: str,
        verified_by: str,
        comments: Optional[str] = None
    ) -> Dict[str, Any]:
        """Verify a document"""
        try:
            from models.document import Document, DocumentStatus
            
            # Get the document
            document = self.db.query(Document).filter(Document.id == document_id).first()
            
            if not document:
                raise DatabaseException(f"Document not found: {document_id}")
            
            # Update document
            document.status = DocumentStatus[status] if isinstance(status, str) else status
            document.verified_by = verified_by
            document.verified_at = datetime.utcnow()
            
            if status == "REJECTED" and comments:
                document.verification_notes = comments
            
            self.db.commit()
            self.db.refresh(document)

            logger.info(
                "Document verification completed",
                document_id=document_id,
                status=status,
                verified_by=verified_by
            )

            return {
                "id": document.id,
                "status": document.status.value,
                "verified_by": document.verified_by,
                "verified_at": document.verified_at.isoformat() if document.verified_at else None,
                "verification_notes": document.verification_notes
            }

        except Exception as e:
            self.db.rollback()
            logger.error(
                "Failed to verify document",
                document_id=document_id,
                error=str(e)
            )
            raise DatabaseException(f"Failed to verify document: {str(e)}")

    async def get_documents_for_verification(
        self,
        user_role: str,
        limit: int = 50,
        offset: int = 0
    ) -> List[Dict[str, Any]]:
        """Get documents pending verification based on user role"""
        try:
            from models.document import Document, DocumentStatus, DocumentType
            from models.user import User as DBUser
            from models.application import Application
            
            # Build query - join with User and Application
            query = self.db.query(Document).join(DBUser).outerjoin(Application)
            
            # Filter by status
            query = query.filter(Document.status == DocumentStatus.PENDING)
            
            # District Authority verifies ALL document types
            # Financial Institution only verifies bank documents
            if user_role == "FINANCIAL_INSTITUTION":
                query = query.filter(Document.document_type == DocumentType.BANK_PASSBOOK)
            
            # Order and paginate
            query = query.order_by(Document.created_at.desc())
            query = query.limit(limit).offset(offset)
            
            documents = query.all()

            return [
                {
                    "id": doc.id,
                    "document_type": doc.document_type.value,
                    "document_name": doc.document_name,
                    "file_path": doc.file_path,
                    "file_url": f"/api/v1/documents/{doc.id}/file" if doc.file_path else None,
                    "file_size": doc.file_size,
                    "mime_type": doc.mime_type,
                    "status": doc.status.value,
                    "comments": doc.verification_notes,
                    "is_digilocker": doc.is_digilocker,
                    "digilocker_uri": doc.digilocker_uri,
                    "application_id": doc.application_id,
                    "user": {
                        "id": doc.user.id,
                        "full_name": doc.user.full_name,
                        "email": doc.user.email,
                        "phone_number": doc.user.phone_number,
                        "address": doc.user.address if hasattr(doc.user, 'address') else None
                    },
                    "application": {
                        "id": doc.application.id,
                        "application_number": doc.application.application_number,
                        "title": doc.application.title,
                        "application_type": doc.application.application_type.value,
                        "status": doc.application.status.value,
                        "submitted_at": doc.application.submitted_at.isoformat() if doc.application.submitted_at else None
                    } if doc.application else None,
                    "created_at": doc.created_at.isoformat() if doc.created_at else None,
                    "updated_at": doc.updated_at.isoformat() if doc.updated_at else None
                }
                for doc in documents
            ]

        except Exception as e:
            logger.error("Failed to get documents for verification", error=str(e))
            raise DatabaseException(f"Failed to get documents for verification: {str(e)}")

    async def _validate_file(self, file: UploadFile) -> None:
        """Validate uploaded file"""
        if not file.filename:
            raise ValidationException("No file provided")

        # Check file extension
        file_extension = os.path.splitext(file.filename)[1].lower()
        if file_extension not in self.allowed_extensions:
            raise ValidationException(f"File type {file_extension} not allowed")

        # Check file size
        content = await file.read()
        if len(content) > self.max_file_size:
            raise ValidationException("File size exceeds maximum limit")

        # Reset file pointer
        await file.seek(0)

    async def _process_ocr(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Process OCR on uploaded file (mock implementation)"""
        try:
            # This would integrate with actual OCR service
            # For now, return mock OCR data
            mock_ocr_data = {
                "account_number": "1234567890",
                "ifsc_code": "SBIN0001234",
                "bank_name": "State Bank of India",
                "branch_name": "Main Branch",
                "account_holder_name": "John Doe",
                "confidence_score": 0.95
            }

            logger.info("OCR processing completed", file_path=file_path)
            return mock_ocr_data

        except Exception as e:
            logger.error("OCR processing failed", file_path=file_path, error=str(e))
            return None

    async def delete_document(self, document_id: str, user_id: str) -> bool:
        """Delete a document"""
        try:
            from models.document import Document
            
            # Get document details
            document = self.db.query(Document).filter(Document.id == document_id).first()

            if not document or document.user_id != user_id:
                raise ValidationException("Document not found or access denied")

            # Delete file from filesystem
            if os.path.exists(document.file_path):
                os.remove(document.file_path)

            # Delete document record
            self.db.delete(document)
            self.db.commit()

            logger.info("Document deleted", document_id=document_id, user_id=user_id)
            return True

        except Exception as e:
            self.db.rollback()
            logger.error("Failed to delete document", document_id=document_id, error=str(e))
            raise DatabaseException(f"Failed to delete document: {str(e)}")

