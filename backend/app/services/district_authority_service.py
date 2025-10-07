"""
District Authority service for case and document management
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from models.application import Application, ApplicationStatus
from models.document import Document, DocumentStatus
from models.user import User

logger = structlog.get_logger()


class DistrictAuthorityService:
    """District Authority service for managing cases and documents"""
    
    def __init__(self, db: Session):
        self.db = db

    def get_pending_applications(self, limit: int = 50, offset: int = 0) -> List[Application]:
        """Get applications pending district authority review"""
        try:
            applications = (
                self.db.query(Application)
                .filter(Application.status.in_([
                    ApplicationStatus.SUBMITTED,
                    ApplicationStatus.UNDER_REVIEW,
                    ApplicationStatus.DOCUMENT_VERIFICATION_PENDING
                ]))
                .offset(offset)
                .limit(limit)
                .all()
            )
            return applications
        except Exception as e:
            logger.error("Failed to get pending applications", error=str(e))
            raise

    def get_application_with_details(self, application_id: str) -> Optional[Dict[str, Any]]:
        """Get application details with user and document information"""
        try:
            application = (
                self.db.query(Application)
                .filter(Application.id == application_id)
                .first()
            )
            
            if not application:
                raise NotFoundException("Application not found")

            user = self.db.query(User).filter(User.id == application.user_id).first()
            documents = (
                self.db.query(Document)
                .filter(Document.application_id == application_id)
                .all()
            )

            return {
                "application": application,
                "user": user,
                "documents": documents
            }
        except Exception as e:
            logger.error("Failed to get application details", application_id=application_id, error=str(e))
            raise

    def verify_fir_cctns(self, fir_number: str) -> Dict[str, Any]:
        """Mock CCTNS verification of FIR number"""
        try:
            # Mock verification logic - in real implementation, this would call CCTNS API
            if not fir_number:
                return {
                    "verified": False,
                    "message": "FIR number is required",
                    "error": "MISSING_FIR"
                }
            
            # Basic format validation
            if not fir_number.upper().startswith("FIR"):
                return {
                    "verified": False,
                    "message": "Invalid FIR number format. FIR number should start with 'FIR'",
                    "error": "INVALID_FORMAT"
                }
            
            # Mock verification based on FIR number format
            # In real implementation, this would be replaced with actual CCTNS API call
            if len(fir_number) >= 8 and fir_number.upper().startswith("FIR"):
                return {
                    "verified": True,
                    "message": "FIR verified successfully through CCTNS",
                    "verification_date": datetime.utcnow()
                }
            else:
                return {
                    "verified": False,
                    "message": "FIR not found in CCTNS database or invalid format",
                    "error": "NOT_FOUND_IN_CCTNS"
                }
                
        except Exception as e:
            logger.error("Failed to verify FIR", fir_number=fir_number, error=str(e))
            return {
                "verified": False,
                "message": "CCTNS verification service temporarily unavailable",
                "error": "SERVICE_UNAVAILABLE"
            }

    def update_application_cctns_status(
        self, 
        application_id: str, 
        fir_number: str, 
        verified: bool, 
        reviewer_id: str
    ) -> Application:
        """Update application CCTNS verification status"""
        try:
            application = (
                self.db.query(Application)
                .filter(Application.id == application_id)
                .first()
            )
            
            if not application:
                raise NotFoundException("Application not found")

            application.fir_number = fir_number
            application.cctns_verified = verified
            application.cctns_verification_date = datetime.utcnow()
            application.district_reviewed_by = reviewer_id
            application.district_reviewed_at = datetime.utcnow()
            application.updated_at = datetime.utcnow()

            self.db.commit()
            self.db.refresh(application)
            return application
            
        except Exception as e:
            self.db.rollback()
            logger.error("Failed to update CCTNS status", application_id=application_id, error=str(e))
            raise

    def verify_document(
        self, 
        document_id: str, 
        status: str, 
        comments: Optional[str] = None,
        reviewer_id: str = None
    ) -> Document:
        """Verify a document - approve, reject, or add comments"""
        try:
            if status not in ["VERIFIED", "REJECTED", "PENDING"]:
                raise ValidationException("Status must be 'VERIFIED', 'REJECTED', or 'PENDING'")

            document = (
                self.db.query(Document)
                .filter(Document.id == document_id)
                .first()
            )
            
            if not document:
                raise NotFoundException("Document not found")

            # Update document status
            document.status = DocumentStatus(status)
            document.verification_notes = comments
            document.verified_by = reviewer_id
            document.verified_at = datetime.utcnow() if status in ["VERIFIED", "REJECTED"] else None
            document.updated_at = datetime.utcnow()

            self.db.commit()
            self.db.refresh(document)
            return document
            
        except Exception as e:
            self.db.rollback()
            logger.error("Failed to verify document", document_id=document_id, error=str(e))
            raise

    def review_application(
        self, 
        application_id: str, 
        action: str, 
        comments: Optional[str] = None,
        reviewer_id: str = None
    ) -> Application:
        """Review application - approve, reject, or send back with comments"""
        try:
            if action not in ["approve", "reject", "pending"]:
                raise ValidationException("Action must be 'approve', 'reject', or 'pending'")

            application = (
                self.db.query(Application)
                .filter(Application.id == application_id)
                .first()
            )
            
            if not application:
                raise NotFoundException("Application not found")

            # Check if all documents are verified before approval
            if action == "approve":
                documents = (
                    self.db.query(Document)
                    .filter(Document.application_id == application_id)
                    .all()
                )
                
                unverified_docs = [doc for doc in documents if doc.status == DocumentStatus.PENDING]
                if unverified_docs:
                    raise ValidationException("All documents must be verified before approval")
                
                rejected_docs = [doc for doc in documents if doc.status == DocumentStatus.REJECTED]
                if rejected_docs:
                    raise ValidationException("Application cannot be approved with rejected documents")

                # Check CCTNS verification for compensation cases
                if application.application_type in ["COMPENSATION", "POA_COMPENSATION"]:
                    if not application.cctns_verified:
                        raise ValidationException("CCTNS verification required for compensation cases")

                # Update status to approved and forward to social welfare
                application.status = ApplicationStatus.APPROVED
                application.approved_at = datetime.utcnow()
                
            elif action == "reject":
                application.status = ApplicationStatus.REJECTED
                application.rejection_reason = comments
                
            elif action == "pending":
                # Send back to user with comments for clarification
                application.status = ApplicationStatus.DOCUMENT_VERIFICATION_PENDING

            # Common updates
            application.district_comments = comments
            application.district_reviewed_by = reviewer_id
            application.district_reviewed_at = datetime.utcnow()
            application.reviewed_at = datetime.utcnow()
            application.updated_at = datetime.utcnow()

            self.db.commit()
            self.db.refresh(application)
            return application
            
        except Exception as e:
            self.db.rollback()
            logger.error("Failed to review application", application_id=application_id, error=str(e))
            raise

    def get_dashboard_stats(self) -> Dict[str, Any]:
        """Get dashboard statistics for district authority"""
        try:
            pending_applications = (
                self.db.query(Application)
                .filter(Application.status.in_([
                    ApplicationStatus.SUBMITTED,
                    ApplicationStatus.UNDER_REVIEW,
                    ApplicationStatus.DOCUMENT_VERIFICATION_PENDING
                ]))
                .count()
            )

            approved_applications = (
                self.db.query(Application)
                .filter(Application.status == ApplicationStatus.APPROVED)
                .count()
            )

            rejected_applications = (
                self.db.query(Application)
                .filter(Application.status == ApplicationStatus.REJECTED)
                .count()
            )

            pending_documents = (
                self.db.query(Document)
                .filter(Document.status == DocumentStatus.PENDING)
                .count()
            )

            verified_documents = (
                self.db.query(Document)
                .filter(Document.status == DocumentStatus.VERIFIED)
                .count()
            )

            return {
                "pending_applications": pending_applications,
                "approved_applications": approved_applications,
                "rejected_applications": rejected_applications,
                "pending_documents": pending_documents,
                "verified_documents": verified_documents,
                "total_applications": pending_applications + approved_applications + rejected_applications
            }
            
        except Exception as e:
            logger.error("Failed to get dashboard stats", error=str(e))
            raise