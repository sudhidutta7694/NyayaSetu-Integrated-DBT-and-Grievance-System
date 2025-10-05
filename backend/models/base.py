from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Import all models to ensure they are registered with SQLAlchemy
from .user import User, UserRole, Gender, Category
from .role import Role
from .user_role_assignment import UserRoleAssignment
from .document import Document, DocumentStatus
from .application import Application, ApplicationStatus, ApplicationType
