import structlog
from fastapi import APIRouter, Body
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import AuthenticationException, ValidationException
from app.core.security import (
    create_access_token,
    verify_token,
    generate_otp
)
from models.user import User as UserModel, UserRole
from app.schema.user import User

logger = structlog.get_logger()
router = APIRouter()


# Social Welfare Login Request
class SocialWelfareLoginRequest(BaseModel):
    email: EmailStr
    password: str

# Social Welfare Login Endpoint
@router.post("/social-welfare/login")
def social_welfare_login(
    data: SocialWelfareLoginRequest = Body(...),
    db: Session = Depends(get_db)
):
    from app.core.security import verify_password, create_access_token
    from models.user import User as UserModel, UserRole
    user = db.query(UserModel).filter(UserModel.email == data.email, UserModel.role == UserRole.SOCIAL_WELFARE).first()
    if not user or not hasattr(user, 'password_hash') or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    access_token = create_access_token({"sub": user.id, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}

# Social Welfare Register Request
class SocialWelfareRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str

@router.post("/social-welfare/register", response_model=User)
async def register_social_welfare(
    data: SocialWelfareRegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new social welfare user"""
    try:
        auth_service = AuthService(db)
        # Check if user already exists
        existing_user = db.query(UserModel).filter(UserModel.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        # Create user with SOCIAL_WELFARE role
        user = UserModel(
            email=data.email,
            full_name=data.full_name,
            phone_number=None,
            district=None,
            role=UserRole.SOCIAL_WELFARE,
            is_active=True,
            is_verified=True,
            is_onboarded=True,
            onboarding_step=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        # Set password (hashing should be handled in model or here if needed)
        if hasattr(user, 'set_password'):
            user.set_password(data.password)
        elif hasattr(user, 'password_hash'):
            from app.core.security import hash_password
            user.password_hash = hash_password(data.password)
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("Social welfare user registered", user_id=user.id)
        return user
    except Exception as e:
        logger.error("Social welfare registration failed", error=str(e))
        raise HTTPException(status_code=400, detail="Registration failed: " + str(e))

# District Authority Login Request
class DistrictAuthorityLoginRequest(BaseModel):
    email: EmailStr
    password: str

# District Authority Login Endpoint
@router.post("/district-authority/login")
def district_authority_login(
    data: DistrictAuthorityLoginRequest = Body(...),
    db: Session = Depends(get_db)
):
    from app.core.security import verify_password, create_access_token
    from models.user import User as UserModel, UserRole
    user = db.query(UserModel).filter(UserModel.email == data.email, UserModel.role == UserRole.DISTRICT_AUTHORITY).first()
    if not user or not hasattr(user, 'password_hash') or not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is deactivated")
    access_token = create_access_token({"sub": user.id, "role": user.role.value})
    return {"access_token": access_token, "token_type": "bearer"}

"""
Authentication endpoints
"""

class DistrictAuthorityRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    district: str

@router.post("/district-authority/register", response_model=User)
async def register_district_authority(
    data: DistrictAuthorityRegisterRequest,
    db: Session = Depends(get_db)
):
    """Register a new district authority user"""
    try:
        auth_service = AuthService(db)
        # Check if user already exists
        existing_user = db.query(UserModel).filter(UserModel.email == data.email).first()
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        # Create user with DISTRICT_AUTHORITY role
        user = UserModel(
            email=data.email,
            full_name=data.full_name,
            phone_number=None,
            district=data.district,
            role=UserRole.DISTRICT_AUTHORITY,
            is_active=True,
            is_verified=True,
            is_onboarded=True,
            onboarding_step=0,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )
        # Set password (hashing should be handled in model or here if needed)
        if hasattr(user, 'set_password'):
            user.set_password(data.password)
        elif hasattr(user, 'password_hash'):
            from app.core.security import hash_password
            user.password_hash = hash_password(data.password)
        db.add(user)
        db.commit()
        db.refresh(user)
        logger.info("District authority registered", user_id=user.id)
        return user
    except Exception as e:
        logger.error("District authority registration failed", error=str(e))
        raise HTTPException(status_code=400, detail="Registration failed: " + str(e))
from app.services.auth_service import AuthService
from app.services.aadhaar_service import AadhaarService
from app.services.aadhaar_auth_service import AadhaarAuthService
from models.user import User as UserModel  # SQLAlchemy ORM model

security = HTTPBearer()


class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    expires_in: int
    user: User


class AadhaarLoginRequest(BaseModel):
    aadhaar_number: str


class AadhaarOTPVerify(BaseModel):
    aadhaar_number: str
    otp_code: str


class AadhaarLoginResponse(BaseModel):
    success: bool
    message: str
    phone_number: Optional[str] = None
    expires_in_minutes: Optional[int] = None
    aadhaar_info: Optional[dict] = None


class AadhaarOTPResponse(BaseModel):
    success: bool
    message: str
    user: Optional[dict] = None
    requires_onboarding: bool = False


@router.post("/aadhaar-verify")
async def verify_aadhaar(
    aadhaar_data: dict,
    db: Session = Depends(get_db)
):
    """Verify Aadhaar number (simulated)"""
    try:
        aadhaar_service = AadhaarService()
        result = await aadhaar_service.verify_aadhaar(
            aadhaar_number=aadhaar_data.get("aadhaar_number"),
            otp=aadhaar_data.get("otp")
        )
        
        return {
            "verified": result["verified"],
            "message": result["message"],
            "user_details": result.get("user_details")
        }
        
    except Exception as e:
        logger.error("Aadhaar verification failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Aadhaar verification failed"
        )


@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Refresh access token"""
    try:
        # Verify current token
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        
        if not user_id:
            raise AuthenticationException("Invalid token")
        
        # Get user
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user or not user.is_active:
            raise AuthenticationException("User not found or inactive")
        
        # Create new token
        access_token = create_access_token(
            data={"sub": user.id, "role": user.role.value}
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            user=user
        )
        
    except AuthenticationException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message
        )
    except Exception as e:
        logger.error("Token refresh failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Token refresh failed"
        )


@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Logout user (client-side token removal)"""
    # In a stateless JWT system, logout is handled client-side
    # You could implement token blacklisting here if needed
    return {"message": "Logged out successfully"}



# Use the correct SQLAlchemy User model for /me endpoint
from models.user import User as SAUserModel

@router.get("/me", response_model=User)
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current user information (works for all roles)"""
    try:
        payload = verify_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationException("Invalid token")
        user = db.query(SAUserModel).filter(SAUserModel.id == user_id).first()
        if not user:
            raise AuthenticationException("User not found")
        return user
    except AuthenticationException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=e.message
        )
    except Exception as e:
        logger.error("Get current user failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user information"
        )


@router.post("/aadhaar-login", response_model=AadhaarLoginResponse)
async def aadhaar_login(
    request: AadhaarLoginRequest,
    db: Session = Depends(get_db)
):
    """Login using Aadhaar number - sends OTP to registered mobile"""
    try:
        aadhaar_service = AadhaarAuthService(db)
        result = await aadhaar_service.send_aadhaar_otp(request.aadhaar_number)
        
        return AadhaarLoginResponse(
            success=result["success"],
            message=result["message"],
            phone_number=result.get("phone_number"),
            expires_in_minutes=result.get("expires_in_minutes"),
            aadhaar_info=result.get("aadhaar_info")
        )
        
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except AuthenticationException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Aadhaar login failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Login failed"
        )


@router.post("/aadhaar-verify-otp", response_model=AadhaarOTPResponse)
async def verify_aadhaar_otp(
    request: AadhaarOTPVerify
):
    """Verify OTP for Aadhaar login"""
    try:
        from app.core.database import get_db
        db = next(get_db())
        aadhaar_service = AadhaarAuthService(db)
        result = await aadhaar_service.verify_aadhaar_otp(
            request.aadhaar_number,
            request.otp_code
        )
        
        # Create JWT token for the user
        user_data = result["user"]
        access_token = create_access_token(
            data={"sub": user_data["id"], "role": "PUBLIC"}
        )
        
        return AadhaarOTPResponse(
            success=result["success"],
            message=result["message"],
            user={
                **user_data,
                "access_token": access_token,
                "token_type": "bearer"
            },
            requires_onboarding=result["requires_onboarding"]
        )
        
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except AuthenticationException as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Aadhaar OTP verification failed", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="OTP verification failed"
        )



