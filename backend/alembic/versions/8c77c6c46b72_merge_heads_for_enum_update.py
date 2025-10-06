"""Merge heads for enum update

Revision ID: 8c77c6c46b72
Revises: c737bfc33872, add_social_welfare_approved_to_enum
Create Date: 2025-10-06 15:15:14.081150

"""
from alembic import op
import sqlalchemy as sa


revision = '8c77c6c46b72'
down_revision = 'c737bfc33872'
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass