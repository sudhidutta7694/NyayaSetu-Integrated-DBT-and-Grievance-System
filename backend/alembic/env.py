from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import os
import sys

# Add the project root to the path to import models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

config = context.config

# Override sqlalchemy.url from environment variable if available
if os.environ.get("DATABASE_URL"):
    config.set_main_option("sqlalchemy.url", os.environ["DATABASE_URL"])

fileConfig(config.config_file_name)

# Import your models here
try:
    from models.base import Base
    from models.user import User
    from models.role import Role
    from models.user_role_assignment import UserRoleAssignment
    from models.document import Document
    from models.application import Application
    from models.otp import OTP
    from models.onboarding import OnboardingStep, BankAccount
    from models.uidai import UIDAI 
    target_metadata = Base.metadata
except ImportError as e:
    print(f"Warning: Could not import models: {e}")
    target_metadata = None

def run_migrations_offline():
    context.configure(url=config.get_main_option("sqlalchemy.url"), target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online():
    connectable = engine_from_config(config.get_section(config.config_ini_section), prefix="sqlalchemy.", poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
