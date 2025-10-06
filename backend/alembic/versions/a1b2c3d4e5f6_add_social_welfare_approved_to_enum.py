"""
Add SOCIAL_WELFARE_APPROVED to applicationstatus enum in PostgreSQL
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = 'c737bfc33872'
branch_labels = None
depends_on = None

def upgrade():
    # Add new value to the enum type in PostgreSQL
    op.execute("""
        ALTER TYPE applicationstatus ADD VALUE IF NOT EXISTS 'SOCIAL_WELFARE_APPROVED';
    """)

def downgrade():
    # Downgrade is not supported for removing enum values in PostgreSQL
    pass
