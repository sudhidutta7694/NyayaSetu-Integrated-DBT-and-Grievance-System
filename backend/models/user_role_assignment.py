from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from .base import Base
import datetime

class UserRoleAssignment(Base):
    __tablename__ = "user_role_assignments"

    id = Column(String, primary_key=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    role_id = Column(String, ForeignKey("roles.id"), nullable=False)
    assigned_by = Column(String)
    assigned_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="role_assignments")
    role = relationship("Role", back_populates="user_assignments")
