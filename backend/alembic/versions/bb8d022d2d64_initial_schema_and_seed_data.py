"""Initial schema and seed data

Revision ID: bb8d022d2d64
Revises: 
Create Date: 2025-10-05 22:10:40.951037

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import uuid
from datetime import datetime, timezone

# revision identifiers, used by Alembic.
revision = 'bb8d022d2d64'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # SQLAlchemy will create enum types automatically when creating tables

    # Create roles table
    op.create_table('roles',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('description', sa.String(), nullable=True),
        sa.Column('permissions', postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create users table
    op.create_table('users',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('email', sa.String(), nullable=False),
        sa.Column('phone_number', sa.String(), nullable=True),
        sa.Column('full_name', sa.String(), nullable=False),
        sa.Column('father_name', sa.String(), nullable=True),
        sa.Column('mother_name', sa.String(), nullable=True),
        sa.Column('aadhaar_number', sa.String(), nullable=True),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('age', sa.Integer(), nullable=True),
        sa.Column('gender', sa.Enum('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY', name='gender'), nullable=True),
        sa.Column('category', sa.Enum('SC', 'ST', 'OBC', 'GENERAL', 'OTHER', name='category'), nullable=True),
        sa.Column('address', sa.Text(), nullable=True),
        sa.Column('district', sa.String(), nullable=True),
        sa.Column('state', sa.String(), nullable=True),
        sa.Column('pincode', sa.String(), nullable=True),
        sa.Column('role', sa.Enum('PUBLIC', 'DISTRICT_AUTHORITY', 'SOCIAL_WELFARE', 'FINANCIAL_INSTITUTION', 'ADMIN', name='userrole'), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_verified', sa.Boolean(), nullable=True),
        sa.Column('is_onboarded', sa.Boolean(), nullable=True),
        sa.Column('onboarding_step', sa.Integer(), nullable=True),
        sa.Column('profile_image', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.Column('last_login', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('phone_number')
    )

    # Create applications table
    op.create_table('applications',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('application_number', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('title', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('application_type', sa.Enum('SCHOLARSHIP', 'PENSION', 'SUBSIDY', 'COMPENSATION', 'POA_COMPENSATION', name='applicationtype'), nullable=True),
        sa.Column('status', sa.Enum('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION_PENDING', 'APPROVED', 'REJECTED', 'FUND_DISBURSED', 'COMPLETED', name='applicationstatus'), nullable=True),
        sa.Column('amount_requested', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('amount_approved', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('amount_disbursed', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('bank_account_number', sa.String(), nullable=True),
        sa.Column('bank_ifsc_code', sa.String(), nullable=True),
        sa.Column('bank_name', sa.String(), nullable=True),
        sa.Column('bank_branch', sa.String(), nullable=True),
        sa.Column('account_holder_name', sa.String(), nullable=True),
        sa.Column('submitted_at', sa.DateTime(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('approved_at', sa.DateTime(), nullable=True),
        sa.Column('disbursed_at', sa.DateTime(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('application_number')
    )

    # Create documents table
    op.create_table('documents',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('application_id', sa.String(), nullable=True),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('document_type', sa.String(), nullable=False),
        sa.Column('document_name', sa.String(), nullable=False),
        sa.Column('file_path', sa.String(), nullable=True),
        sa.Column('file_size', sa.String(), nullable=True),
        sa.Column('mime_type', sa.String(), nullable=True),
        sa.Column('status', sa.Enum('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED', name='documentstatus'), nullable=True),
        sa.Column('is_digilocker', sa.Boolean(), nullable=True),
        sa.Column('digilocker_uri', sa.String(), nullable=True),
        sa.Column('verification_notes', sa.Text(), nullable=True),
        sa.Column('verified_by', sa.String(), nullable=True),
        sa.Column('verified_at', sa.DateTime(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.Column('updated_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['application_id'], ['applications.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )

    # Create otp table
    op.create_table('otp',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False, default=sa.text('gen_random_uuid()')),
        sa.Column('phone_number', sa.String(20), nullable=True),
        sa.Column('email', sa.String(255), nullable=True),
        sa.Column('otp_code', sa.String(10), nullable=False),
        sa.Column('purpose', sa.String(50), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('is_used', sa.Boolean(), nullable=False, default=False),
        sa.Column('extra_data', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now()),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False, default=sa.func.now()),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_otp_phone_number', 'otp', ['phone_number'])
    op.create_index('ix_otp_email', 'otp', ['email'])

    # Create user_role_assignments table
    op.create_table('user_role_assignments',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('user_id', sa.String(), nullable=False),
        sa.Column('role_id', sa.String(), nullable=False),
        sa.Column('assigned_by', sa.String(), nullable=True),
        sa.Column('assigned_at', sa.DateTime(), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'role_id', name='_user_role_uc')
    )

    # Insert seed data - Roles
    op.execute("""
        INSERT INTO roles (id, name, description, permissions, is_active, created_at, updated_at) VALUES
        ('550e8400-e29b-41d4-a716-446655440001', 'PUBLIC', 'General public user role', ARRAY['create_application', 'view_own_application', 'upload_documents', 'view_own_profile'], true, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440002', 'DISTRICT_AUTHORITY', 'District authority role', ARRAY['view_applications', 'verify_documents', 'approve_applications', 'view_reports', 'manage_cases'], true, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440003', 'SOCIAL_WELFARE', 'Social welfare department role', ARRAY['view_applications', 'verify_documents', 'approve_applications', 'view_reports', 'manage_beneficiaries', 'disburse_funds'], true, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440004', 'FINANCIAL_INSTITUTION', 'Financial institution role', ARRAY['view_payment_requests', 'process_payments', 'view_transaction_history', 'generate_reports'], true, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440005', 'ADMIN', 'System administrator role', ARRAY['manage_users', 'manage_roles', 'view_all_data', 'system_configuration', 'audit_logs'], true, NOW(), NOW())
    """)
    
    # Insert seed data - Users
    op.execute("""
        INSERT INTO users (id, email, phone_number, full_name, aadhaar_number, role, is_active, is_verified, is_onboarded, onboarding_step, created_at, updated_at) VALUES
        ('550e8400-e29b-41d4-a716-446655440010', 'admin@nyayasetu.gov.in', '+919876543210', 'System Administrator', NULL, 'ADMIN', true, true, true, 4, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440011', 'john.doe@example.com', '+919876543211', 'John Doe', '362851176122', 'PUBLIC', true, true, true, 4, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440012', 'jane.smith@example.com', '+919876543212', 'Jane Smith', '498765432109', 'PUBLIC', true, true, true, 4, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440013', 'district.officer@example.com', '+919876543213', 'District Officer', NULL, 'DISTRICT_AUTHORITY', true, true, true, 4, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440014', 'welfare.officer@example.com', '+919876543214', 'Welfare Officer', NULL, 'SOCIAL_WELFARE', true, true, true, 4, NOW(), NOW()),
        ('550e8400-e29b-41d4-a716-446655440015', 'bank.manager@example.com', '+919876543215', 'Bank Manager', NULL, 'FINANCIAL_INSTITUTION', true, true, true, 4, NOW(), NOW())
    """)
    
    # Insert seed data - Applications
    op.execute("""
        INSERT INTO applications (id, application_number, user_id, application_type, title, description, status, amount_requested, amount_approved, amount_disbursed, bank_account_number, bank_ifsc_code, bank_name, bank_branch, account_holder_name, submitted_at, approved_at, created_at, updated_at) VALUES
        ('550e8400-e29b-41d4-a716-446655440020', 'NS20241201001', '550e8400-e29b-41d4-a716-446655440011', 'COMPENSATION', 'Relief for Caste-based Discrimination', 'Application for monetary relief under PCR Act', 'APPROVED', 50000.00, 50000.00, 50000.00, '1234567890123456', 'SBIN0001234', 'State Bank of India', 'Main Branch', 'John Doe', NOW() - INTERVAL '5 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'),
        ('550e8400-e29b-41d4-a716-446655440021', 'NS20241201002', '550e8400-e29b-41d4-a716-446655440012', 'POA_COMPENSATION', 'Compensation for Atrocity', 'Application for compensation under PoA Act', 'UNDER_REVIEW', 100000.00, NULL, NULL, '2345678901234567', 'HDFC0001234', 'HDFC Bank', 'City Branch', 'Jane Smith', NOW() - INTERVAL '3 days', NULL, NOW() - INTERVAL '5 days', NOW()),
        ('550e8400-e29b-41d4-a716-446655440022', 'NS20241201003', '550e8400-e29b-41d4-a716-446655440011', 'SUBSIDY', 'Inter-caste Marriage Incentive', 'Application for inter-caste marriage incentive', 'DRAFT', 25000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 days', NOW())
    """)
    
    # Insert seed data - Documents
    op.execute("""
        INSERT INTO documents (id, application_id, user_id, document_type, document_name, file_path, file_size, mime_type, status, verified_by, verified_at, created_at, updated_at) VALUES
        ('550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440011', 'CASTE_CERTIFICATE', 'Caste Certificate.pdf', '/uploads/documents/caste_cert_1.pdf', '1024000', 'application/pdf', 'VERIFIED', '550e8400-e29b-41d4-a716-446655440013', NOW() - INTERVAL '2 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days'),
        ('550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440011', 'BANK_PASSBOOK', 'Bank Passbook.pdf', '/uploads/documents/passbook_1.pdf', '2048000', 'application/pdf', 'VERIFIED', '550e8400-e29b-41d4-a716-446655440013', NOW() - INTERVAL '2 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days'),
        ('550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440012', 'CASTE_CERTIFICATE', 'Caste Certificate.pdf', '/uploads/documents/caste_cert_2.pdf', '1536000', 'application/pdf', 'PENDING', NULL, NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
        ('550e8400-e29b-41d4-a716-446655440033', '550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440012', 'FIR_COPY', 'FIR Copy.pdf', '/uploads/documents/fir_2.pdf', '512000', 'application/pdf', 'PENDING', NULL, NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
    """)


def downgrade() -> None:
    # Drop all tables in reverse order
    op.drop_table('user_role_assignments')
    op.drop_table('otp')
    op.drop_table('documents')
    op.drop_table('applications')
    op.drop_table('users')
    op.drop_table('roles')
    
    # Drop custom enum types
    op.execute("DROP TYPE IF EXISTS documentstatus")
    op.execute("DROP TYPE IF EXISTS applicationtype")
    op.execute("DROP TYPE IF EXISTS applicationstatus")
    op.execute("DROP TYPE IF EXISTS userrole")
    op.execute("DROP TYPE IF EXISTS category")
    op.execute("DROP TYPE IF EXISTS gender")