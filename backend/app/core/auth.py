"""
Authentication middleware and utilities
"""

from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
import structlog

from app.core.config import settings
from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.exceptions import AuthenticationException, AuthorizationException
from app.schema.user import User, UserRole

logger = structlog.get_logger()
security = HTTPBearer()


class AuthManager:
    """Authentication manager"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_current_user(
        self, 
        credentials: HTTPAuthorizationCredentials = Depends(security)
    ) -> User:
        """Get current authenticated user"""
        try:
            payload = jwt.decode(
                credentials.credentials,
                settings.JWT_SECRET_KEY,
                algorithms=[settings.JWT_ALGORITHM]
            )
            
            user_id = payload.get("sub")
            if not user_id:
                raise AuthenticationException("Invalid token")
            
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                raise AuthenticationException("User not found")
            
            if not user.is_active:
                raise AuthenticationException("User account is deactivated")
            
            return user
            
        except JWTError as e:
            logger.error("JWT decode error", error=str(e))
            raise AuthenticationException("Invalid token")
        except Exception as e:
            logger.error("Authentication error", error=str(e))
            raise AuthenticationException("Authentication failed")
    
    def get_current_active_user(
        self,
        current_user: User = Depends(get_current_user)
    ) -> User:
        """Get current active user"""
        if not current_user.is_active:
            raise AuthenticationException("User account is deactivated")
        return current_user
    
    def get_current_verified_user(
        self,
        current_user: User = Depends(get_current_active_user)
    ) -> User:
        """Get current verified user"""
        if not current_user.is_verified:
            raise AuthenticationException("User account is not verified")
        return current_user


def require_roles(allowed_roles: List[UserRole]):
    """Decorator to require specific roles"""
    def role_checker(current_user: User = Depends(AuthManager(get_db).get_current_active_user)):
        if current_user.role not in allowed_roles:
            raise AuthorizationException(
                f"Access denied. Required roles: {[role.value for role in allowed_roles]}"
            )
        return current_user
    return role_checker


def require_admin(current_user: User = Depends(AuthManager(get_db).get_current_active_user)):
    """Require admin role"""
    if current_user.role != UserRole.ADMIN:
        raise AuthorizationException("Admin access required")
    return current_user


def require_district_authority(current_user: User = Depends(AuthManager(get_db).get_current_active_user)):
    """Require district authority role"""
    if current_user.role not in [UserRole.DISTRICT_AUTHORITY, UserRole.ADMIN]:
        raise AuthorizationException("District authority access required")
    return current_user


def require_social_welfare(current_user: User = Depends(AuthManager(get_db).get_current_active_user)):
    """Require social welfare role"""
    if current_user.role not in [UserRole.SOCIAL_WELFARE, UserRole.ADMIN]:
        raise AuthorizationException("Social welfare access required")
    return current_user


def require_financial_institution(current_user: User = Depends(AuthManager(get_db).get_current_active_user)):
    """Require financial institution role"""
    if current_user.role not in [UserRole.FINANCIAL_INSTITUTION, UserRole.ADMIN]:
        raise AuthorizationException("Financial institution access required")
    return current_user


def require_public_or_above(current_user: User = Depends(AuthManager(get_db).get_current_active_user)):
    """Require public role or above"""
    return current_user


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Get current authenticated user"""
    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        
        user_id = payload.get("sub")
        if not user_id:
            raise AuthenticationException("Invalid token")
        
        # Import here to avoid circular imports
        from models.user import User as UserModel
        
        user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not user:
            raise AuthenticationException("User not found")
        
        return user
        
    except JWTError as e:
        logger.error("JWT decode error", error=str(e))
        raise AuthenticationException("Invalid token")
    except Exception as e:
        logger.error("Authentication error", error=str(e))
        raise AuthenticationException("Authentication failed")


def get_current_active_user(
    current_user = Depends(get_current_user)
):
    """Get current active user"""
    if not current_user.is_active:
        raise AuthenticationException("User account is deactivated")
    return current_user


def get_current_verified_user(
    current_user = Depends(get_current_active_user)
):
    """Get current verified user"""
    if not current_user.is_verified:
        raise AuthenticationException("User account is not verified")
    return current_user


def get_current_user_dependency():
    """Get current user dependency"""
    return get_current_user


def get_current_active_user_dependency():
    """Get current active user dependency"""
    return get_current_active_user


def get_current_verified_user_dependency():
    """Get current verified user dependency"""
    return get_current_verified_user


# Permission checking utilities
class PermissionChecker:
    """Permission checking utilities"""
    
    @staticmethod
    def can_view_application(user: User, application_user_id: str) -> bool:
        """Check if user can view application"""
        try:
            logger.info("Permission check START", 
                       user_id=user.id,
                       user_id_type=type(user.id).__name__,
                       user_role=user.role,
                       user_role_type=type(user.role).__name__,
                       user_role_value=user.role.value if hasattr(user.role, 'value') else user.role,
                       application_user_id=application_user_id,
                       application_user_id_type=type(application_user_id).__name__,
                       ids_match=user.id == application_user_id,
                       ids_match_str=str(user.id) == str(application_user_id))
            
            # Get role as string for comparisons
            user_role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)
            
            # Check ADMIN
            logger.info("Checking ADMIN role...")
            is_admin = (user.role == UserRole.ADMIN or user_role_value == "ADMIN")
            logger.info("Admin check", is_admin=is_admin, user_role=user.role, admin_role=UserRole.ADMIN, user_role_value=user_role_value)
            if is_admin:
                logger.info("ADMIN access granted")
                return True
            
            # Check Authority roles
            logger.info("Checking AUTHORITY roles...")
            is_authority = (user.role in [UserRole.DISTRICT_AUTHORITY, UserRole.SOCIAL_WELFARE, UserRole.FINANCIAL_INSTITUTION] or
                          user_role_value in ["DISTRICT_AUTHORITY", "SOCIAL_WELFARE", "FINANCIAL_INSTITUTION"])
            logger.info("Authority check", is_authority=is_authority, user_role_value=user_role_value)
            if is_authority:
                logger.info("AUTHORITY access granted")
                return True
            
            # Check PUBLIC with matching ID
            logger.info("Checking PUBLIC role with ID match...")
            # Handle both enum and string comparisons
            user_role_value = user.role.value if hasattr(user.role, 'value') else str(user.role)
            is_public = (user.role == UserRole.PUBLIC or 
                        user_role_value == "PUBLIC" or 
                        str(user.role) == "PUBLIC" or
                        str(user.role) == "<UserRole.PUBLIC: 'PUBLIC'>")
            ids_match = user.id == application_user_id
            logger.info("Public check", 
                       is_public=is_public, 
                       ids_match=ids_match, 
                       should_allow=is_public and ids_match,
                       user_role_value=user_role_value,
                       user_role_str=str(user.role))
            if is_public and ids_match:
                logger.info("PUBLIC access granted (IDs match)")
                return True
            
            logger.warning("Permission denied - no conditions met", 
                          is_public=is_public, 
                          ids_match=ids_match,
                          user_role=user.role)
            return False
            
        except Exception as e:
            logger.error("Exception in permission check", error=str(e), error_type=type(e).__name__)
            import traceback
            logger.error("Traceback", traceback=traceback.format_exc())
            return False
    
    @staticmethod
    def can_edit_application(user: User, application_user_id: str) -> bool:
        """Check if user can edit application"""
        if user.role == UserRole.ADMIN:
            return True
        if user.role == UserRole.PUBLIC and user.id == application_user_id:
            return True
        return False
    
    @staticmethod
    def can_approve_application(user: User) -> bool:
        """Check if user can approve application"""
        return user.role in [
            UserRole.DISTRICT_AUTHORITY, 
            UserRole.SOCIAL_WELFARE, 
            UserRole.ADMIN
        ]
    
    @staticmethod
    def can_disburse_funds(user: User) -> bool:
        """Check if user can disburse funds"""
        return user.role in [
            UserRole.SOCIAL_WELFARE, 
            UserRole.FINANCIAL_INSTITUTION, 
            UserRole.ADMIN
        ]
    
    @staticmethod
    def can_verify_documents(user: User) -> bool:
        """Check if user can verify documents"""
        return user.role in [
            UserRole.DISTRICT_AUTHORITY, 
            UserRole.SOCIAL_WELFARE, 
            UserRole.ADMIN
        ]
    
    @staticmethod
    def can_manage_cases(user: User) -> bool:
        """Check if user can manage cases"""
        return user.role in [
            UserRole.DISTRICT_AUTHORITY, 
            UserRole.ADMIN
        ]
    
    @staticmethod
    def can_view_reports(user: User) -> bool:
        """Check if user can view reports"""
        return user.role in [
            UserRole.DISTRICT_AUTHORITY, 
            UserRole.SOCIAL_WELFARE, 
            UserRole.FINANCIAL_INSTITUTION, 
            UserRole.ADMIN
        ]


# Dependency functions for common permission checks
def require_application_access(application_user_id: str):
    """Require access to specific application"""
    def checker(current_user: User = Depends(get_current_user_dependency())):
        if not PermissionChecker.can_view_application(current_user, application_user_id):
            raise AuthorizationException("Access denied to this application")
        return current_user
    return checker


def require_application_edit_access(application_user_id: str):
    """Require edit access to specific application"""
    def checker(current_user: User = Depends(get_current_user_dependency())):
        if not PermissionChecker.can_edit_application(current_user, application_user_id):
            raise AuthorizationException("Edit access denied to this application")
        return current_user
    return checker


def require_approval_permission(current_user: User = Depends(get_current_user_dependency())):
    """Require approval permission"""
    if not PermissionChecker.can_approve_application(current_user):
        raise AuthorizationException("Approval permission required")
    return current_user


def require_disbursement_permission(current_user: User = Depends(get_current_user_dependency())):
    """Require disbursement permission"""
    if not PermissionChecker.can_disburse_funds(current_user):
        raise AuthorizationException("Fund disbursement permission required")
    return current_user


def require_document_verification_permission(current_user: User = Depends(get_current_user_dependency())):
    """Require document verification permission"""
    if not PermissionChecker.can_verify_documents(current_user):
        raise AuthorizationException("Document verification permission required")
    return current_user


def require_case_management_permission(current_user: User = Depends(get_current_user_dependency())):
    """Require case management permission"""
    if not PermissionChecker.can_manage_cases(current_user):
        raise AuthorizationException("Case management permission required")
    return current_user


def require_report_access(current_user: User = Depends(get_current_user_dependency())):
    """Require report access permission"""
    if not PermissionChecker.can_view_reports(current_user):
        raise AuthorizationException("Report access permission required")
    return current_user

