"""
Twilio Verify Service for OTP delivery
"""

from typing import Optional, Dict, Any
import structlog
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

from app.core.config import settings
from app.core.exceptions import SMSException

logger = structlog.get_logger()


class TwilioVerifyService:
    """Service for sending and verifying OTPs using Twilio Verify"""
    
    def __init__(self):
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self.verify_service_sid = settings.TWILIO_VERIFY_SERVICE_SID
        self.is_development = settings.ENVIRONMENT == "development"
    
    async def send_verification(self, phone_number: str, channel: str = "sms") -> Dict[str, Any]:
        """Send verification code via Twilio Verify"""
        try:
            # Format phone number for Indian numbers
            if not phone_number.startswith("+91"):
                if phone_number.startswith("91"):
                    phone_number = f"+{phone_number}"
                else:
                    phone_number = f"+91{phone_number}"
            
            # In development mode, log the OTP instead of sending
            if self.is_development:
                logger.info(
                    "DEVELOPMENT MODE: Mock Twilio Verify code sent",
                    phone_number=phone_number,
                    channel=channel,
                    service_sid=self.verify_service_sid
                )
                # Simulate a successful response
                return {
                    "success": True,
                    "message": "Mock verification code sent (development mode)",
                    "verification_sid": "VE_MOCK_SID_DEV",
                    "status": "pending"
                }
            
            logger.info(
                "Sending Twilio Verify code",
                phone_number=phone_number,
                channel=channel,
                service_sid=self.verify_service_sid
            )
            
            # Send verification code using Twilio Verify
            verification = self.client.verify.v2.services(
                self.verify_service_sid
            ).verifications.create(
                to=phone_number,
                channel=channel
            )
            
            logger.info(
                "Twilio Verify code sent successfully",
                phone_number=phone_number,
                verification_sid=verification.sid,
                status=verification.status
            )
            
            return {
                "success": True,
                "verification_sid": verification.sid,
                "status": verification.status,
                "phone_number": phone_number,
                "message": "Verification code sent successfully"
            }
            
        except TwilioException as e:
            logger.error(
                "Failed to send Twilio Verify code",
                phone_number=phone_number,
                error=str(e),
                error_code=e.code if hasattr(e, 'code') else None
            )
            raise SMSException(f"Failed to send verification code: {str(e)}")
        
        except Exception as e:
            logger.error(
                "Unexpected error sending verification code",
                phone_number=phone_number,
                error=str(e)
            )
            raise SMSException("Failed to send verification code")
    
    async def verify_code(self, phone_number: str, code: str) -> Dict[str, Any]:
        """Verify the code using Twilio Verify"""
        try:
            # Format phone number for Indian numbers
            if not phone_number.startswith("+91"):
                if phone_number.startswith("91"):
                    phone_number = f"+{phone_number}"
                else:
                    phone_number = f"+91{phone_number}"
            
            # In development mode, assume OTP is valid if it's "123456"
            if self.is_development:
                is_valid = code == "123456"  # For testing, use a fixed OTP
                logger.info(
                    "DEVELOPMENT MODE: Mock Twilio Verify code verification",
                    phone_number=phone_number,
                    code=code,
                    is_valid=is_valid
                )
                return {
                    "success": True,
                    "valid": is_valid,
                    "message": "Mock verification (development mode)",
                    "verification_sid": "VE_MOCK_SID_DEV",
                    "status": "approved" if is_valid else "pending"
                }
            
            logger.info(
                "Verifying Twilio Verify code",
                phone_number=phone_number,
                code=code,
                service_sid=self.verify_service_sid
            )
            
            # Verify the code using Twilio Verify
            verification_check = self.client.verify.v2.services(
                self.verify_service_sid
            ).verification_checks.create(
                to=phone_number,
                code=code
            )
            
            logger.info(
                "Twilio Verify code verification completed",
                phone_number=phone_number,
                verification_sid=verification_check.sid,
                status=verification_check.status,
                valid=verification_check.valid
            )
            
            return {
                "success": verification_check.valid,
                "verification_sid": verification_check.sid,
                "status": verification_check.status,
                "valid": verification_check.valid,
                "phone_number": phone_number,
                "message": "Code verified successfully" if verification_check.valid else "Invalid verification code"
            }
            
        except TwilioException as e:
            logger.error(
                "Failed to verify Twilio Verify code",
                phone_number=phone_number,
                error=str(e),
                error_code=e.code if hasattr(e, 'code') else None
            )
            raise SMSException(f"Failed to verify code: {str(e)}")
        
        except Exception as e:
            logger.error(
                "Unexpected error verifying code",
                phone_number=phone_number,
                error=str(e)
            )
            raise SMSException("Failed to verify code")
