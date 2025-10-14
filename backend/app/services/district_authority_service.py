"""
District Authority service for case and document management
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from models.application import Application, ApplicationStatus, ApplicationType
from models.document import Document, DocumentStatus
from models.user import User
from models.application_status_log import ApplicationStatusLog, ApplicationStage, StageStatus

logger = structlog.get_logger()


class DistrictAuthorityService:
    """District Authority service for managing cases and documents"""
    
    def __init__(self, db: Session):
        self.db = db

    def _check_application_ready_status(self, application: Application) -> Dict[str, Any]:
        """
        Helper method to check if application is ready for auto-approval.
        
        Returns:
            dict with keys:
                - all_documents_verified: bool
                - cctns_required: bool
                - cctns_verified: bool
                - is_ready: bool (true if can auto-approve)
                - reason: str (reason if not ready)
        """
        # Get all documents for this application
        all_documents = application.linked_documents if application.linked_documents else (
            self.db.query(Document).filter(Document.application_id == application.id).all()
        )
        
        if not all_documents or len(all_documents) == 0:
            return {
                "all_documents_verified": False,
                "cctns_required": False,
                "cctns_verified": False,
                "is_ready": False,
                "reason": "No documents found"
            }
        
        # Check if all documents are verified
        all_documents_verified = all(doc.status == DocumentStatus.VERIFIED for doc in all_documents)
        
        # Check if CCTNS is required based on application type
        # Inter-caste marriage does NOT require CCTNS
        is_inter_caste = application.application_type == ApplicationType.INTER_CASTE_MARRIAGE
        cctns_required = not is_inter_caste
        
        # Check CCTNS verification status
        cctns_verified = application.cctns_verified if cctns_required else True
        
        # Determine if ready for auto-approval
        is_ready = all_documents_verified and cctns_verified
        
        # Determine reason if not ready
        reason = ""
        if not all_documents_verified:
            reason = "Waiting for all documents to be verified"
        elif cctns_required and not cctns_verified:
            reason = "Waiting for CCTNS verification"
        
        return {
            "all_documents_verified": all_documents_verified,
            "cctns_required": cctns_required,
            "cctns_verified": cctns_verified,
            "is_ready": is_ready,
            "reason": reason
        }

    def get_pending_applications(self, limit: int = 50, offset: int = 0) -> List[Application]:
        """Get applications pending district authority review
        
        Only returns applications that:
        1. Have status SUBMITTED, UNDER_REVIEW, or DOCUMENT_VERIFICATION_PENDING
        2. Have a submitted_at timestamp (meaning they were actually submitted)
        3. Have documents linked to them (meaning user completed the application)
        """
        try:
            # Get applications with submitted status and submitted_at timestamp
            applications = (
                self.db.query(Application)
                .filter(
                    and_(
                        Application.status.in_([
                            ApplicationStatus.SUBMITTED,
                            ApplicationStatus.UNDER_REVIEW,
                            ApplicationStatus.DOCUMENT_VERIFICATION_PENDING
                        ]),
                        Application.submitted_at.isnot(None)  # Only submitted applications
                    )
                )
                .order_by(Application.submitted_at.desc())  # Most recent first
                .offset(offset)
                .limit(limit)
                .all()
            )
            
            # Filter to only include applications with documents (using many-to-many relationship)
            applications_with_docs = []
            for app in applications:
                # Check both the many-to-many relationship and the old application_id field
                doc_count = len(app.linked_documents) if app.linked_documents else 0
                if doc_count == 0:
                    # Fallback to old relationship for backward compatibility
                    doc_count = self.db.query(Document).filter(
                        Document.application_id == app.id
                    ).count()
                
                if doc_count > 0:
                    applications_with_docs.append(app)
            
            logger.info(
                "Fetched pending applications", 
                total_found=len(applications),
                with_documents=len(applications_with_docs)
            )
            
            return applications_with_docs
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
            # Get documents from many-to-many relationship, fallback to old relationship
            documents = application.linked_documents if application.linked_documents else (
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
        verified: bool
    ) -> Application:
        """Update application CCTNS verification status
        
        Auto-approves application if all documents are already verified
        """
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
            application.updated_at = datetime.utcnow()

            # If CCTNS is verified, check if application is ready for auto-approval
            if verified:
                ready_status = self._check_application_ready_status(application)
                
                if ready_status["is_ready"]:
                    # AUTO-APPROVE: All documents verified AND CCTNS verified
                    application.status = ApplicationStatus.DOCUMENTS_APPROVED
                    application.approved_at = datetime.utcnow()
                    application.district_reviewed_at = datetime.utcnow()
                    
                    # Dynamic comment based on application type
                    if application.application_type == ApplicationType.INTER_CASTE_MARRIAGE:
                        application.district_comments = "All documents verified - automatically forwarded to Social Welfare"
                        log_comment = "All documents verified - forwarded to Social Welfare"
                    else:
                        application.district_comments = "All documents and CCTNS verification completed - automatically forwarded to Social Welfare"
                        log_comment = "All documents and CCTNS verification completed - forwarded to Social Welfare"
                    
                    # Update or create status log
                    existing_log = (
                        self.db.query(ApplicationStatusLog)
                        .filter(
                            ApplicationStatusLog.application_id == application.id,
                            ApplicationStatusLog.stage == ApplicationStage.DISTRICT_AUTHORITY
                        )
                        .first()
                    )
                    
                    if existing_log:
                        existing_log.status = StageStatus.APPROVED
                        existing_log.comments = log_comment
                        existing_log.stage_completed_at = datetime.utcnow()
                    else:
                        status_log = ApplicationStatusLog(
                            application_id=application.id,
                            stage=ApplicationStage.DISTRICT_AUTHORITY,
                            status=StageStatus.APPROVED,
                            comments=log_comment,
                            stage_entered_at=application.submitted_at or datetime.utcnow(),
                            stage_completed_at=datetime.utcnow()
                        )
                        self.db.add(status_log)
                    
                    logger.info(
                        "Application auto-approved after CCTNS verification",
                        application_id=application.id,
                        application_type=application.application_type.value if application.application_type else None
                    )

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
        comments: Optional[str] = None
    ) -> Document:
        """Verify a document - approve, reject, or add comments
        
        Auto-approves application when all documents are verified.
        """
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
            document.verified_by = None
            document.verified_at = datetime.utcnow() if status in ["VERIFIED", "REJECTED"] else None
            document.updated_at = datetime.utcnow()

            # Get the application (check all applications linked to this document via many-to-many)
            # Use application_id for backward compatibility, or get from many-to-many relationship
            applications_to_update = []
            if document.application_id:
                app = self.db.query(Application).filter(Application.id == document.application_id).first()
                if app:
                    applications_to_update.append(app)
            if document.applications:
                for app in document.applications:
                    if app.id not in [a.id for a in applications_to_update]:
                        applications_to_update.append(app)
            
            if not applications_to_update:
                raise NotFoundException("Application not found")
            
            # Update all applications linked to this document
            for application in applications_to_update:
                # Only proceed with auto-approval logic if application is in district authority stage
                if application.status not in [
                    ApplicationStatus.SUBMITTED,
                    ApplicationStatus.UNDER_REVIEW,
                    ApplicationStatus.DOCUMENT_VERIFICATION_PENDING
                ]:
                    continue
                
                # Use helper method to check if application is ready for auto-approval
                ready_status = self._check_application_ready_status(application)
                
                # Get or create status log for DISTRICT_AUTHORITY stage
                existing_log = (
                    self.db.query(ApplicationStatusLog)
                    .filter(
                        ApplicationStatusLog.application_id == application.id,
                        ApplicationStatusLog.stage == ApplicationStage.DISTRICT_AUTHORITY
                    )
                    .first()
                )
                
                # AUTO-APPROVE if ready (all documents verified + CCTNS if required)
                if ready_status["is_ready"]:
                    application.status = ApplicationStatus.DOCUMENTS_APPROVED
                    application.approved_at = datetime.utcnow()
                    application.district_reviewed_at = datetime.utcnow()
                    
                    # Dynamic comment based on application type
                    if application.application_type == ApplicationType.INTER_CASTE_MARRIAGE:
                        application.district_comments = "All documents verified - automatically forwarded to Social Welfare"
                        log_comment = "All documents verified - forwarded to Social Welfare"
                    else:
                        application.district_comments = "All documents verified and CCTNS verification completed - automatically forwarded to Social Welfare"
                        log_comment = "All documents verified and CCTNS verification completed - forwarded to Social Welfare"
                    
                    if existing_log:
                        existing_log.status = StageStatus.APPROVED
                        existing_log.comments = log_comment
                        existing_log.stage_completed_at = datetime.utcnow()
                    else:
                        status_log = ApplicationStatusLog(
                            application_id=application.id,
                            stage=ApplicationStage.DISTRICT_AUTHORITY,
                            status=StageStatus.APPROVED,
                            comments=log_comment,
                            stage_entered_at=application.submitted_at or datetime.utcnow(),
                            stage_completed_at=datetime.utcnow()
                        )
                        self.db.add(status_log)
                    
                    logger.info(
                        "Application auto-approved",
                        application_id=application.id,
                        application_type=application.application_type.value if application.application_type else None,
                        cctns_required=ready_status["cctns_required"]
                    )
                
                elif ready_status["all_documents_verified"] and not ready_status["cctns_verified"]:
                    # Documents verified but CCTNS pending - keep in pending state
                    logger.info(
                        "All documents verified but CCTNS verification still pending",
                        application_id=application.id,
                        cctns_required=ready_status["cctns_required"]
                    )
                    # Update status log to reflect documents are done, waiting for CCTNS
                    if existing_log:
                        existing_log.comments = "All documents verified - awaiting CCTNS verification"
                    else:
                        status_log = ApplicationStatusLog(
                            application_id=application.id,
                            stage=ApplicationStage.DISTRICT_AUTHORITY,
                            status=StageStatus.PENDING,
                            comments="All documents verified - awaiting CCTNS verification",
                            stage_entered_at=application.submitted_at or datetime.utcnow()
                        )
                        self.db.add(status_log)
                
                else:
                    # Check if any document was rejected
                    all_documents = application.linked_documents if application.linked_documents else (
                        self.db.query(Document).filter(Document.application_id == application.id).all()
                    )
                    has_rejected = any(doc.status == DocumentStatus.REJECTED for doc in all_documents)
                    
                    if has_rejected:
                        # REJECT APPLICATION: At least one document rejected by district authority
                        application.status = ApplicationStatus.DOCUMENTS_REJECTED
                        application.rejection_reason = f"Document '{document.document_type}' rejected: {comments or 'No reason provided'}"
                        application.district_reviewed_at = datetime.utcnow()
                        application.district_comments = application.rejection_reason
                        
                        if existing_log:
                            existing_log.status = StageStatus.REJECTED
                            existing_log.comments = application.rejection_reason
                            existing_log.rejection_reason = application.rejection_reason
                            existing_log.stage_completed_at = datetime.utcnow()
                        else:
                            status_log = ApplicationStatusLog(
                                application_id=application.id,
                            stage=ApplicationStage.DISTRICT_AUTHORITY,
                            status=StageStatus.REJECTED,
                            comments=application.rejection_reason,
                            rejection_reason=application.rejection_reason,
                            stage_entered_at=application.submitted_at or datetime.utcnow(),
                            stage_completed_at=datetime.utcnow()
                        )
                        self.db.add(status_log)
                        
                        logger.info(
                            "Application documents rejected due to rejected document",
                            application_id=application.id,
                            document_id=document_id
                        )
                    else:
                        # PENDING: Some documents still pending verification
                        # Just log the document action
                        if not existing_log:
                            status_log = ApplicationStatusLog(
                                application_id=application.id,
                                stage=ApplicationStage.DISTRICT_AUTHORITY,
                                status=StageStatus.PENDING,
                                comments=f"Document '{document.document_type}' {status.lower()}: {comments or 'No comments'}",
                                stage_entered_at=application.submitted_at or datetime.utcnow()
                            )
                            self.db.add(status_log)
                        else:
                            # Append to existing log
                            existing_log.comments = (existing_log.comments or "") + f"\nDocument '{document.document_type}' {status.lower()}: {comments or 'No comments'}'"

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
        comments: Optional[str] = None
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
                # Use many-to-many relationship, fallback to old relationship
                documents = application.linked_documents if application.linked_documents else (
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

                # Check CCTNS verification for crime-related cases (PCR_RELIEF and POA_COMPENSATION)
                from models.application import ApplicationType
                if application.application_type in [ApplicationType.PCR_RELIEF, ApplicationType.POA_COMPENSATION]:
                    if not application.cctns_verified:
                        raise ValidationException("CCTNS verification required for PCR/POA compensation cases")

                # Update status to approved and forward to social welfare
                application.status = ApplicationStatus.APPROVED
                application.approved_at = datetime.utcnow()
                
            elif action == "reject":
                application.status = ApplicationStatus.DISTRICT_AUTHORITY_REJECTED
                application.rejection_reason = comments
                
            elif action == "pending":
                # Send back to user with comments for clarification
                application.status = ApplicationStatus.DOCUMENT_VERIFICATION_PENDING

            # Common updates
            application.district_comments = comments
            application.district_reviewed_at = datetime.utcnow()
            application.reviewed_at = datetime.utcnow()
            application.updated_at = datetime.utcnow()

            # Map action to stage status
            stage_status = StageStatus.PENDING
            stage_completed = None
            if action == "approve":
                stage_status = StageStatus.APPROVED
                stage_completed = datetime.utcnow()
            elif action == "reject":
                stage_status = StageStatus.REJECTED
                stage_completed = datetime.utcnow()
            
            # Check if status log already exists
            existing_log = (
                self.db.query(ApplicationStatusLog)
                .filter(
                    ApplicationStatusLog.application_id == application_id,
                    ApplicationStatusLog.stage == ApplicationStage.DISTRICT_AUTHORITY
                )
                .first()
            )
            
            if existing_log:
                # Update existing log
                existing_log.status = stage_status
                existing_log.comments = comments
                existing_log.rejection_reason = comments if action == "reject" else None
                existing_log.stage_completed_at = stage_completed
            else:
                # Create new status log
                status_log = ApplicationStatusLog(
                    application_id=application_id,
                    stage=ApplicationStage.DISTRICT_AUTHORITY,
                    status=stage_status,
                    comments=comments,
                    rejection_reason=comments if action == "reject" else None,
                    stage_entered_at=application.submitted_at or datetime.utcnow(),
                    stage_completed_at=stage_completed
                )
                self.db.add(status_log)

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
                .filter(Application.status.in_([
                    ApplicationStatus.DISTRICT_AUTHORITY_REJECTED,
                    ApplicationStatus.REJECTED  # Include generic for backward compatibility
                ]))
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