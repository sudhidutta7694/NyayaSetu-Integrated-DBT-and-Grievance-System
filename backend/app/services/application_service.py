"""
Application service for managing applications
"""

from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from decimal import Decimal
import structlog
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import NotFoundException, ValidationException, ConflictException
from app.core.security import generate_application_number
from app.schema.application import (
    Application, ApplicationCreate, ApplicationUpdate, ApplicationStatus,
    ApplicationType, ApplicationReview, ApplicationDisbursement,
    ApplicationFilter, ApplicationStats
)
from models.application import Application as ApplicationModel
from models.user import User as UserModel
from models.document import Document as DocumentModel

logger = structlog.get_logger()


class ApplicationService:
    """Application service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    async def create_application(
        self, 
        user_id: str, 
        application_data: ApplicationCreate
    ) -> Application:
        """Create a new application"""
        try:
            # Check if user has any incomplete/active applications
            from models.application import Application as ApplicationModel, ApplicationStatus as ModelApplicationStatus
            
            # Define terminal/final states where user can apply again
            terminal_statuses = [
                ModelApplicationStatus.COMPLETED,
                ModelApplicationStatus.REJECTED,
                ModelApplicationStatus.DISTRICT_AUTHORITY_REJECTED,
                ModelApplicationStatus.DOCUMENTS_REJECTED,
                ModelApplicationStatus.SOCIAL_WELFARE_REJECTED,
                ModelApplicationStatus.FI_REJECTED,
                ModelApplicationStatus.FUND_DISBURSED
            ]
            
            # Check if user has any application of the SAME TYPE that is NOT in a terminal state
            # Users can have multiple applications of different types simultaneously
            existing_active_applications = self.db.query(ApplicationModel).filter(
                ApplicationModel.user_id == user_id,
                ApplicationModel.application_type == application_data.application_type,
                ~ApplicationModel.status.in_(terminal_statuses)
            ).all()
            
            if existing_active_applications:
                app_type_name = application_data.application_type.value.replace('_', ' ').title()
                raise ConflictException(f"You already have an active {app_type_name} application in progress. Please wait until it is completed or rejected before submitting another {app_type_name} application.")
            
            # Generate application number
            application_number = generate_application_number()
            
            # Create application
            application = ApplicationModel(
                application_number=application_number,
                user_id=user_id,
                title=application_data.title,
                description=application_data.description,
                application_type=application_data.application_type,
                incident_date=application_data.incident_date,
                incident_description=application_data.incident_description,
                incident_district=application_data.incident_district,
                police_station=application_data.police_station,
                fir_number=application_data.fir_number,
                bank_account_number=application_data.bank_account_number,
                bank_ifsc_code=application_data.bank_ifsc_code,
                bank_name=application_data.bank_name,
                bank_branch=application_data.bank_branch,
                account_holder_name=application_data.account_holder_name,
                status=ModelApplicationStatus.SUBMITTED,
                submitted_at=datetime.now(timezone.utc)
            )
            
            self.db.add(application)
            self.db.flush()  # Flush to get the application ID
            
            # Link all user documents to this application using many-to-many relationship
            user_documents = self.db.query(DocumentModel).filter(
                DocumentModel.user_id == user_id
            ).all()
            
            # Add documents to the many-to-many relationship
            for doc in user_documents:
                application.linked_documents.append(doc)
                # Also set application_id for backward compatibility
                if not doc.application_id:
                    doc.application_id = application.id
            
            self.db.commit()
            self.db.refresh(application)
            
            logger.info("Application created and documents linked", 
                       application_id=application.id, 
                       user_id=user_id, 
                       documents_linked=len(user_documents))
            return application
            
        except ConflictException:
            raise
        except Exception as e:
            logger.error("Failed to create application", error=str(e))
            raise ValidationException("Failed to create application")
    
    async def get_application(self, application_id: str) -> Optional[Application]:
        """Get application by ID"""
        try:
            from models.application import Application as ApplicationModel
            application = self.db.query(ApplicationModel).filter(
                ApplicationModel.id == application_id
            ).first()
            return application
        except Exception as e:
            logger.error("Failed to get application", application_id=application_id, error=str(e))
            return None
    
    async def get_application_by_number(self, application_number: str) -> Optional[Application]:
        """Get application by application number"""
        try:
            from models.application import Application as ApplicationModel
            application = self.db.query(ApplicationModel).filter(
                ApplicationModel.application_number == application_number
            ).first()
            return application
        except Exception as e:
            logger.error("Failed to get application by number", application_number=application_number, error=str(e))
            return None
    
    def get_user_applications(
        self, 
        user_id: str, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[ApplicationModel]:
        """Get applications for a specific user"""
        try:
            applications = self.db.query(ApplicationModel)\
                .options(
                    joinedload(ApplicationModel.user),
                    joinedload(ApplicationModel.documents)
                )\
                .filter(ApplicationModel.user_id == user_id)\
                .order_by(ApplicationModel.created_at.desc())\
                .offset(skip)\
                .limit(limit)\
                .all()
            return applications
        except Exception as e:
            logger.error("Failed to get user applications", user_id=user_id, error=str(e))
            return []
    
    async def get_applications(
        self, 
        filters: Optional[ApplicationFilter] = None,
        skip: int = 0, 
        limit: int = 100
    ) -> List[Application]:
        """Get applications with filters"""
        try:
            where_conditions = {}
            
            if filters:
                if filters.status:
                    where_conditions["status"] = filters.status.value
                if filters.application_type:
                    where_conditions["application_type"] = filters.application_type.value
                if filters.user_id:
                    where_conditions["user_id"] = filters.user_id
                if filters.date_from:
                    where_conditions["created_at"] = {"gte": filters.date_from}
                if filters.date_to:
                    if "created_at" in where_conditions:
                        where_conditions["created_at"]["lte"] = filters.date_to
                    else:
                        where_conditions["created_at"] = {"lte": filters.date_to}
                
                # Handle district and state filters through user relation
                if filters.district or filters.state:
                    user_where = {}
                    if filters.district:
                        user_where["district"] = filters.district
                    if filters.state:
                        user_where["state"] = filters.state
                    where_conditions["user"] = user_where
            
            applications = await self.db.application.find_many(
                where=where_conditions,
                skip=skip,
                take=limit,
                order_by={"created_at": "desc"},
                include={
                    "user": True,
                    "documents": True,
                    "case": True,
                    "disbursements": True
                }
            )
            return applications
        except Exception as e:
            logger.error("Failed to get applications", error=str(e))
            return []
    
    async def update_application(
        self, 
        application_id: str, 
        update_data: ApplicationUpdate
    ) -> Optional[Application]:
        """Update application"""
        try:
            # Check if application exists and is in draft status
            application = await self.db.application.find_unique(
                where={"id": application_id}
            )
            
            if not application:
                raise NotFoundException("Application not found")
            
            if application.status != ApplicationStatus.DRAFT.value:
                raise ValidationException("Only draft applications can be updated")
            
            # Convert update data to dict, excluding None values
            update_dict = update_data.dict(exclude_unset=True)
            
            # Update application
            updated_application = await self.db.application.update(
                where={"id": application_id},
                data=update_dict
            )
            
            logger.info("Application updated", application_id=application_id)
            return updated_application
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error("Failed to update application", application_id=application_id, error=str(e))
            raise ValidationException("Failed to update application")
    
    async def submit_application(self, application_id: str) -> Optional[Application]:
        """Submit application for review"""
        try:
            # Check if application exists and is in draft status
            application = await self.db.application.find_unique(
                where={"id": application_id}
            )
            
            if not application:
                raise NotFoundException("Application not found")
            
            if application.status != ApplicationStatus.DRAFT.value:
                raise ValidationException("Only draft applications can be submitted")
            
            # Validate required fields
            if not application.bank_account_number or not application.bank_ifsc_code:
                raise ValidationException("Bank details are required for submission")
            
            # Update application status
            updated_application = await self.db.application.update(
                where={"id": application_id},
                data={
                    "status": ApplicationStatus.SUBMITTED.value,
                    "submitted_at": datetime.utcnow()
                }
            )
            
            logger.info("Application submitted", application_id=application_id)
            return updated_application
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error("Failed to submit application", application_id=application_id, error=str(e))
            raise ValidationException("Failed to submit application")
    
    async def review_application(
        self, 
        application_id: str, 
        review_data: ApplicationReview,
        reviewer_id: str
    ) -> Optional[Application]:
        """Review application"""
        try:
            # Check if application exists
            application = await self.db.application.find_unique(
                where={"id": application_id}
            )
            
            if not application:
                raise NotFoundException("Application not found")
            
            if application.status not in [ApplicationStatus.SUBMITTED.value, ApplicationStatus.UNDER_REVIEW.value]:
                raise ValidationException("Application is not in reviewable status")
            
            # Prepare update data
            update_data = {
                "status": review_data.status.value,
                "reviewed_at": datetime.utcnow()
            }
            
            if review_data.amount_approved:
                update_data["amount_approved"] = review_data.amount_approved
            
            if review_data.rejection_reason:
                update_data["rejection_reason"] = review_data.rejection_reason
            
            if review_data.status == ApplicationStatus.APPROVED:
                update_data["approved_at"] = datetime.utcnow()
            
            # Update application
            updated_application = await self.db.application.update(
                where={"id": application_id},
                data=update_data
            )
            
            logger.info("Application reviewed", application_id=application_id, reviewer_id=reviewer_id, status=review_data.status.value)
            return updated_application
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error("Failed to review application", application_id=application_id, error=str(e))
            raise ValidationException("Failed to review application")
    
    async def disburse_funds(
        self, 
        application_id: str, 
        disbursement_data: ApplicationDisbursement,
        disburser_id: str
    ) -> Optional[Application]:
        """Disburse funds for approved application"""
        try:
            # Check if application exists and is approved
            application = await self.db.application.find_unique(
                where={"id": application_id}
            )
            
            if not application:
                raise NotFoundException("Application not found")
            
            if application.status != ApplicationStatus.APPROVED.value:
                raise ValidationException("Only approved applications can have funds disbursed")
            
            # Check if amount is within approved limit
            if disbursement_data.amount > application.amount_approved:
                raise ValidationException("Disbursement amount cannot exceed approved amount")
            
            # Create disbursement record
            disbursement = await self.db.disbursement.create(
                data={
                    "application_id": application_id,
                    "amount": disbursement_data.amount,
                    "transaction_id": disbursement_data.transaction_id,
                    "bank_reference": disbursement_data.bank_reference,
                    "status": "COMPLETED",
                    "disbursed_by": disburser_id,
                    "disbursed_at": datetime.utcnow()
                }
            )
            
            # Update application status
            updated_application = await self.db.application.update(
                where={"id": application_id},
                data={
                    "status": ApplicationStatus.FUND_DISBURSED.value,
                    "amount_disbursed": disbursement_data.amount,
                    "disbursed_at": datetime.utcnow()
                }
            )
            
            logger.info("Funds disbursed", application_id=application_id, disburser_id=disburser_id, amount=disbursement_data.amount)
            return updated_application
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error("Failed to disburse funds", application_id=application_id, error=str(e))
            raise ValidationException("Failed to disburse funds")
    
    async def get_application_stats(self, filters: Optional[ApplicationFilter] = None) -> ApplicationStats:
        """Get application statistics"""
        try:
            where_conditions = {}
            
            if filters:
                if filters.status:
                    where_conditions["status"] = filters.status.value
                if filters.application_type:
                    where_conditions["application_type"] = filters.application_type.value
                if filters.user_id:
                    where_conditions["user_id"] = filters.user_id
                if filters.date_from:
                    where_conditions["created_at"] = {"gte": filters.date_from}
                if filters.date_to:
                    if "created_at" in where_conditions:
                        where_conditions["created_at"]["lte"] = filters.date_to
                    else:
                        where_conditions["created_at"] = {"lte": filters.date_to}
            
            # Get counts
            total_applications = await self.db.application.count(where=where_conditions)
            
            pending_where = {**where_conditions, "status": {"in": ["SUBMITTED", "UNDER_REVIEW", "DOCUMENT_VERIFICATION_PENDING"]}}
            pending_applications = await self.db.application.count(where=pending_where)
            
            approved_where = {**where_conditions, "status": "APPROVED"}
            approved_applications = await self.db.application.count(where=approved_where)
            
            rejected_where = {**where_conditions, "status": "REJECTED"}
            rejected_applications = await self.db.application.count(where=rejected_where)
            
            disbursed_where = {**where_conditions, "status": "FUND_DISBURSED"}
            disbursed_applications = await self.db.application.count(where=disbursed_where)
            
            # Get amounts
            applications = await self.db.application.find_many(
                where=where_conditions,
                select={
                    "amount_approved": True,
                    "amount_disbursed": True
                }
            )
            
            total_amount_approved = sum(app.amount_approved or 0 for app in applications)
            total_amount_disbursed = sum(app.amount_disbursed or 0 for app in applications)
            
            return ApplicationStats(
                total_applications=total_applications,
                pending_applications=pending_applications,
                approved_applications=approved_applications,
                rejected_applications=rejected_applications,
                disbursed_applications=disbursed_applications,
                total_amount_approved=total_amount_approved,
                total_amount_disbursed=total_amount_disbursed
            )
            
        except Exception as e:
            logger.error("Failed to get application stats", error=str(e))
            raise ValidationException("Failed to get application statistics")
    
    async def delete_application(self, application_id: str) -> bool:
        """Delete application (only if in draft status)"""
        try:
            # Check if application exists and is in draft status
            application = await self.db.application.find_unique(
                where={"id": application_id}
            )
            
            if not application:
                raise NotFoundException("Application not found")
            
            if application.status != ApplicationStatus.DRAFT.value:
                raise ValidationException("Only draft applications can be deleted")
            
            # Delete application
            await self.db.application.delete(where={"id": application_id})
            
            logger.info("Application deleted", application_id=application_id)
            return True
            
        except (NotFoundException, ValidationException):
            raise
        except Exception as e:
            logger.error("Failed to delete application", application_id=application_id, error=str(e))
            raise ValidationException("Failed to delete application")

