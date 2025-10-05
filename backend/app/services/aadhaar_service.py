"""
Aadhaar service for handling Aadhaar verification (simulated)
"""

import httpx
import structlog
from typing import Dict, Any

from app.core.config import settings
from app.core.exceptions import ExternalServiceException

logger = structlog.get_logger()


class AadhaarService:
    """Aadhaar verification service (simulated)"""
    
    def __init__(self):
        self.api_url = settings.AADHAAR_API_URL
        self.api_key = settings.AADHAAR_API_KEY
    
    async def verify_aadhaar(self, aadhaar_number: str, otp: str) -> Dict[str, Any]:
        """Verify Aadhaar number with OTP (simulated)"""
        try:
            # In a real implementation, this would call the UIDAI API
            # For now, we'll simulate the response
            
            # Simulate API call delay
            import asyncio
            await asyncio.sleep(1)
            
            # Simulate verification logic
            if self._is_valid_aadhaar_format(aadhaar_number) and self._is_valid_otp(otp):
                return {
                    "verified": True,
                    "message": "Aadhaar verified successfully",
                    "user_details": {
                        "name": "John Doe",
                        "date_of_birth": "1990-01-01",
                        "gender": "MALE",
                        "address": "123 Main Street, City, State, 123456"
                    }
                }
            else:
                return {
                    "verified": False,
                    "message": "Invalid Aadhaar number or OTP"
                }
                
        except Exception as e:
            logger.error("Aadhaar verification failed", error=str(e))
            raise ExternalServiceException("Aadhaar verification service unavailable")
    
    async def send_aadhaar_otp(self, aadhaar_number: str) -> Dict[str, Any]:
        """Send OTP to Aadhaar registered mobile number (simulated)"""
        try:
            # In a real implementation, this would call the UIDAI API
            # For now, we'll simulate the response
            
            # Simulate API call delay
            import asyncio
            await asyncio.sleep(1)
            
            if self._is_valid_aadhaar_format(aadhaar_number):
                return {
                    "success": True,
                    "message": "OTP sent to registered mobile number",
                    "otp": "123456"  # In real implementation, this wouldn't be returned
                }
            else:
                return {
                    "success": False,
                    "message": "Invalid Aadhaar number"
                }
                
        except Exception as e:
            logger.error("Aadhaar OTP sending failed", error=str(e))
            raise ExternalServiceException("Aadhaar OTP service unavailable")
    
    def _is_valid_aadhaar_format(self, aadhaar_number: str) -> bool:
        """Validate Aadhaar number format"""
        # Remove spaces and check if it's 12 digits
        cleaned = aadhaar_number.replace(" ", "").replace("-", "")
        return cleaned.isdigit() and len(cleaned) == 12
    
    def _is_valid_otp(self, otp: str) -> bool:
        """Validate OTP format"""
        return otp.isdigit() and len(otp) == 6
    
    async def get_aadhaar_demographics(self, aadhaar_number: str, otp: str) -> Dict[str, Any]:
        """Get Aadhaar demographics (simulated)"""
        try:
            # Verify Aadhaar first
            verification_result = await self.verify_aadhaar(aadhaar_number, otp)
            
            if not verification_result["verified"]:
                return verification_result
            
            # Return simulated demographics
            return {
                "verified": True,
                "demographics": {
                    "name": "John Doe",
                    "date_of_birth": "1990-01-01",
                    "gender": "MALE",
                    "address": {
                        "street": "123 Main Street",
                        "city": "City",
                        "state": "State",
                        "pincode": "123456",
                        "country": "India"
                    },
                    "photo": "base64_encoded_photo_data"  # In real implementation
                }
            }
            
        except Exception as e:
            logger.error("Failed to get Aadhaar demographics", error=str(e))
            raise ExternalServiceException("Aadhaar demographics service unavailable")

