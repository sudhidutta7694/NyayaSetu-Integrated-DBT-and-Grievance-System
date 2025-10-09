from sqlalchemy import Column, String, Date, DateTime, func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from models.base import Base


class UIDAI(Base):
    __tablename__ = "uidai"
    
    aadhaar_number = Column(String(12), primary_key=True, index=True, unique=True, nullable=False)
    name = Column(String(255), nullable=False)
    father_name = Column(String(255), nullable=True)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(String(10), nullable=False)  # MALE, FEMALE, OTHER
    address = Column(String(500), nullable=False)
    phone_number = Column(String(15), nullable=False)
    
    # Audit fields
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<UIDAI(aadhaar={self.aadhaar_number}, name={self.name})>"
