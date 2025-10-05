"""
Onboarding service for managing user onboarding process
"""

import json
from datetime import datetime
from typing import Optional, List, Dict, Any
import structlog
from prisma import Prisma

from app.core.exceptions import ValidationException, DatabaseException
from app.models.onboarding import (
    OnboardingStepCreate,
    OnboardingStepUpdate,
    OnboardingStep,
    OnboardingProgress,
    OnboardingStatus,
    PersonalInfoData,
    DocumentUploadData,
    BankDetailsData,
    OnboardingStepType
)

logger = structlog.get_logger()


class OnboardingService:
    """Service for managing user onboarding process"""

    def __init__(self, db: Prisma):
        self.db = db
        self.total_steps = 4  # Total number of onboarding steps

    async def get_onboarding_status(self, user_id: str) -> OnboardingStatus:
        """Get current onboarding status for a user"""
        try:
            user = await self.db.user.find_unique(
                where={"id": user_id},
                include={"onboarding_steps": True}
            )

            if not user:
                raise ValidationException("User not found")

            current_step = user.onboarding_step
            is_completed = user.is_onboarded
            progress_percentage = (current_step / self.total_steps) * 100

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
            user = await self.db.user.find_unique(
                where={"id": user_id},
                include={"onboarding_steps": True}
            )

            if not user:
                raise ValidationException("User not found")

            steps = []
            for step_data in user.onboarding_steps:
                steps.append(OnboardingStep(
                    id=step_data.id,
                    user_id=step_data.user_id,
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
                current_step=user.onboarding_step,
                total_steps=self.total_steps,
                is_completed=user.is_onboarded,
                steps=steps
            )

        except Exception as e:
            logger.error("Failed to get onboarding progress", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to get onboarding progress: {str(e)}")

    async def initialize_onboarding(self, user_id: str) -> bool:
        """Initialize onboarding process for a new user"""
        try:
            # Create initial onboarding steps
            steps = [
                {"step_number": 1, "step_name": "Personal Information"},
                {"step_number": 2, "step_name": "Document Upload"},
                {"step_number": 3, "step_name": "Bank Details"},
                {"step_number": 4, "step_name": "Verification"}
            ]

            for step in steps:
                await self.db.onboardingstep.create(
                    data={
                        "user_id": user_id,
                        "step_number": step["step_number"],
                        "step_name": step["step_name"],
                        "is_completed": False
                    }
                )

            # Update user onboarding status
            await self.db.user.update(
                where={"id": user_id},
                data={
                    "onboarding_step": 1,
                    "is_onboarded": False
                }
            )

            logger.info("Onboarding initialized for user", user_id=user_id)
            return True

        except Exception as e:
            logger.error("Failed to initialize onboarding", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to initialize onboarding: {str(e)}")

    async def complete_personal_info_step(self, user_id: str, personal_info: PersonalInfoData) -> bool:
        """Complete personal information step"""
        try:
            # Update user with personal information
            await self.db.user.update(
                where={"id": user_id},
                data={
                    "father_name": personal_info.father_name,
                    "mother_name": personal_info.mother_name,
                    "date_of_birth": personal_info.date_of_birth,
                    "age": personal_info.age,
                    "gender": personal_info.gender.value,
                    "category": personal_info.category.value,
                    "address": personal_info.address,
                    "district": personal_info.district,
                    "state": personal_info.state,
                    "pincode": personal_info.pincode
                }
            )

            # Mark step as completed
            await self._complete_step(user_id, 1, personal_info.dict())

            logger.info("Personal info step completed", user_id=user_id)
            return True

        except Exception as e:
            logger.error("Failed to complete personal info step", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to complete personal info step: {str(e)}")

    async def complete_document_upload_step(self, user_id: str, documents: List[DocumentUploadData]) -> bool:
        """Complete document upload step"""
        try:
            # Save document information
            for doc in documents:
                await self.db.document.create(
                    data={
                        "user_id": user_id,
                        "document_type": doc.document_type.value,
                        "document_name": doc.file_name,
                        "file_path": f"/uploads/{user_id}/{doc.file_name}",
                        "file_size": doc.file_size,
                        "mime_type": doc.mime_type,
                        "is_digilocker": doc.is_digilocker,
                        "digilocker_id": doc.digilocker_id,
                        "ocr_data": json.dumps(doc.ocr_data) if doc.ocr_data else None,
                        "status": "PENDING"
                    }
                )

            # Mark step as completed
            await self._complete_step(user_id, 2, [doc.dict() for doc in documents])

            logger.info("Document upload step completed", user_id=user_id)
            return True

        except Exception as e:
            logger.error("Failed to complete document upload step", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to complete document upload step: {str(e)}")

    async def complete_bank_details_step(self, user_id: str, bank_details: BankDetailsData) -> bool:
        """Complete bank details step"""
        try:
            # Save bank account information
            await self.db.bankaccount.create(
                data={
                    "user_id": user_id,
                    "account_number": bank_details.account_number,
                    "ifsc_code": bank_details.ifsc_code,
                    "bank_name": bank_details.bank_name,
                    "branch_name": bank_details.branch_name,
                    "account_holder_name": bank_details.account_holder_name,
                    "is_verified": False
                }
            )

            # Mark step as completed
            await self._complete_step(user_id, 3, bank_details.dict())

            logger.info("Bank details step completed", user_id=user_id)
            return True

        except Exception as e:
            logger.error("Failed to complete bank details step", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to complete bank details step: {str(e)}")

    async def complete_verification_step(self, user_id: str) -> bool:
        """Complete verification step"""
        try:
            # Mark step as completed
            await self._complete_step(user_id, 4, {"verified": True})

            # Mark user as fully onboarded
            await self.db.user.update(
                where={"id": user_id},
                data={
                    "is_onboarded": True,
                    "onboarding_step": self.total_steps
                }
            )

            logger.info("Verification step completed", user_id=user_id)
            return True

        except Exception as e:
            logger.error("Failed to complete verification step", user_id=user_id, error=str(e))
            raise DatabaseException(f"Failed to complete verification step: {str(e)}")

    async def _complete_step(self, user_id: str, step_number: int, data: Dict[str, Any]) -> None:
        """Mark a step as completed"""
        await self.db.onboardingstep.update(
            where={
                "user_id_step_number": {
                    "user_id": user_id,
                    "step_number": step_number
                }
            },
            data={
                "is_completed": True,
                "data": json.dumps(data),
                "completed_at": datetime.utcnow()
            }
        )

        # Update user's current step
        await self.db.user.update(
            where={"id": user_id},
            data={"onboarding_step": step_number}
        )

    async def _can_proceed_to_next_step(self, user_id: str, current_step: int) -> bool:
        """Check if user can proceed to next step"""
        if current_step >= self.total_steps:
            return False

        # Check if current step is completed
        step = await self.db.onboardingstep.find_unique(
            where={
                "user_id_step_number": {
                    "user_id": user_id,
                    "step_number": current_step
                }
            }
        )

        return step and step.is_completed

    def _get_step_name(self, step_number: int) -> str:
        """Get step name by number"""
        step_names = {
            1: "Personal Information",
            2: "Document Upload",
            3: "Bank Details",
            4: "Verification"
        }
        return step_names.get(step_number, "Unknown Step")

    async def get_user_documents(self, user_id: str) -> List[Dict[str, Any]]:
        """Get all documents for a user"""
        try:
            documents = await self.db.document.find_many(
                where={"user_id": user_id},
                order_by={"created_at": "desc"}
            )

            return [
                {
                    "id": doc.id,
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
        """Get all bank accounts for a user"""
        try:
            bank_accounts = await self.db.bankaccount.find_many(
                where={"user_id": user_id},
                order_by={"created_at": "desc"}
            )

            return [
                {
                    "id": account.id,
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

