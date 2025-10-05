"""
Security utilities for authentication and authorization
"""

from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
import secrets
import string
import structlog

from app.core.config import settings
from app.core.exceptions import AuthenticationException

logger = structlog.get_logger()

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token"""
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES
        )
    
    to_encode.update({"exp": expire})
    
    try:
        encoded_jwt = jwt.encode(
            to_encode, 
            settings.JWT_SECRET_KEY, 
            algorithm=settings.JWT_ALGORITHM
        )
        return encoded_jwt
    except JWTError as e:
        logger.error("Token creation failed", error=str(e))
        raise AuthenticationException("Token creation failed")


def verify_token(token: str) -> dict:
    """Verify JWT token and return payload"""
    try:
        payload = jwt.decode(
            token, 
            settings.JWT_SECRET_KEY, 
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload
    except JWTError as e:
        logger.error("Token verification failed", error=str(e))
        raise AuthenticationException("Invalid token")


def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)


def generate_otp(length: int = 6) -> str:
    """Generate random OTP"""
    return ''.join(secrets.choice(string.digits) for _ in range(length))


def verify_otp(provided_otp: str, stored_otp: str) -> bool:
    """Verify OTP"""
    return provided_otp == stored_otp


def generate_secure_token(length: int = 32) -> str:
    """Generate secure random token"""
    alphabet = string.ascii_letters + string.digits
    return ''.join(secrets.choice(alphabet) for _ in range(length))


def validate_aadhaar_number(aadhaar: str) -> bool:
    """Validate Aadhaar number format"""
    # Remove spaces and check if it's 12 digits
    cleaned = aadhaar.replace(" ", "").replace("-", "")
    return cleaned.isdigit() and len(cleaned) == 12


def validate_phone_number(phone: str) -> bool:
    """Validate Indian phone number"""
    # Remove spaces and check if it starts with +91 or is 10 digits
    cleaned = phone.replace(" ", "").replace("-", "")
    if cleaned.startswith("+91"):
        cleaned = cleaned[3:]
    return cleaned.isdigit() and len(cleaned) == 10


def validate_pincode(pincode: str) -> bool:
    """Validate Indian pincode"""
    return pincode.isdigit() and len(pincode) == 6


def sanitize_input(input_string: str) -> str:
    """Sanitize user input"""
    if not input_string:
        return ""
    
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&', ';', '(', ')', '|', '`', '$']
    sanitized = input_string
    
    for char in dangerous_chars:
        sanitized = sanitized.replace(char, '')
    
    return sanitized.strip()


def mask_sensitive_data(data: str, visible_chars: int = 4) -> str:
    """Mask sensitive data like Aadhaar, phone numbers"""
    if not data or len(data) <= visible_chars:
        return "*" * len(data) if data else ""
    
    return data[:visible_chars] + "*" * (len(data) - visible_chars)


def check_password_strength(password: str) -> dict:
    """Check password strength"""
    result = {
        "is_strong": False,
        "score": 0,
        "feedback": []
    }
    
    if len(password) < 8:
        result["feedback"].append("Password should be at least 8 characters long")
    else:
        result["score"] += 1
    
    if not any(c.isupper() for c in password):
        result["feedback"].append("Password should contain at least one uppercase letter")
    else:
        result["score"] += 1
    
    if not any(c.islower() for c in password):
        result["feedback"].append("Password should contain at least one lowercase letter")
    else:
        result["score"] += 1
    
    if not any(c.isdigit() for c in password):
        result["feedback"].append("Password should contain at least one number")
    else:
        result["score"] += 1
    
    if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in password):
        result["feedback"].append("Password should contain at least one special character")
    else:
        result["score"] += 1
    
    result["is_strong"] = result["score"] >= 4
    
    return result


def generate_application_number() -> str:
    """Generate unique application number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = generate_secure_token(4).upper()
    return f"NS{timestamp}{random_suffix}"


def generate_case_number() -> str:
    """Generate unique case number"""
    timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
    random_suffix = generate_secure_token(4).upper()
    return f"CS{timestamp}{random_suffix}"