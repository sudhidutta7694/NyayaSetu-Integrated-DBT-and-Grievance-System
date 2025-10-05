"""
SMS service using Twilio for OTP delivery
"""

from typing import Optional
import structlog
from datetime import datetime
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

from app.core.config import settings
from app.core.exceptions import AuthenticationException

logger = structlog.get_logger()


class SMSService:
    """SMS service for sending OTP via Twilio"""
    
    def __init__(self):
        self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        self.from_number = settings.TWILIO_PHONE_NUMBER
        self.is_development = settings.ENVIRONMENT == "development"
    
    async def send_otp_sms(self, phone_number: str, otp_code: str, purpose: str = "LOGIN") -> bool:
        """Send OTP via SMS"""
        try:
            # Format phone number for Indian numbers
            if not phone_number.startswith("+91"):
                if phone_number.startswith("91"):
                    phone_number = f"+{phone_number}"
                else:
                    phone_number = f"+91{phone_number}"
            
            # Create SMS message
            message_body = f"Your NyayaSetu OTP for {purpose.lower()} is: {otp_code}. Valid for 5 minutes. Do not share with anyone."
            
            # In development mode, use mock SMS service
            if self.is_development:
                logger.info(
                    "DEVELOPMENT MODE: Mock SMS sent",
                    phone=phone_number,
                    otp_code=otp_code,
                    purpose=purpose,
                    message=message_body
                )
                print(f"\n🔔 DEVELOPMENT SMS NOTIFICATION:")
                print(f"📱 To: {phone_number}")
                print(f"📝 Message: {message_body}")
                print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
                print(f"🔑 OTP Code: {otp_code}")
                print("=" * 50)
                return True
            
            # Production mode - send actual SMS
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=phone_number
            )
            
            logger.info(
                "SMS sent successfully",
                phone=phone_number,
                message_sid=message.sid,
                purpose=purpose
            )
            
            return True
            
        except TwilioException as e:
            logger.error(
                "Failed to send SMS via Twilio",
                phone=phone_number,
                error=str(e),
                error_code=e.code if hasattr(e, 'code') else None
            )
            
            # In development, don't fail if Twilio is not properly configured
            if self.is_development:
                logger.warning("Development mode: SMS failed but continuing with mock")
                print(f"\n⚠️  DEVELOPMENT MODE: Twilio SMS failed, using mock:")
                print(f"📱 To: {phone_number}")
                print(f"🔑 OTP Code: {otp_code}")
                print(f"❌ Twilio Error: {str(e)}")
                print("=" * 50)
                return True
            
            raise AuthenticationException("Failed to send OTP via SMS")
        
        except Exception as e:
            logger.error(
                "Unexpected error sending SMS",
                phone=phone_number,
                error=str(e)
            )
            
            # In development, don't fail for unexpected errors
            if self.is_development:
                logger.warning("Development mode: SMS failed but continuing with mock")
                print(f"\n⚠️  DEVELOPMENT MODE: SMS failed, using mock:")
                print(f"📱 To: {phone_number}")
                print(f"🔑 OTP Code: {otp_code}")
                print(f"❌ Error: {str(e)}")
                print("=" * 50)
                return True
            
            raise AuthenticationException("Failed to send OTP")
    
    async def send_welcome_sms(self, phone_number: str, user_name: str) -> bool:
        """Send welcome SMS after successful registration"""
        try:
            # Format phone number
            if not phone_number.startswith("+91"):
                if phone_number.startswith("91"):
                    phone_number = f"+{phone_number}"
                else:
                    phone_number = f"+91{phone_number}"
            
            message_body = f"Welcome to NyayaSetu, {user_name}! Your account has been successfully created. You can now access government services and benefits."
            
            message = self.client.messages.create(
                body=message_body,
                from_=self.from_number,
                to=phone_number
            )
            
            logger.info(
                "Welcome SMS sent successfully",
                phone=phone_number,
                message_sid=message.sid
            )
            
            return True
            
        except Exception as e:
            logger.error(
                "Failed to send welcome SMS",
                phone=phone_number,
                error=str(e)
            )
            return False  # Don't raise exception for welcome SMS failure
    
    async def send_notification_sms(self, phone_number: str, message: str) -> bool:
        """Send general notification SMS"""
        try:
            # Format phone number
            if not phone_number.startswith("+91"):
                if phone_number.startswith("91"):
                    phone_number = f"+{phone_number}"
                else:
                    phone_number = f"+91{phone_number}"
            
            sms_message = self.client.messages.create(
                body=message,
                from_=self.from_number,
                to=phone_number
            )
            
            logger.info(
                "Notification SMS sent successfully",
                phone=phone_number,
                message_sid=sms_message.sid
            )
            
            return True
            
        except Exception as e:
            logger.error(
                "Failed to send notification SMS",
                phone=phone_number,
                error=str(e)
            )
            return False
