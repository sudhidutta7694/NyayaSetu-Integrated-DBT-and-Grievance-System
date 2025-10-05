-- Initialize NyayaSetu Database
-- This script sets up the initial database structure and seed data

-- Create database if it doesn't exist
-- CREATE DATABASE IF NOT EXISTS nyayasetu_db;

-- Connect to the database
\c nyayasetu_db;

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('PUBLIC', 'DISTRICT_AUTHORITY', 'SOCIAL_WELFARE', 'FINANCIAL_INSTITUTION', 'ADMIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'DOCUMENT_VERIFICATION_PENDING', 'APPROVED', 'REJECTED', 'FUND_DISBURSED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE document_status AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE case_status AS ENUM ('REGISTERED', 'UNDER_INVESTIGATION', 'IN_COURT', 'RESOLVED', 'CLOSED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender AS ENUM ('MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE category AS ENUM ('SC', 'ST', 'OBC', 'GENERAL', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Insert initial data
INSERT INTO "Role" (id, name, description, permissions, "is_active", "created_at", "updated_at") VALUES
    ('role_public', 'PUBLIC', 'General public user role', '["create_application", "view_own_application", "upload_documents", "view_own_profile"]', true, NOW(), NOW()),
    ('role_district', 'DISTRICT_AUTHORITY', 'District authority role', '["view_applications", "verify_documents", "approve_applications", "view_reports", "manage_cases"]', true, NOW(), NOW()),
    ('role_welfare', 'SOCIAL_WELFARE', 'Social welfare department role', '["view_applications", "verify_documents", "approve_applications", "view_reports", "manage_beneficiaries", "disburse_funds"]', true, NOW(), NOW()),
    ('role_financial', 'FINANCIAL_INSTITUTION', 'Financial institution role', '["view_payment_requests", "process_payments", "view_transaction_history", "generate_reports"]', true, NOW(), NOW()),
    ('role_admin', 'ADMIN', 'System administrator role', '["manage_users", "manage_roles", "view_all_data", "system_configuration", "audit_logs"]', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;

-- Create admin user
INSERT INTO "User" (id, email, "phone_number", "full_name", role, "is_active", "is_verified", "created_at", "updated_at") VALUES
    ('admin_user', 'admin@nyayasetu.gov.in', '+919876543210', 'System Administrator', 'ADMIN', true, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create sample users for testing
INSERT INTO "User" (id, email, "phone_number", "full_name", "aadhaar_number", "date_of_birth", gender, category, address, district, state, pincode, role, "is_active", "is_verified", "created_at", "updated_at") VALUES
    ('user_1', 'john.doe@example.com', '+919876543211', 'John Doe', '123456789012', '1990-01-01', 'MALE', 'SC', '123 Main Street, City', 'Mumbai', 'Maharashtra', '400001', 'PUBLIC', true, true, NOW(), NOW()),
    ('user_2', 'jane.smith@example.com', '+919876543212', 'Jane Smith', '123456789013', '1985-05-15', 'FEMALE', 'ST', '456 Park Avenue, Town', 'Delhi', 'Delhi', '110001', 'PUBLIC', true, true, NOW(), NOW()),
    ('user_3', 'district.officer@example.com', '+919876543213', 'District Officer', NULL, '1980-03-20', 'MALE', 'GENERAL', '789 Government Building', 'Bangalore', 'Karnataka', '560001', 'DISTRICT_AUTHORITY', true, true, NOW(), NOW()),
    ('user_4', 'welfare.officer@example.com', '+919876543214', 'Welfare Officer', NULL, '1975-12-10', 'FEMALE', 'GENERAL', '321 Welfare Office', 'Chennai', 'Tamil Nadu', '600001', 'SOCIAL_WELFARE', true, true, NOW(), NOW()),
    ('user_5', 'bank.manager@example.com', '+919876543215', 'Bank Manager', NULL, '1982-08-25', 'MALE', 'GENERAL', '654 Bank Building', 'Kolkata', 'West Bengal', '700001', 'FINANCIAL_INSTITUTION', true, true, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- Create sample applications
INSERT INTO "Application" (id, "application_number", "user_id", title, description, status, "amount_requested", "amount_approved", "amount_disbursed", "bank_account_number", "bank_ifsc_code", "bank_name", "bank_branch", "account_holder_name", "submitted_at", "created_at", "updated_at") VALUES
    ('app_1', 'NS20241201001', 'user_1', 'Relief for Caste-based Discrimination', 'Application for monetary relief under PCR Act', 'APPROVED', 50000.00, 50000.00, 50000.00, '1234567890123456', 'SBIN0001234', 'State Bank of India', 'Main Branch', 'John Doe', NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '1 day'),
    ('app_2', 'NS20241201002', 'user_2', 'Compensation for Atrocity', 'Application for compensation under PoA Act', 'UNDER_REVIEW', 100000.00, NULL, NULL, '2345678901234567', 'HDFC0001234', 'HDFC Bank', 'City Branch', 'Jane Smith', NOW() - INTERVAL '3 days', NOW() - INTERVAL '5 days', NOW()),
    ('app_3', 'NS20241201003', 'user_1', 'Inter-caste Marriage Incentive', 'Application for inter-caste marriage incentive', 'DRAFT', 25000.00, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '2 days', NOW())
ON CONFLICT ("application_number") DO NOTHING;

-- Create sample documents
INSERT INTO "Document" (id, "application_id", "user_id", "document_type", "document_name", "file_path", "file_size", "mime_type", status, "verified_by", "verified_at", "created_at", "updated_at") VALUES
    ('doc_1', 'app_1', 'user_1', 'CASTE_CERTIFICATE', 'Caste Certificate.pdf', '/uploads/documents/caste_cert_1.pdf', 1024000, 'application/pdf', 'VERIFIED', 'user_3', NOW() - INTERVAL '2 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days'),
    ('doc_2', 'app_1', 'user_1', 'BANK_PASSBOOK', 'Bank Passbook.pdf', '/uploads/documents/passbook_1.pdf', 2048000, 'application/pdf', 'VERIFIED', 'user_3', NOW() - INTERVAL '2 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '2 days'),
    ('doc_3', 'app_2', 'user_2', 'CASTE_CERTIFICATE', 'Caste Certificate.pdf', '/uploads/documents/caste_cert_2.pdf', 1536000, 'application/pdf', 'PENDING', NULL, NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    ('doc_4', 'app_2', 'user_2', 'FIR_COPY', 'FIR Copy.pdf', '/uploads/documents/fir_2.pdf', 512000, 'application/pdf', 'PENDING', NULL, NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- Create sample cases
INSERT INTO "Case" (id, "case_number", "application_id", "user_id", title, description, "fir_number", "police_station", district, state, status, "registered_at", "created_at", "updated_at") VALUES
    ('case_1', 'CS20241201001', 'app_1', 'user_1', 'Caste-based Discrimination Case', 'Case registered for caste-based discrimination incident', 'FIR/2024/001', 'Main Police Station', 'Mumbai', 'Maharashtra', 'IN_COURT', NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW() - INTERVAL '1 day'),
    ('case_2', 'CS20241201002', 'app_2', 'user_2', 'Atrocity Case', 'Case registered under PoA Act for atrocity', 'FIR/2024/002', 'City Police Station', 'Delhi', 'Delhi', 'UNDER_INVESTIGATION', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW())
ON CONFLICT ("case_number") DO NOTHING;

-- Create sample notifications
INSERT INTO "Notification" (id, "user_id", title, message, type, "is_read", "sent_at", "application_id", "case_id") VALUES
    ('notif_1', 'user_1', 'Application Approved', 'Your application NS20241201001 has been approved and funds have been disbursed.', 'SUCCESS', true, NOW() - INTERVAL '1 day', 'app_1', NULL),
    ('notif_2', 'user_2', 'Document Verification Required', 'Please upload additional documents for your application NS20241201002.', 'INFO', false, NOW() - INTERVAL '2 hours', 'app_2', NULL),
    ('notif_3', 'user_1', 'Case Update', 'Your case CS20241201001 has been filed in court.', 'INFO', false, NOW() - INTERVAL '1 hour', NULL, 'case_1')
ON CONFLICT (id) DO NOTHING;

-- Create sample disbursements
INSERT INTO "Disbursement" (id, "application_id", amount, "transaction_id", "bank_reference", status, "disbursed_by", "disbursed_at", "created_at", "updated_at") VALUES
    ('disb_1', 'app_1', 50000.00, 'TXN123456789', 'BANK_REF_001', 'COMPLETED', 'user_4', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON "User"(email);
CREATE INDEX IF NOT EXISTS idx_user_phone ON "User"("phone_number");
CREATE INDEX IF NOT EXISTS idx_user_aadhaar ON "User"("aadhaar_number");
CREATE INDEX IF NOT EXISTS idx_application_user ON "Application"("user_id");
CREATE INDEX IF NOT EXISTS idx_application_status ON "Application"(status);
CREATE INDEX IF NOT EXISTS idx_document_user ON "Document"("user_id");
CREATE INDEX IF NOT EXISTS idx_document_application ON "Document"("application_id");
CREATE INDEX IF NOT EXISTS idx_case_user ON "Case"("user_id");
CREATE INDEX IF NOT EXISTS idx_case_application ON "Case"("application_id");
CREATE INDEX IF NOT EXISTS idx_notification_user ON "Notification"("user_id");
CREATE INDEX IF NOT EXISTS idx_notification_read ON "Notification"("is_read");
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON "AuditLog"("user_id");
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON "AuditLog"("created_at");

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE nyayasetu_db TO nyayasetu;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO nyayasetu;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO nyayasetu;

