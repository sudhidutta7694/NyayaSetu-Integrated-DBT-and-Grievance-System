from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_token
from app.core.exceptions import AuthenticationException, AuthorizationException

# Import BOTH: Pydantic schema for API responses AND SQLAlchemy model for DB queries
from app.schema.user import User as UserSchema  # Pydantic schema for response
from models.user import User as UserModel  # SQLAlchemy ORM model for DB queries

import structlog

logger = structlog.get_logger()

# Security scheme
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> UserSchema:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        logger.info("Authenticating user", token_prefix=token[:20] if token else "NO_TOKEN")
        
        payload = verify_token(token)  # Only pass token, not "access"
        logger.info("Token verified", payload=payload)
        
        # Handle mock tokens for demo/testing
        if payload.get("is_mock"):
            logger.info("Mock token detected, creating mock user", payload=payload)
            from app.schema.user import UserRole, Gender
            from datetime import datetime
            
            role_str = payload.get("role", "DISTRICT_AUTHORITY")
            logger.info("Creating mock user with role", role_str=role_str)
            
            # Ensure role_str matches enum exactly
            try:
                user_role = UserRole[role_str] if hasattr(UserRole, role_str) else UserRole.DISTRICT_AUTHORITY
            except KeyError:
                logger.warning("Invalid role in mock token, using DISTRICT_AUTHORITY", role_str=role_str)
                user_role = UserRole.DISTRICT_AUTHORITY
            
            mock_user_data = {
                "id": payload.get("sub"),
                "email": f"{role_str.lower()}@demo.com",
                "full_name": f"Demo {role_str.replace('_', ' ').title()}",
                "phone_number": "9999999999",
                "aadhaar_number": "999999999999",
                "date_of_birth": datetime(1990, 1, 1),
                "age": 34,
                "gender": Gender.MALE,
                "address": "Demo Address",
                "district": "Demo District",
                "state": "Demo State",
                "pincode": "000000",
                "role": user_role,
                "is_active": True,
                "is_verified": True,
                "is_onboarded": True,
                "onboarding_step": 4,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow(),
            }
            logger.info("Mock user created successfully", user_id=mock_user_data["id"], role=user_role)
            return UserSchema(**mock_user_data)
        
        user_id = payload.get("sub")
        
        if user_id is None:
            logger.error("Token missing user_id (sub)")
            raise AuthenticationException("Invalid or expired token")
        
        logger.info("Looking up user", user_id=user_id)
        
        # Use SQLAlchemy ORM model for database query
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        
        if user is None:
            logger.error("User not found in database", user_id=user_id)
            raise AuthenticationException("User not found")
        
        if not user.is_active:
            logger.error("User account is inactive", user_id=user_id)
            raise AuthenticationException("User account is not active")
        
        logger.info("User authenticated successfully", user_id=user.id, role=user.role)
        
        # Convert ORM model to Pydantic schema for API response
        return UserSchema.from_orm(user)
        
    except AuthenticationException:
        # Re-raise our custom auth exceptions
        raise
    except Exception as e:
        logger.error("Authentication failed with exception", error=str(e), error_type=type(e).__name__)
        raise AuthenticationException(f"Authentication failed: {str(e)}")

def get_current_active_user(
    current_user: UserSchema = Depends(get_current_user)
) -> UserSchema:
    """Get current active user"""
    if not current_user.is_active:
        raise AuthenticationException("User account is not active")
    return current_user

def require_role(required_roles: list):
    """Dependency factory for role-based authorization"""
    def role_checker(current_user: UserSchema = Depends(get_current_active_user)) -> UserSchema:
        user_role_value = current_user.role.value
        required_role_values = [role.value if hasattr(role, 'value') else role for role in required_roles]
        
        logger.info("Role check", 
                   user_role=user_role_value, 
                   required_roles=required_role_values,
                   user_id=current_user.id)
        
        if user_role_value not in required_role_values:
            logger.warning("Access denied", 
                          user_role=user_role_value, 
                          required_roles=required_role_values,
                          user_id=current_user.id)
            raise AuthorizationException(
                f"Access denied. Required roles: {required_roles}"
            )
        return current_user
    return role_checker

def require_admin_role():
    """Require admin role"""
    from app.schema.user import UserRole
    return require_role([UserRole.ADMIN, UserRole.DISTRICT_AUTHORITY])

def require_officer_role():
    """Require officer role (District Authority or Social Welfare)"""
    from app.schema.user import UserRole
    return require_role([UserRole.DISTRICT_AUTHORITY, UserRole.SOCIAL_WELFARE])

def require_financial_role():
    """Require financial institution role"""
    from app.schema.user import UserRole
    return require_role([UserRole.FINANCIAL_INSTITUTION])

def require_public_user():
    """Require public user role"""
    from app.schema.user import UserRole
    return require_role([UserRole.PUBLIC])

def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[UserSchema]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        return get_current_user(credentials, db)
    except:
        return None

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[UserModel]:
    """
    Get current user if token is provided, otherwise return None.
    Used for endpoints that work with or without authentication.
    Returns SQLAlchemy model instead of Pydantic schema.
    """
    if not credentials:
        return None
    
    try:
        token = credentials.credentials
        payload = verify_token(token)
        user_id = payload.get("sub")
        
        if user_id:
            user = db.query(UserModel).filter(UserModel.id == user_id).first()
            return user
    except:
        pass
    
    return None

# Rate limiting dependencies
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

def rate_limit(requests: int, per: int = 60):
    """Rate limiting decorator"""
    return limiter.limit(f"{requests}/{per}second")
