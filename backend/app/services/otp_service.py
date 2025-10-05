"""
OTP service for handling OTP generation and verification
"""

from datetime import datetime, timedelta
from typing import Optional
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.config import settings
from app.core.exceptions import AuthenticationException, ValidationException
from app.core.security import generate_otp, verify_otp
from models.otp import OTP

logger = structlog.get_logger()


class OTPService:
    """OTP service for handling OTP operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_otp(
        self, 
        phone_number: str, 
        email: Optional[str] = None,
        otp_code: Optional[str] = None,
        purpose: str = "LOGIN"
    ) -> str:
        """Create and store OTP"""
        try:
            # Generate OTP if not provided
            if not otp_code:
                otp_code = generate_otp(settings.OTP_LENGTH)
            
            # Calculate expiry time
            expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
            
            # Store OTP in database
            otp_record = OTP(
                phone_number=phone_number,
                email=email,
                otp_code=otp_code,
                purpose=purpose,
                expires_at=expires_at,
                is_used=False
            )
            self.db.add(otp_record)
            self.db.commit()
            
            logger.info("OTP created successfully", phone=phone_number, purpose=purpose)
            return otp_code
            
        except Exception as e:
            logger.error("Failed to create OTP", error=str(e))
            raise AuthenticationException("Failed to create OTP")
    
    def verify_otp(
        self, 
        phone_number: str, 
        otp_code: str,
        email: Optional[str] = None,
        purpose: str = "LOGIN"
    ) -> bool:
        """Verify OTP"""
        try:
            # Build filter conditions
            conditions = [
                OTP.otp_code == otp_code,
                OTP.purpose == purpose,
                OTP.is_used == False,
                OTP.expires_at > datetime.utcnow()
            ]
            
            # Add phone or email condition
            if phone_number:
                conditions.append(OTP.phone_number == phone_number)
            if email:
                conditions.append(OTP.email == email)
            
            # Find valid OTP
            otp_record = self.db.query(OTP).filter(*conditions).order_by(OTP.created_at.desc()).first()
            
            if not otp_record:
                logger.warning("Invalid or expired OTP", phone=phone_number, purpose=purpose)
                return False
            
            # Mark OTP as used
            otp_record.is_used = True
            self.db.commit()
            
            logger.info("OTP verified successfully", phone=phone_number, purpose=purpose)
            return True
            
        except Exception as e:
            logger.error("Failed to verify OTP", error=str(e))
            return False
    
    def resend_otp(
        self, 
        phone_number: str, 
        email: Optional[str] = None,
        purpose: str = "LOGIN"
    ) -> str:
        """Resend OTP"""
        try:
            # Invalidate existing OTPs
            existing_otps = self.db.query(OTP).filter(
                OTP.phone_number == phone_number,
                OTP.email == email,
                OTP.purpose == purpose,
                OTP.is_used == False
            ).all()
            for otp in existing_otps:
                otp.is_used = True
            self.db.commit()
            
            # Create new OTP
            return self.create_otp(phone_number, email, purpose=purpose)
            
        except Exception as e:
            logger.error("Failed to resend OTP", error=str(e))
            raise AuthenticationException("Failed to resend OTP")
    
    def cleanup_expired_otps(self) -> int:
        """Clean up expired OTPs"""
        try:
            expired_otps = self.db.query(OTP).filter(
                or_(
                    OTP.expires_at < datetime.utcnow(),
                    OTP.is_used == True
                )
            ).all()
            
            count = len(expired_otps)
            for otp in expired_otps:
                self.db.delete(otp)
            self.db.commit()
            
            logger.info("Cleaned up expired OTPs", count=count)
            return count
            
        except Exception as e:
            logger.error("Failed to cleanup expired OTPs", error=str(e))
            return 0
    
    def get_otp_attempts(self, phone_number: str, purpose: str) -> int:
        """Get number of OTP attempts in the last hour"""
        try:
            one_hour_ago = datetime.utcnow() - timedelta(hours=1)
            
            attempts = self.db.query(OTP).filter(
                OTP.phone_number == phone_number,
                OTP.purpose == purpose,
                OTP.created_at > one_hour_ago
            ).count()
            
            return attempts
            
        except Exception as e:
            logger.error("Failed to get OTP attempts", error=str(e))
            return 0
    
    def is_otp_rate_limited(self, phone_number: str, purpose: str) -> bool:
        """Check if OTP requests are rate limited"""
        try:
            attempts = self.get_otp_attempts(phone_number, purpose)
            return attempts >= 5  # Max 5 attempts per hour
            
        except Exception as e:
            logger.error("Failed to check OTP rate limit", error=str(e))
            return True
