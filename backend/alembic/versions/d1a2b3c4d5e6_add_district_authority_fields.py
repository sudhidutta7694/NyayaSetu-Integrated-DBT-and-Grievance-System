"""Add district authority fields to application

Revision ID: d1a2b3c4d5e6
Revises: 2089ba0a2dd3
Create Date: 2024-10-07 10:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd1a2b3c4d5e6'
down_revision = '2089ba0a2dd3'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add fields to applications table
    op.add_column('applications', sa.Column('fir_number', sa.String(), nullable=True))
    op.add_column('applications', sa.Column('district_comments', sa.Text(), nullable=True))
    op.add_column('applications', sa.Column('cctns_verified', sa.Boolean(), default=False))
    op.add_column('applications', sa.Column('cctns_verification_date', sa.DateTime(), nullable=True))
    op.add_column('applications', sa.Column('district_reviewed_by', sa.String(), nullable=True))
    op.add_column('applications', sa.Column('district_reviewed_at', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove added columns
    op.drop_column('applications', 'district_reviewed_at')
    op.drop_column('applications', 'district_reviewed_by')
    op.drop_column('applications', 'cctns_verification_date')
    op.drop_column('applications', 'cctns_verified')
    op.drop_column('applications', 'district_comments')
    op.drop_column('applications', 'fir_number')