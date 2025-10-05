"""
OTP service for handling OTP generation and verification
"""

from datetime import datetime, timedelta
from typing import Optional
import structlog

from app.core.database import Prisma
from app.core.config import settings
from app.core.exceptions import AuthenticationException, ValidationException
from app.core.security import generate_otp, verify_otp

logger = structlog.get_logger()


class OTPService:
    """OTP service for handling OTP operations"""
    
    def __init__(self, db: Prisma):
        self.db = db
    
    async def create_otp(
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
            await self.db.otp.create(
                data={
                    "phone_number": phone_number,
                    "email": email,
                    "otp_code": otp_code,
                    "purpose": purpose,
                    "expires_at": expires_at,
                    "is_used": False
                }
            )
            
            logger.info("OTP created successfully", phone=phone_number, purpose=purpose)
            return otp_code
            
        except Exception as e:
            logger.error("Failed to create OTP", error=str(e))
            raise AuthenticationException("Failed to create OTP")
    
    async def verify_otp(
        self, 
        phone_number: str, 
        otp_code: str,
        email: Optional[str] = None,
        purpose: str = "LOGIN"
    ) -> bool:
        """Verify OTP"""
        try:
            # Find valid OTP
            otp_record = await self.db.otp.find_first(
                where={
                    "phone_number": phone_number,
                    "email": email,
                    "otp_code": otp_code,
                    "purpose": purpose,
                    "is_used": False,
                    "expires_at": {"gt": datetime.utcnow()}
                },
                order_by={"created_at": "desc"}
            )
            
            if not otp_record:
                logger.warning("Invalid or expired OTP", phone=phone_number, purpose=purpose)
                return False
            
            # Mark OTP as used
            await self.db.otp.update(
                where={"id": otp_record.id},
                data={"is_used": True}
            )
            
            logger.info("OTP verified successfully", phone=phone_number, purpose=purpose)
            return True
            
        except Exception as e:
            logger.error("Failed to verify OTP", error=str(e))
            return False
    
    async def resend_otp(
        self, 
        phone_number: str, 
        email: Optional[str] = None,
        purpose: str = "LOGIN"
    ) -> str:
        """Resend OTP"""
        try:
            # Invalidate existing OTPs
            await self.db.otp.update_many(
                where={
                    "phone_number": phone_number,
                    "email": email,
                    "purpose": purpose,
                    "is_used": False
                },
                data={"is_used": True}
            )
            
            # Create new OTP
            return await self.create_otp(phone_number, email, purpose=purpose)
            
        except Exception as e:
            logger.error("Failed to resend OTP", error=str(e))
            raise AuthenticationException("Failed to resend OTP")
    
    async def cleanup_expired_otps(self) -> int:
        """Clean up expired OTPs"""
        try:
            result = await self.db.otp.delete_many(
                where={
                    "OR": [
                        {"expires_at": {"lt": datetime.utcnow()}},
                        {"is_used": True}
                    ]
                }
            )
            
            logger.info("Cleaned up expired OTPs", count=result.count)
            return result.count
            
        except Exception as e:
            logger.error("Failed to cleanup expired OTPs", error=str(e))
            return 0
    
    async def get_otp_attempts(self, phone_number: str, purpose: str) -> int:
        """Get number of OTP attempts in the last hour"""
        try:
            one_hour_ago = datetime.utcnow() - timedelta(hours=1)
            
            attempts = await self.db.otp.count(
                where={
                    "phone_number": phone_number,
                    "purpose": purpose,
                    "created_at": {"gt": one_hour_ago}
                }
            )
            
            return attempts
            
        except Exception as e:
            logger.error("Failed to get OTP attempts", error=str(e))
            return 0
    
    async def is_otp_rate_limited(self, phone_number: str, purpose: str) -> bool:
        """Check if OTP requests are rate limited"""
        try:
            attempts = await self.get_otp_attempts(phone_number, purpose)
            return attempts >= 5  # Max 5 attempts per hour
            
        except Exception as e:
            logger.error("Failed to check OTP rate limit", error=str(e))
            return True
