"""
Authentication service
"""

from datetime import datetime
from typing import Optional
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.exceptions import AuthenticationException, ConflictException
from app.schema.user import User, UserRole
from app.core.security import generate_application_number

logger = structlog.get_logger()


class AuthService:
    """Authentication service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            return user
        except Exception as e:
            logger.error("Failed to get user by ID", user_id=user_id, error=str(e))
            return None
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        try:
            user = self.db.query(User).filter(User.email == email).first()
            return user
        except Exception as e:
            logger.error("Failed to get user by email", email=email, error=str(e))
            return None
    
    def get_user_by_phone(self, phone_number: str) -> Optional[User]:
        """Get user by phone number"""
        try:
            user = self.db.query(User).filter(User.phone_number == phone_number).first()
            return user
        except Exception as e:
            logger.error("Failed to get user by phone", phone=phone_number, error=str(e))
            return None
    
    def get_user_by_aadhaar(self, aadhaar_number: str) -> Optional[User]:
        """Get user by Aadhaar number"""
        try:
            user = self.db.query(User).filter(User.aadhaar_number == aadhaar_number).first()
            return user
        except Exception as e:
            logger.error("Failed to get user by Aadhaar", aadhaar=aadhaar_number, error=str(e))
            return None
    
    def get_user_by_phone_or_email(self, identifier: str) -> Optional[User]:
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
            
            # Build SQLAlchemy OR conditions
            conditions = []
            conditions.append(User.email == identifier)
            for phone in phone_variants:
                conditions.append(User.phone_number == phone)
            
            user = self.db.query(User).filter(or_(*conditions)).first()
            return user
        except Exception as e:
            logger.error("Failed to get user by identifier", identifier=identifier, error=str(e))
            return None
    
    def update_user(self, user_id: str, update_data: dict) -> Optional[User]:
        try:
            # Protected UIDAI fields that should not be updated
            protected_fields = {
                'full_name', 'father_name', 'date_of_birth', 'age',
                'gender', 'address', 'phone_number', 'aadhaar_number'
            }
            
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                # Filter out protected fields
                for key, value in update_data.items():
                    if key not in protected_fields:
                        setattr(user, key, value)
                    else:
                        logger.warning(
                            "Attempted to update protected UIDAI field",
                            user_id=user_id,
                            field=key
                        )
                self.db.commit()
                self.db.refresh(user)
            logger.info("User updated successfully", user_id=user_id)
            return user
        except Exception as e:
            logger.error("Failed to update user", user_id=user_id, error=str(e))
            return None
    
    def deactivate_user(self, user_id: str) -> bool:
        """Deactivate user account"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                user.is_active = False
                self.db.commit()
            logger.info("User deactivated", user_id=user_id)
            return True
        except Exception as e:
            logger.error("Failed to deactivate user", user_id=user_id, error=str(e))
            return False
    
    def verify_user(self, user_id: str) -> bool:
        """Verify user account"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                user.is_verified = True
                self.db.commit()
            logger.info("User verified", user_id=user_id)
            return True
        except Exception as e:
            logger.error("Failed to verify user", user_id=user_id, error=str(e))
            return False
    
    def update_last_login(self, user_id: str) -> bool:
        """Update user's last login time"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                user.last_login = datetime.utcnow()
                self.db.commit()
            return True
        except Exception as e:
            logger.error("Failed to update last login", user_id=user_id, error=str(e))
            return False
