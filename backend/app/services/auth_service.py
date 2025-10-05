"""
Authentication service
"""

from datetime import datetime
from typing import Optional
import structlog

from app.core.database import Prisma
from app.core.exceptions import AuthenticationException, ConflictException
from app.models.user import User, UserCreate, UserRole
from app.core.security import generate_application_number

logger = structlog.get_logger()


class AuthService:
    """Authentication service"""
    
    def __init__(self, db: Prisma):
        self.db = db
    
    async def register_user(self, user_data: UserCreate) -> User:
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = await self.db.user.find_first(
                where={
                    "OR": [
                        {"email": user_data.email},
                        {"phone_number": user_data.phone_number}
                    ]
                }
            )
            
            if existing_user:
                if existing_user.email == user_data.email:
                    raise ConflictException("Email already registered")
                if existing_user.phone_number == user_data.phone_number:
                    raise ConflictException("Phone number already registered")
            
            # Create user
            user = await self.db.user.create(
                data={
                    "email": user_data.email,
                    "phone_number": user_data.phone_number,
                    "full_name": user_data.full_name,
                    "aadhaar_number": user_data.aadhaar_number,
                    "date_of_birth": user_data.date_of_birth,
                    "gender": user_data.gender,
                    "category": user_data.category,
                    "address": user_data.address,
                    "district": user_data.district,
                    "state": user_data.state,
                    "pincode": user_data.pincode,
                    "profile_image": user_data.profile_image,
                    "role": UserRole.PUBLIC,
                    "is_active": True,
                    "is_verified": False
                }
            )
            
            logger.info("User registered successfully", user_id=user.id)
            return user
            
        except ConflictException:
            raise
        except Exception as e:
            logger.error("User registration failed", error=str(e))
            raise AuthenticationException("Registration failed")
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            user = await self.db.user.find_unique(where={"id": user_id})
            return user
        except Exception as e:
            logger.error("Failed to get user by ID", user_id=user_id, error=str(e))
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            user = await self.db.user.find_unique(where={"email": email})
            return user
        except Exception as e:
            logger.error("Failed to get user by email", email=email, error=str(e))
            return None
    
    async def get_user_by_phone(self, phone_number: str) -> Optional[User]:
        """Get user by phone number"""
        try:
            user = await self.db.user.find_unique(where={"phone_number": phone_number})
            return user
        except Exception as e:
            logger.error("Failed to get user by phone", phone=phone_number, error=str(e))
            return None
    
    async def get_user_by_phone_or_email(self, identifier: str) -> Optional[User]:
        """Get user by phone number or email"""
        try:
            # Normalize phone number for search
            phone_variants = []
            if identifier and identifier.replace("+", "").replace(" ", "").replace("-", "").isdigit():
                # It's a phone number, create variants
                cleaned = identifier.replace("+", "").replace(" ", "").replace("-", "")
                if len(cleaned) == 10:
                    # 10 digit number, add +91 prefix
                    phone_variants = [identifier, f"+91{cleaned}", cleaned]
                elif len(cleaned) == 12 and cleaned.startswith("91"):
                    # 12 digit number starting with 91
                    phone_variants = [identifier, f"+{cleaned}", cleaned[2:]]
                else:
                    phone_variants = [identifier]
            
            # Build search conditions
            search_conditions = [{"email": identifier}]
            for phone in phone_variants:
                search_conditions.append({"phone_number": phone})
            
            user = await self.db.user.find_first(
                where={
                    "OR": search_conditions
                }
            )
            return user
        except Exception as e:
            logger.error("Failed to get user by identifier", identifier=identifier, error=str(e))
            return None
    
    async def update_user(self, user_id: str, update_data: dict) -> Optional[User]:
        """Update user information"""
        try:
            user = await self.db.user.update(
                where={"id": user_id},
                data=update_data
            )
            logger.info("User updated successfully", user_id=user_id)
            return user
        except Exception as e:
            logger.error("Failed to update user", user_id=user_id, error=str(e))
            return None
    
    async def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        try:
            await self.db.user.update(
                where={"id": user_id},
                data={"is_active": False}
            )
            logger.info("User deactivated", user_id=user_id)
            return True
        except Exception as e:
            logger.error("Failed to deactivate user", user_id=user_id, error=str(e))
            return False
    
    async def verify_user(self, user_id: str) -> bool:
        """Verify user account"""
        try:
            await self.db.user.update(
                where={"id": user_id},
                data={"is_verified": True}
            )
            logger.info("User verified", user_id=user_id)
            return True
        except Exception as e:
            logger.error("Failed to verify user", user_id=user_id, error=str(e))
            return False
    
    async def update_last_login(self, user_id: str) -> bool:
        """Update user's last login time"""
        try:
            await self.db.user.update(
                where={"id": user_id},
                data={"last_login": datetime.utcnow()}
            )
            return True
        except Exception as e:
            logger.error("Failed to update last login", user_id=user_id, error=str(e))
            return False
