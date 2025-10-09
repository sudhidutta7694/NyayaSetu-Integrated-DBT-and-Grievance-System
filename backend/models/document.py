from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum, Text, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from .base import Base
import datetime
import enum
import uuid

class DocumentStatus(enum.Enum):
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    EXPIRED = "EXPIRED"

class DocumentType(enum.Enum):
    """Allowed document types - each user can have only ONE of each"""
    AADHAAR_CARD = "AADHAAR_CARD"
    PAN_CARD = "PAN_CARD"
    BIRTH_CERTIFICATE = "BIRTH_CERTIFICATE"
    BANK_PASSBOOK = "BANK_PASSBOOK"
    CATEGORY_CERTIFICATE = "CATEGORY_CERTIFICATE"
    INCOME_CERTIFICATE = "INCOME_CERTIFICATE"
    MARRIAGE_CERTIFICATE = "MARRIAGE_CERTIFICATE"

class Document(Base):
    __tablename__ = "documents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    application_id = Column(String, ForeignKey("applications.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    document_type = Column(Enum(DocumentType), nullable=False)
    document_name = Column(String, nullable=False)
    file_path = Column(String)
    file_size = Column(String)
    mime_type = Column(String)
    status = Column(Enum(DocumentStatus), default=DocumentStatus.PENDING)
    is_digilocker = Column(Boolean, default=False)
    digilocker_uri = Column(String)
    verification_notes = Column(Text)
    verified_by = Column(String)
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))

    # Ensure each user can have only ONE document of each type
    __table_args__ = (
        UniqueConstraint('user_id', 'document_type', name='uix_user_document_type'),
        Index('idx_user_documents', 'user_id', 'document_type'),
    )

    user = relationship("User", back_populates="documents")
    application = relationship("Application", back_populates="documents")