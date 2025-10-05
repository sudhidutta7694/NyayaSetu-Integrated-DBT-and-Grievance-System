"""
Authentication service
"""

from datetime import datetime
from typing import Optional
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.exceptions import AuthenticationException, ConflictException
from app.models.user import UserCreate
from models.user import User, UserRole
from app.core.security import generate_application_number

logger = structlog.get_logger()


class AuthService:
    """Authentication service"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def register_user(self, user_data: UserCreate) -> User:
        """Register a new user"""
        try:
            # Check if user already exists
            existing_user = self.db.query(User).filter(
                or_(
                    User.email == user_data.email,
                    User.phone_number == user_data.phone_number
                )
            ).first()
            
            if existing_user:
                if existing_user.email == user_data.email:
                    raise ConflictException("Email already registered")
                if existing_user.phone_number == user_data.phone_number:
                    raise ConflictException("Phone number already registered")
            
            # Create user
            user = User(
                email=user_data.email,
                phone_number=user_data.phone_number,
                full_name=user_data.full_name,
                aadhaar_number=user_data.aadhaar_number,
                date_of_birth=user_data.date_of_birth,
                gender=user_data.gender,
                category=user_data.category,
                address=user_data.address,
                district=user_data.district,
                state=user_data.state,
                pincode=user_data.pincode,
                profile_image=user_data.profile_image,
                role=UserRole.PUBLIC,
                is_active=True,
                is_verified=False
            )
            self.db.add(user)
            self.db.commit()
            self.db.refresh(user)
            
            logger.info("User registered successfully", user_id=user.id)
            return user
            
        except ConflictException:
            raise
        except Exception as e:
            logger.error("User registration failed", error=str(e))
            raise AuthenticationException("Registration failed")
    
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
        """Update user information"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if user:
                for key, value in update_data.items():
                    setattr(user, key, value)
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
