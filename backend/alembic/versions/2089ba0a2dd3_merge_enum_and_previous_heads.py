"""Merge enum and previous heads

Revision ID: 2089ba0a2dd3
Revises: 8c77c6c46b72, a1b2c3d4e5f6
Create Date: 2025-10-06 15:16:03.382907

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '2089ba0a2dd3'
down_revision = ('8c77c6c46b72', 'a1b2c3d4e5f6')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass