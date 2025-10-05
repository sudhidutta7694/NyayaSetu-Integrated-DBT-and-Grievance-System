"""
FastAPI dependencies for authentication and authorization
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import Optional
from app.core.database import get_database
from app.core.security import verify_token
from app.core.exceptions import AuthenticationException, AuthorizationException
from prisma import Prisma
from prisma.models import User
import structlog

logger = structlog.get_logger()

# Security scheme
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Prisma = Depends(get_database)
) -> User:
    """Get current authenticated user"""
    try:
        token = credentials.credentials
        user_id = verify_token(token, "access")
        
        if user_id is None:
            raise AuthenticationException("Invalid or expired token")
        
        user = await db.user.find_unique(
            where={"id": user_id},
            include={
                "applications": True,
                "documents": True,
                "cases": True
            }
        )
        
        if user is None:
            raise AuthenticationException("User not found")
        
        if not user.is_active:
            raise AuthenticationException("User account is not active")
        
        return user
        
    except Exception as e:
        logger.error("Authentication failed", error=str(e))
        raise AuthenticationException("Authentication failed")

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """Get current active user"""
    if not current_user.is_active:
        raise AuthenticationException("User account is not active")
    return current_user

def require_role(required_roles: list):
    """Dependency factory for role-based authorization"""
    async def role_checker(current_user: User = Depends(get_current_active_user)) -> User:
        if current_user.role.value not in [role.value if hasattr(role, 'value') else role for role in required_roles]:
            raise AuthorizationException(
                f"Access denied. Required roles: {required_roles}"
            )
        return current_user
    return role_checker

def require_admin_role():
    """Require admin role"""
    from app.models.user import UserRole
    return require_role([UserRole.ADMIN, UserRole.DISTRICT_AUTHORITY])

def require_officer_role():
    """Require officer role (District Authority or Social Welfare)"""
    from app.models.user import UserRole
    return require_role([UserRole.DISTRICT_AUTHORITY, UserRole.SOCIAL_WELFARE])

def require_financial_role():
    """Require financial institution role"""
    from app.models.user import UserRole
    return require_role([UserRole.FINANCIAL_INSTITUTION])

def require_public_user():
    """Require public user role"""
    from app.models.user import UserRole
    return require_role([UserRole.PUBLIC])

async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Prisma = Depends(get_database)
) -> Optional[User]:
    """Get current user if authenticated, otherwise return None"""
    if not credentials:
        return None
    
    try:
        return await get_current_user(credentials, db)
    except:
        return None

# Rate limiting dependencies
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

def rate_limit(requests: int, per: int = 60):
    """Rate limiting decorator"""
    return limiter.limit(f"{requests}/{per}second")
