from sqlalchemy import Column, String, ForeignKey, DateTime, Table
from .base import Base
import datetime

# Association table for many-to-many relationship between applications and documents
application_documents = Table(
    'application_documents',
    Base.metadata,
    Column('application_id', String, ForeignKey('applications.id', ondelete='CASCADE'), primary_key=True),
    Column('document_id', String, ForeignKey('documents.id', ondelete='CASCADE'), primary_key=True),
    Column('linked_at', DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc))
)
