"""
Onboarding service for managing user onboarding process
"""

import json
from datetime import datetime, date
from typing import Optional, List, Dict, Any
from enum import Enum
import structlog
from sqlalchemy.orm import Session

from app.core.exceptions import ValidationException, DatabaseException

# Pydantic schemas for API validation (app/schema/)
from app.schema.onboarding import (
    OnboardingStepCreate,
    OnboardingStepUpdate,
    OnboardingStep as OnboardingStepSchema,
    OnboardingProgress,
    OnboardingStatus,
    PersonalInfoData,
    DocumentUploadData,
    BankDetailsData
)

# SQLAlchemy ORM models for database operations (models/)
from models.user import User
from models.onboarding import OnboardingStep as OnboardingStepModel, BankAccount as BankAccountModel
from models.document import Document as DocumentModel

logger = structlog.get_logger()


class OnboardingService:
    """Service for managing user onboarding process"""

    def __init__(self, db: Session):
        self.db = db
        self.total_steps = 3  # Total number of onboarding steps

    async def get_onboarding_status(self, user_id: str) -> OnboardingStatus:
        """Get current onboarding status for a user"""
        try:
            # Use SQLAlchemy ORM model
            user = self.db.query(User).filter(User.id == user_id).first()

            if not user:
                raise ValidationException("User not found")

            current_step = user.onboarding_step or 0
            is_completed = user.is_onboarded or False
            progress_percentage = (current_step / self.total_steps) * 100 if current_step > 0 else 0

            # Get next step name
            next_step_name = None
            if not is_completed and current_step < self.total_steps:
                next_step_name = self._get_step_name(current_step + 1)

            # Check if user can proceed to next step
            can_proceed = await self._can_proceed_to_next_step(user_id, current_step)

            return OnboardingStatus(
                is_onboarded=is_completed,
                current_step=current_step,
                total_steps=self.total_steps,
                progress_percentage=progress_percentage,
                next_step_name=next_step_name,
                can_proceed=can_proceed
            )

        except Exception as e:
            logger.error("Failed to get onboarding status", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to get onboarding status: {str(e)}")

    async def get_onboarding_progress(self, user_id: str) -> OnboardingProgress:
        """Get detailed onboarding progress for a user"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()

            if not user:
                raise ValidationException("User not found")

            # Get onboarding steps using SQLAlchemy ORM
            steps = []
            onboarding_steps = self.db.query(OnboardingStepModel).filter(
                OnboardingStepModel.user_id == user_id
            ).all()
            
            # Convert ORM models to Pydantic schemas for API response
            for step_data in onboarding_steps:
                steps.append(OnboardingStepSchema(
                    id=str(step_data.id),
                    user_id=str(step_data.user_id),
                    step_number=step_data.step_number,
                    step_name=step_data.step_name,
                    is_completed=step_data.is_completed,
                    data=json.loads(step_data.data) if step_data.data else None,
                    completed_at=step_data.completed_at,
                    created_at=step_data.created_at,
                    updated_at=step_data.updated_at
                ))

            return OnboardingProgress(
                user_id=user_id,
                current_step=user.onboarding_step or 0,
                total_steps=self.total_steps,
                is_completed=user.is_onboarded or False,
                steps=steps
            )

        except Exception as e:
            logger.error("Failed to get onboarding progress", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to get onboarding progress: {str(e)}")

    async def initialize_onboarding(self, user_id: str) -> bool:
        """Initialize onboarding process for a new user"""
        try:
            # Check if onboarding steps already exist
            existing_steps = self.db.query(OnboardingStepModel).filter(
                OnboardingStepModel.user_id == user_id
            ).count()
            
            if existing_steps > 0:
                logger.info("Onboarding already initialized for user", user_id=user_id)
                return True
            
            # Create initial onboarding steps using ORM model
            steps = [
                {"step_number": 1, "step_name": "Personal Information"},
                {"step_number": 2, "step_name": "Document Upload"},
                {"step_number": 3, "step_name": "Bank Details"}
            ]

            for step in steps:
                onboarding_step = OnboardingStepModel(
                    user_id=user_id,
                    step_number=step["step_number"],
                    step_name=step["step_name"],
                    is_completed=False
                )
                self.db.add(onboarding_step)

            # Update user onboarding status
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                user.onboarding_step = 1
                user.is_onboarded = False
                self.db.commit()

            logger.info("Onboarding initialized for user", user_id=user_id)
            return True

        except Exception as e:
            self.db.rollback()
            logger.error("Failed to initialize onboarding", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to initialize onboarding: {str(e)}")

    async def complete_personal_info_step(self, user_id: str, personal_info: PersonalInfoData) -> bool:
        """Complete personal information step"""
        try:
            # Update user with personal information using ORM model
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise ValidationException("User not found")
            
            user.full_name = personal_info.full_name
            user.father_name = personal_info.father_name
            user.mother_name = personal_info.mother_name
            user.date_of_birth = personal_info.date_of_birth
            user.age = personal_info.age
            user.gender = personal_info.gender.value
            user.category = personal_info.category.value
            user.phone_number = personal_info.mobile_number
            user.address = personal_info.address
            user.district = personal_info.district
            user.state = personal_info.state
            user.pincode = personal_info.pincode

            # Mark step as completed
            await self._complete_step(user_id, 1, personal_info.dict())

            logger.info("Personal info step completed", user_id=user_id)
            return True

        except Exception as e:
            self.db.rollback()
            logger.error("Failed to complete personal info step", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to complete personal info step: {str(e)}")

    async def complete_document_upload_step(self, user_id: str, documents: List[DocumentUploadData]) -> bool:
        """Complete document upload step"""
        try:
            # Save document information using ORM model
            for doc in documents:
                document = DocumentModel(
                    user_id=user_id,
                    document_type=doc.document_type.value,
                    document_name=doc.file_name,
                    file_path=f"/uploads/{user_id}/{doc.file_name}",
                    file_size=doc.file_size,
                    mime_type=doc.mime_type,
                    is_digilocker=doc.is_digilocker,
                    digilocker_id=doc.digilocker_id,
                    ocr_data=None,
                    status="PENDING"
                )
                self.db.add(document)

            # Mark step as completed
            await self._complete_step(user_id, 2, [doc.dict() for doc in documents])

            logger.info("Document upload step completed", user_id=user_id)
            return True

        except Exception as e:
            self.db.rollback()
            logger.error("Failed to complete document upload step", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to complete document upload step: {str(e)}")

    async def complete_bank_details_step(self, user_id: str, bank_details: BankDetailsData) -> bool:
        """Complete bank details step"""
        try:
            # Save bank account information using ORM model
            bank_account = BankAccountModel(
                user_id=user_id,
                account_number=bank_details.account_number,
                ifsc_code=bank_details.ifsc_code,
                bank_name=bank_details.bank_name,
                branch_name=bank_details.branch_name,
                account_holder_name=bank_details.account_holder_name,
                is_verified=False
            )
            self.db.add(bank_account)

            # Mark step as completed
            await self._complete_step(user_id, 3, bank_details.dict())

            logger.info("Bank details step completed", user_id=user_id)
            return True

        except Exception as e:
            self.db.rollback()
            logger.error("Failed to complete bank details step", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to complete bank details step: {str(e)}")

    async def complete_verification_step(self, user_id: str) -> bool:
        """Complete verification step"""
        try:
            # Mark step as completed
            await self._complete_step(user_id, 4, {"verified": True})

            # Mark user as fully onboarded using ORM model
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                user.is_onboarded = True
                user.onboarding_step = self.total_steps
                self.db.commit()

            logger.info("Verification step completed", user_id=user_id)
            return True

        except Exception as e:
            self.db.rollback()
            logger.error("Failed to complete verification step", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to complete verification step: {str(e)}")

    async def _complete_step(self, user_id: str, step_number: int, data: Dict[str, Any]) -> None:
        """Mark a step as completed using ORM models"""
        # Find and update the onboarding step
        step = self.db.query(OnboardingStepModel).filter(
            OnboardingStepModel.user_id == user_id,
            OnboardingStepModel.step_number == step_number
        ).first()
        
        if step:
            step.is_completed = True
            # Convert data to JSON-serializable format
            serializable_data = self._make_json_serializable(data)
            step.data = json.dumps(serializable_data)
            step.completed_at = datetime.utcnow()

        # Update user's current step
        user = self.db.query(User).filter(User.id == user_id).first()
        if user:
            user.onboarding_step = step_number
            
        self.db.commit()
    
    def _make_json_serializable(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convert data to JSON-serializable format"""
        serializable = {}
        for key, value in data.items():
            if isinstance(value, (datetime, date)):
                serializable[key] = value.isoformat()
            elif isinstance(value, Enum):
                serializable[key] = value.value
            elif isinstance(value, list):
                serializable[key] = [
                    self._make_json_serializable(item) if isinstance(item, dict) else item
                    for item in value
                ]
            elif isinstance(value, dict):
                serializable[key] = self._make_json_serializable(value)
            else:
                serializable[key] = value
        return serializable

    async def _can_proceed_to_next_step(self, user_id: str, current_step: int) -> bool:
        """Check if user can proceed to next step using ORM model"""
        if current_step >= self.total_steps:
            return False

        if current_step == 0:
            return True

        # Check if current step is completed
        step = self.db.query(OnboardingStepModel).filter(
            OnboardingStepModel.user_id == user_id,
            OnboardingStepModel.step_number == current_step
        ).first()

        return step and step.is_completed

    def _get_step_name(self, step_number: int) -> str:
        """Get step name by number"""
        step_names = {
            1: "Personal Information",
            2: "Document Upload",
            3: "Bank Details"
        }
        return step_names.get(step_number, "Unknown Step")

    async def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all documents for a user using ORM model"""
        try:
            documents = self.db.query(DocumentModel).filter(
                DocumentModel.user_id == user_id
            ).order_by(DocumentModel.created_at.desc()).all()

            return [
                {
                    "id": str(doc.id),
                    "document_type": doc.document_type,
                    "document_name": doc.document_name,
                    "file_path": doc.file_path,
                    "file_size": doc.file_size,
                    "mime_type": doc.mime_type,
                    "status": doc.status,
                    "is_digilocker": doc.is_digilocker,
                    "digilocker_id": doc.digilocker_id,
                    "ocr_data": json.loads(doc.ocr_data) if doc.ocr_data else None,
                    "created_at": doc.created_at,
                    "updated_at": doc.updated_at
                }
                for doc in documents
            ]

        except Exception as e:
            logger.error("Failed to get user documents", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to get user documents: {str(e)}")

    async def get_user_bank_accounts(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all bank accounts for a user using ORM model"""
        try:
            bank_accounts = self.db.query(BankAccountModel).filter(
                BankAccountModel.user_id == user_id
            ).order_by(BankAccountModel.created_at.desc()).all()

            return [
                {
                    "id": str(account.id),
                    "account_number": account.account_number,
                    "ifsc_code": account.ifsc_code,
                    "bank_name": account.bank_name,
                    "branch_name": account.branch_name,
                    "account_holder_name": account.account_holder_name,
                    "is_verified": account.is_verified,
                    "verified_at": account.verified_at,
                    "created_at": account.created_at,
                    "updated_at": account.updated_at
                }
                for account in bank_accounts
            ]

        except Exception as e:
            logger.error("Failed to get user bank accounts", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to get user bank accounts: {str(e)}")
