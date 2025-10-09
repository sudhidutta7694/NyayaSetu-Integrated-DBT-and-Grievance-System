"""
Admin endpoints for document verification and user management
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog

from app.core.database import get_db
from app.core.dependencies import require_role
from app.core.exceptions import ValidationException, AuthenticationException
from app.schema.user import User, UserRole
from app.services.document_service import DocumentService
from sqlalchemy.orm import Session

logger = structlog.get_logger()
router = APIRouter()
security = HTTPBearer()


@router.get("/documents/pending")
async def get_pending_documents(
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_role([UserRole.DISTRICT_AUTHORITY, UserRole.FINANCIAL_INSTITUTION, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Get documents pending verification based on user role"""
    try:
        document_service = DocumentService(db)
        documents = await document_service.get_documents_for_verification(
            current_user.role.value, limit, offset
        )
        
        return {
            "documents": documents,
            "total": len(documents),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error("Failed to get pending documents", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get pending documents"
        )


@router.post("/documents/{document_id}/verify")
async def verify_document(
    document_id: str,
    status: str,
    comments: Optional[str] = None,
    current_user: User = Depends(require_role([UserRole.DISTRICT_AUTHORITY, UserRole.FINANCIAL_INSTITUTION, UserRole.ADMIN])),
    db: Session = Depends(get_db)
):
    """Verify a document"""
    try:
        if status not in ["VERIFIED", "REJECTED"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Status must be either 'VERIFIED' or 'REJECTED'"
            )

        document_service = DocumentService(db)
        result = await document_service.verify_document(
            document_id, status, current_user.id, comments
        )
        
        return {
            "message": f"Document {status.lower()} successfully",
            "verification": result
        }
    except ValidationException as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error("Failed to verify document", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify document"
        )


@router.get("/users")
async def get_users(
    role: Optional[UserRole] = Query(None),
    is_verified: Optional[bool] = Query(None),
    is_onboarded: Optional[bool] = Query(None),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.DISTRICT_AUTHORITY, UserRole.SOCIAL_WELFARE])),
    db: Session = Depends(get_db)
):
    """Get users with optional filters"""
    try:
        # Build where clause
        where_clause = {}
        if role:
            where_clause["role"] = role.value
        if is_verified is not None:
            where_clause["is_verified"] = is_verified
        if is_onboarded is not None:
            where_clause["is_onboarded"] = is_onboarded

        users = await db.user.find_many(
            where=where_clause,
            include={
                "documents": True,
                "bank_accounts": True,
                "onboarding_steps": True
            },
            order_by={"created_at": "desc"},
            take=limit,
            skip=offset
        )

        return {
            "users": [
                {
                    "id": user.id,
                    "full_name": user.full_name,
                    "email": user.email,
                    "phone_number": user.phone_number,
                    "role": user.role,
                    "is_verified": user.is_verified,
                    "is_onboarded": user.is_onboarded,
                    "onboarding_step": user.onboarding_step,
                    "created_at": user.created_at,
                    "last_login": user.last_login,
                    "documents_count": len(user.documents),
                    "bank_accounts_count": len(user.bank_accounts)
                }
                for user in users
            ],
            "total": len(users),
            "limit": limit,
            "offset": offset
        }
    except Exception as e:
        logger.error("Failed to get users", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get users"
        )


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.DISTRICT_AUTHORITY, UserRole.SOCIAL_WELFARE])),
    db: Session = Depends(get_db)
):
    """Get detailed information about a specific user"""
    try:
        user = await db.user.find_unique(
            where={"id": user_id},
            include={
                "documents": True,
                "bank_accounts": True,
                "onboarding_steps": True,
                "applications": True
            }
        )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return {
            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "father_name": user.father_name,
                "mother_name": user.mother_name,
                "email": user.email,
                "phone_number": user.phone_number,
                "aadhaar_number": user.aadhaar_number,
                "date_of_birth": user.date_of_birth,
                "age": user.age,
                "gender": user.gender,
                "category": user.category,
                "address": user.address,
                "district": user.district,
                "state": user.state,
                "pincode": user.pincode,
                "role": user.role,
                "is_verified": user.is_verified,
                "is_onboarded": user.is_onboarded,
                "onboarding_step": user.onboarding_step,
                "created_at": user.created_at,
                "updated_at": user.updated_at,
                "last_login": user.last_login,
                "documents": [
                    {
                        "id": doc.id,
                        "document_type": doc.document_type,
                        "document_name": doc.document_name,
                        "status": doc.status,
                        "is_digilocker": doc.is_digilocker,
                        "created_at": doc.created_at
                    }
                    for doc in user.documents
                ],
                "bank_accounts": [
                    {
                        "id": account.id,
                        "account_number": account.account_number,
                        "ifsc_code": account.ifsc_code,
                        "bank_name": account.bank_name,
                        "is_verified": account.is_verified,
                        "created_at": account.created_at
                    }
                    for account in user.bank_accounts
                ],
                "applications": [
                    {
                        "id": app.id,
                        "application_number": app.application_number,
                        "title": app.title,
                        "status": app.status,
                        "amount_requested": app.amount_requested,
                        "created_at": app.created_at
                    }
                    for app in user.applications
                ]
            }
        }
    except Exception as e:
        logger.error("Failed to get user details", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user details"
        )


@router.post("/users/{user_id}/verify")
async def verify_user(
    user_id: str,
    is_verified: bool,
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.DISTRICT_AUTHORITY])),
    db: Session = Depends(get_db)
):
    """Verify or unverify a user"""
    try:
        user = await db.user.update(
            where={"id": user_id},
            data={"is_verified": is_verified}
        )

        return {
            "message": f"User {'verified' if is_verified else 'unverified'} successfully",
            "user_id": user.id,
            "is_verified": user.is_verified
        }
    except Exception as e:
        logger.error("Failed to verify user", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify user"
        )


@router.get("/dashboard/stats")
async def get_dashboard_stats(
    current_user: User = Depends(require_role([UserRole.ADMIN, UserRole.DISTRICT_AUTHORITY, UserRole.SOCIAL_WELFARE])),
    db: Session = Depends(get_db)
):
    """Get dashboard statistics"""
    try:
        # Get total users
        total_users = await db.user.count()
        
        # Get verified users
        verified_users = await db.user.count(where={"is_verified": True})
        
        # Get onboarded users
        onboarded_users = await db.user.count(where={"is_onboarded": True})
        
        # Get pending documents
        pending_documents = await db.document.count(where={"status": "PENDING"})
        
        # Get verified documents
        verified_documents = await db.document.count(where={"status": "VERIFIED"})
        
        # Get rejected documents
        rejected_documents = await db.document.count(where={"status": "REJECTED"})
        
        # Get users by role
        users_by_role = {}
        for role in UserRole:
            count = await db.user.count(where={"role": role.value})
            users_by_role[role.value] = count

        return {
            "total_users": total_users,
            "verified_users": verified_users,
            "onboarded_users": onboarded_users,
            "pending_documents": pending_documents,
            "verified_documents": verified_documents,
            "rejected_documents": rejected_documents,
            "users_by_role": users_by_role,
            "verification_rate": (verified_users / total_users * 100) if total_users > 0 else 0,
            "onboarding_rate": (onboarded_users / total_users * 100) if total_users > 0 else 0
        }
    except Exception as e:
        logger.error("Failed to get dashboard stats", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get dashboard statistics"
        )
