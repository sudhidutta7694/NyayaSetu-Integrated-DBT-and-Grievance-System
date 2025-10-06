from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, Enum, Text
from sqlalchemy.orm import relationship
from .base import Base
import datetime
import enum
import uuid

class Gender(enum.Enum):
    MALE = "MALE"
    FEMALE = "FEMALE"
    OTHER = "OTHER"
    PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY"

class Category(enum.Enum):
    SC = "SC"
    ST = "ST"
    OBC = "OBC"
    GENERAL = "GENERAL"
    OTHER = "OTHER"

class UserRole(enum.Enum):
    PUBLIC = "PUBLIC"
    DISTRICT_AUTHORITY = "DISTRICT_AUTHORITY"
    SOCIAL_WELFARE = "SOCIAL_WELFARE"
    FINANCIAL_INSTITUTION = "FINANCIAL_INSTITUTION"
    ADMIN = "ADMIN"

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    phone_number = Column(String, unique=True, nullable=False)
    full_name = Column(String, nullable=False)
    father_name = Column(String)
    mother_name = Column(String)
    aadhaar_number = Column(String, unique=True)
    date_of_birth = Column(DateTime)
    age = Column(Integer)
    gender = Column(Enum(Gender))
    category = Column(Enum(Category))
    address = Column(Text)
    district = Column(String)
    state = Column(String)
    pincode = Column(String)
    role = Column(Enum(UserRole), default=UserRole.PUBLIC)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    is_onboarded = Column(Boolean, default=False)
    onboarding_step = Column(Integer, default=0)
    profile_image = Column(String)
    created_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), onupdate=lambda: datetime.datetime.now(datetime.timezone.utc))
    last_login = Column(DateTime)

    role_assignments = relationship("UserRoleAssignment", back_populates="user")
    applications = relationship("Application", back_populates="user")
    documents = relationship("Document", back_populates="user")
