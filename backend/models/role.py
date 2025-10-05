from sqlalchemy import Column, String, Boolean, DateTime, ARRAY
from sqlalchemy.orm import relationship
from .base import Base
import datetime

class Role(Base):
    __tablename__ = "roles"

    id = Column(String, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    permissions = Column(ARRAY(String))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    user_assignments = relationship("UserRoleAssignment", back_populates="role")
