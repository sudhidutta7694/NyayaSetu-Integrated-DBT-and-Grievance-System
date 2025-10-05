"""
Custom exceptions for the application
"""

from typing import Any, Dict, Optional


class BaseException(Exception):
    """Base exception class"""
    
    def __init__(self, message: str, details: Optional[Dict[str, Any]] = None):
        self.message = message
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(BaseException):
    """Raised when validation fails"""
    pass


class AuthenticationException(BaseException):
    """Raised when authentication fails"""
    pass


class AuthorizationException(BaseException):
    """Raised when authorization fails"""
    pass


class NotFoundException(BaseException):
    """Raised when a resource is not found"""
    pass


class ConflictException(BaseException):
    """Raised when there's a conflict (e.g., duplicate resource)"""
    pass


class InternalServerException(BaseException):
    """Raised when an internal server error occurs"""
    pass


class DatabaseException(BaseException):
    """Raised when a database operation fails"""
    pass


class FileUploadException(BaseException):
    """Raised when file upload fails"""
    pass


class ExternalServiceException(BaseException):
    """Raised when an external service call fails"""
    pass


class SMSException(BaseException):
    """Raised when SMS service fails"""
    pass