"""
User management endpoints
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import structlog
from pydantic import BaseModel

from app.core.database import get_db
from sqlalchemy.orm import Session
from app.core.exceptions import AuthenticationException, NotFoundException
from app.core.dependencies import get_current_user  # Use the one from dependencies
from app.schema.user import User, UserUpdate, UserProfile
from app.services.auth_service import AuthService
from models.onboarding import BankAccount

logger = structlog.get_logger()
router = APIRouter()
security = HTTPBearer()


class BankAccountCreate(BaseModel):
    """Schema for creating/updating bank account"""
    account_number: str
    ifsc_code: str
    bank_name: str
    branch_name: str
    account_holder_name: str

# Note: get_current_user is imported from app.core.dependencies

@router.get("/me", response_model=UserProfile)
async def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get current user's profile with bank accounts"""
    from models.onboarding import BankAccount
    
    # Get user's bank accounts
    bank_accounts = db.query(BankAccount).filter(
        BankAccount.user_id == current_user.id
    ).all()
    
    # Convert user to dict and add bank accounts
    user_dict = {
        **current_user.__dict__,
        "bank_accounts": [
            {
                "id": ba.id,
                "account_number": ba.account_number,
                "ifsc_code": ba.ifsc_code,
                "bank_name": ba.bank_name,
                "branch_name": ba.branch_name,
                "account_holder_name": ba.account_holder_name,
                "is_verified": ba.is_verified,
                "created_at": ba.created_at
            }
            for ba in bank_accounts
        ]
    }
    
    return user_dict


@router.put("/me", response_model=UserProfile)
async def update_my_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    try:
        auth_service = AuthService(db)
        
        # Convert Pydantic model to dict, excluding None values
        update_data = user_update.dict(exclude_unset=True)
        
        updated_user = auth_service.update_user(current_user.id, update_data)
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update profile"
            )
        
        logger.info("User profile updated", user_id=current_user.id)
        return updated_user
        
    except Exception as e:
        logger.error("Profile update failed", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update profile"
        )


@router.post("/me/upload-profile-image")
async def upload_profile_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload profile image"""
    try:
        # Validate file type
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only image files are allowed"
            )
        
        # Validate file size (10MB max)
        file_size = 0
        content = await file.read()
        file_size = len(content)
        
        if file_size > 10 * 1024 * 1024:  # 10MB
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="File size too large. Maximum 10MB allowed."
            )
        
        # Save file (in production, use cloud storage)
        import os
        from datetime import datetime
        
        upload_dir = "uploads/profile_images"
        os.makedirs(upload_dir, exist_ok=True)
        
        file_extension = file.filename.split(".")[-1]
        filename = f"{current_user.id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.{file_extension}"
        file_path = os.path.join(upload_dir, filename)
        
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Update user profile with image path
        auth_service = AuthService(db)
        auth_service.update_user(current_user.id, {"profile_image": file_path})
        
        logger.info("Profile image uploaded", user_id=current_user.id, file_path=file_path)
        
        return {
            "message": "Profile image uploaded successfully",
            "file_path": file_path
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Profile image upload failed", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to upload profile image"
        )


@router.post("/me/bank-account")
async def create_or_update_bank_account(
    bank_data: BankAccountCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create or update user's bank account"""
    try:
        # Check if user already has a bank account
        existing_bank = db.query(BankAccount).filter(
            BankAccount.user_id == current_user.id
        ).first()
        
        if existing_bank:
            # Update existing bank account
            existing_bank.account_number = bank_data.account_number
            existing_bank.ifsc_code = bank_data.ifsc_code
            existing_bank.bank_name = bank_data.bank_name
            existing_bank.branch_name = bank_data.branch_name
            existing_bank.account_holder_name = bank_data.account_holder_name
            existing_bank.is_verified = False  # Reset verification on update
            existing_bank.verified_at = None
            
            db.commit()
            db.refresh(existing_bank)
            
            logger.info("Bank account updated", user_id=current_user.id, bank_id=existing_bank.id)
            
            return {
                "success": True,
                "message": "Bank account updated successfully",
                "data": {
                    "id": existing_bank.id,
                    "account_number": existing_bank.account_number,
                    "ifsc_code": existing_bank.ifsc_code,
                    "bank_name": existing_bank.bank_name,
                    "branch_name": existing_bank.branch_name,
                    "account_holder_name": existing_bank.account_holder_name,
                    "is_verified": existing_bank.is_verified
                }
            }
        else:
            # Create new bank account
            new_bank = BankAccount(
                user_id=str(current_user.id),
                account_number=bank_data.account_number,
                ifsc_code=bank_data.ifsc_code,
                bank_name=bank_data.bank_name,
                branch_name=bank_data.branch_name,
                account_holder_name=bank_data.account_holder_name,
                is_verified=False
            )
            
            db.add(new_bank)
            db.commit()
            db.refresh(new_bank)
            
            logger.info("Bank account created", user_id=current_user.id, bank_id=new_bank.id)
            
            return {
                "success": True,
                "message": "Bank account created successfully",
                "data": {
                    "id": new_bank.id,
                    "account_number": new_bank.account_number,
                    "ifsc_code": new_bank.ifsc_code,
                    "bank_name": new_bank.bank_name,
                    "branch_name": new_bank.branch_name,
                    "account_holder_name": new_bank.account_holder_name,
                    "is_verified": new_bank.is_verified
                }
            }
        
    except Exception as e:
        db.rollback()
        logger.error("Failed to save bank account", user_id=current_user.id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save bank account: {str(e)}"
        )


@router.get("/", response_model=List[User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get users (admin only)"""
    try:
        # Check if user is admin
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        # Build filter conditions
        where_conditions = {}
        if role:
            where_conditions["role"] = role
        if is_active is not None:
            where_conditions["is_active"] = is_active
        
        # This will need to be implemented with proper SQLAlchemy queries
        # For now, return empty list to avoid errors
        users = []
        
        return users
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get users", error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get users"
        )


@router.get("/{user_id}", response_model=User)
async def get_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user by ID"""
    try:
        # Check if user is admin or accessing their own profile
        if current_user.role != "ADMIN" and current_user.id != user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access denied"
            )
        
        auth_service = AuthService(db)
        user = auth_service.get_user_by_id(user_id)  # Remove await - not async
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to get user", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to get user"
        )


@router.put("/{user_id}/activate")
async def activate_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Activate user account (admin only)"""
    try:
        # Check if user is admin
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        auth_service = AuthService(db)
        updated_user = auth_service.update_user(user_id, {"is_active": True})
        
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to activate user"
            )
        
        logger.info("User activated", user_id=user_id, admin_id=current_user.id)
        
        return {"message": "User activated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to activate user", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate user"
        )


@router.put("/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Deactivate user account (admin only)"""
    try:
        # Check if user is admin
        if current_user.role != "ADMIN":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Admin access required"
            )
        
        auth_service = AuthService(db)
        success = auth_service.deactivate_user(user_id)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to deactivate user"
            )
        
        logger.info("User deactivated", user_id=user_id, admin_id=current_user.id)
        
        return {"message": "User deactivated successfully"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error("Failed to deactivate user", user_id=user_id, error=str(e))
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate user"
        )