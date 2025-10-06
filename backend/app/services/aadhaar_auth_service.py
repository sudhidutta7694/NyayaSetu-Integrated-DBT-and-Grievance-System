"""
Aadhaar-based authentication service
"""

import json
from datetime import datetime, timedelta, timezone, date
from typing import Optional, Dict, Any
import structlog
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.config import settings
from app.core.exceptions import AuthenticationException, ValidationException
from app.core.security import validate_aadhaar_number, generate_otp
from app.services.twilio_verify_service import TwilioVerifyService
from app.models.user import User
from models.user import User as UserModel
from models.otp import OTP

logger = structlog.get_logger()


class AadhaarAuthService:
    """Aadhaar-based authentication service"""
    
    def __init__(self, db: Session):
        self.db = db
        self.twilio_verify = TwilioVerifyService()
        
        # Dummy Aadhaar data for development
        self.dummy_aadhaar_data = {
            "362851176122": {
                "name": "राम कुमार शर्मा",
                "father_name": "रामेश्वर शर्मा",
                "mother_name": "सीता देवी",
                "date_of_birth": "1985-06-15",
                "gender": "MALE",
                "address": "123, गांधी नगर, नई दिल्ली - 110001",
                "phone_number": "+918637310611",
                "is_verified": True
            }
        }
    
    async def verify_aadhaar_number(self, aadhaar_number: str) -> Dict[str, Any]:
        """Verify Aadhaar number and return associated data"""
        try:
            # Validate Aadhaar format
            if not validate_aadhaar_number(aadhaar_number):
                raise ValidationException("Invalid Aadhaar number format")
            
            # Clean Aadhaar number
            cleaned_aadhaar = aadhaar_number.replace(" ", "").replace("-", "")
            
            # Check if Aadhaar exists in dummy data
            if cleaned_aadhaar in self.dummy_aadhaar_data:
                aadhaar_info = self.dummy_aadhaar_data[cleaned_aadhaar]
                
                logger.info(
                    "Aadhaar verification successful",
                    aadhaar_number=cleaned_aadhaar,
                    name=aadhaar_info["name"]
                )
                
                return {
                    "is_valid": True,
                    "aadhaar_number": cleaned_aadhaar,
                    "name": aadhaar_info["name"],
                    "father_name": aadhaar_info["father_name"],
                    "mother_name": aadhaar_info["mother_name"],
                    "date_of_birth": aadhaar_info["date_of_birth"],
                    "gender": aadhaar_info["gender"],
                    "address": aadhaar_info["address"],
                    "phone_number": aadhaar_info["phone_number"],
                    "is_verified": aadhaar_info["is_verified"]
                }
            else:
                logger.warning(
                    "Aadhaar number not found",
                    aadhaar_number=cleaned_aadhaar
                )
                
                return {
                    "is_valid": False,
                    "message": "Aadhaar number not found in our records"
                }
                
        except ValidationException:
            raise
        except Exception as e:
            logger.error(
                "Aadhaar verification failed",
                aadhaar_number=aadhaar_number,
                error=str(e)
            )
            raise AuthenticationException("Aadhaar verification failed")
    
    async def send_aadhaar_otp(self, aadhaar_number: str) -> Dict[str, Any]:
        """Send OTP to the phone number associated with Aadhaar"""
        try:
            # Verify Aadhaar first
            aadhaar_info = await self.verify_aadhaar_number(aadhaar_number)
            
            if not aadhaar_info["is_valid"]:
                raise ValidationException("Invalid Aadhaar number")
            
            phone_number = aadhaar_info["phone_number"]
            
            # Generate OTP (use fixed OTP in development mode)
            if settings.ENVIRONMENT == "development":
                otp_code = "123456"  # Fixed OTP for development
            else:
                otp_code = generate_otp(settings.OTP_LENGTH)
            
            # Calculate expiry time
            expires_at = datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)
            
            # Store OTP in database
            otp_record = OTP(
                phone_number=phone_number,
                email=None,
                otp_code=otp_code,
                purpose="AADHAAR_LOGIN",
                expires_at=expires_at,
                is_used=False,
                extra_data=json.dumps({
                    "aadhaar_number": aadhaar_number,
                    "name": aadhaar_info["name"]
                })
            )
            self.db.add(otp_record)
            self.db.commit()
            
            # Send OTP via Twilio Verify
            logger.info(
                "Sending OTP via Twilio Verify for Aadhaar login",
                aadhaar_number=aadhaar_number,
                phone_number=phone_number
            )
            
            # Send verification code via Twilio Verify
            try:
                verify_result = await self.twilio_verify.send_verification(
                    phone_number=phone_number,
                    channel="sms"
                )
                logger.info("Twilio Verify code sent successfully", 
                           phone_number=phone_number, 
                           verification_sid=verify_result["verification_sid"])
            except Exception as verify_error:
                logger.error("Failed to send Twilio Verify code", error=str(verify_error))
                # Don't fail the entire process if Verify fails, just log it
            
            logger.info(
                "Aadhaar OTP sent successfully",
                aadhaar_number=aadhaar_number,
                phone_number=phone_number,
                name=aadhaar_info["name"]
            )
            
            return {
                "success": True,
                "message": "OTP sent successfully to registered mobile number",
                "phone_number": phone_number[-4:].rjust(len(phone_number), "*"),  # Masked phone
                "expires_in_minutes": settings.OTP_EXPIRE_MINUTES,
                "aadhaar_info": {
                    "name": aadhaar_info["name"],
                    "father_name": aadhaar_info["father_name"]
                }
            }
            
        except ValidationException:
            raise
        except Exception as e:
            logger.error(
                "Failed to send Aadhaar OTP",
                aadhaar_number=aadhaar_number,
                error=str(e)
            )
            raise AuthenticationException("Failed to send OTP")
    
    async def verify_aadhaar_otp(self, aadhaar_number: str, otp_code: str) -> Dict[str, Any]:
        """Verify OTP for Aadhaar login"""
        try:
            logger.info("Starting Aadhaar OTP verification", aadhaar_number=aadhaar_number, otp_code=otp_code)
            # Verify Aadhaar first
            aadhaar_info = await self.verify_aadhaar_number(aadhaar_number)
            
            if not aadhaar_info["is_valid"]:
                raise ValidationException("Invalid Aadhaar number")
            
            phone_number = aadhaar_info["phone_number"]
            
            # Verify OTP using Twilio Verify
            logger.info(
                "Verifying OTP via Twilio Verify",
                aadhaar_number=aadhaar_number,
                phone_number=phone_number
            )
            
            try:
                verify_result = await self.twilio_verify.verify_code(
                    phone_number=phone_number,
                    code=otp_code
                )
                
                if not verify_result["valid"]:
                    logger.warning(
                        "Invalid OTP via Twilio Verify",
                        aadhaar_number=aadhaar_number,
                        phone_number=phone_number,
                        status=verify_result["status"]
                    )
                    raise ValidationException("Invalid or expired OTP")
                
                logger.info("OTP verified successfully via Twilio Verify", 
                           phone_number=phone_number,
                           verification_sid=verify_result["verification_sid"])
                
            except Exception as verify_error:
                logger.error("Failed to verify OTP via Twilio Verify", error=str(verify_error))
                raise ValidationException("OTP verification failed")
            
            # Check if user exists, if not create one
            user = self.db.query(UserModel).filter(
                or_(
                    UserModel.aadhaar_number == aadhaar_number,
                    UserModel.phone_number == phone_number
                )
            ).first()
            
            if not user:
                # Create new user from Aadhaar data
                logger.info("Creating new user from Aadhaar data", aadhaar_number=aadhaar_number)
                user_data = {
                    "email": f"{aadhaar_number}@nyayasetu.gov.in",  # Temporary email
                    "phone_number": phone_number,
                    "full_name": aadhaar_info["name"],
                    "aadhaar_number": aadhaar_number,
                    "date_of_birth": datetime.fromisoformat(aadhaar_info["date_of_birth"]),
                    "gender": aadhaar_info["gender"],
                    "address": aadhaar_info["address"],
                    "role": "PUBLIC",
                    "is_active": True,
                    "is_verified": True,
                        "last_login": datetime.now(timezone.utc)
                }
                logger.info("User data prepared", user_data=user_data)
                user = UserModel(**user_data)
                self.db.add(user)
                self.db.commit()
                self.db.refresh(user)
                
                logger.info(
                    "New user created from Aadhaar",
                    user_id=user.id,
                    aadhaar_number=aadhaar_number,
                    name=aadhaar_info["name"]
                )
            else:
                # Update last login
                user.last_login = datetime.now(timezone.utc)
                self.db.commit()
                
                logger.info(
                    "Existing user logged in via Aadhaar",
                    user_id=user.id,
                    aadhaar_number=aadhaar_number
                )
            
            logger.info(
                "Aadhaar OTP verification successful",
                aadhaar_number=aadhaar_number,
                user_id=user.id
            )
            
            return {
                "success": True,
                "message": "OTP verified successfully",
                "user": {
                    "id": user.id,
                    "name": user.full_name,
                    "aadhaar_number": user.aadhaar_number,
                    "phone_number": user.phone_number,
                    "is_new_user": self._is_new_user(user)
                },
                "requires_onboarding": not user.is_onboarded or user.onboarding_step < 4
            }
            
        except ValidationException:
            raise
        except Exception as e:
            logger.error(
                "Aadhaar OTP verification failed",
                aadhaar_number=aadhaar_number,
                error=str(e)
            )
            raise AuthenticationException("OTP verification failed")
    
    def _is_new_user(self, user) -> bool:
        """Check if user was created recently, handling timezone comparison safely"""
        try:
            current_time = datetime.now(timezone.utc)
            if user.created_at.tzinfo is None:
                # If created_at is timezone-naive, make current_time naive too
                current_time = datetime.now()
            
            return user.created_at > current_time - timedelta(minutes=1)
        except Exception:
            # If any error in comparison, assume not new user
            return False
