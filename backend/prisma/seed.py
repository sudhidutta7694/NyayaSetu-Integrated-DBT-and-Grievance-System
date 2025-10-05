"""
Database seeding script for NyayaSetu
"""

import asyncio
from datetime import datetime, timedelta
from decimal import Decimal
from prisma import Prisma


async def main():
    """Seed the database with initial data"""
    prisma = Prisma()
    await prisma.connect()

    try:
        # Create roles
        roles_data = [
            {
                "id": "role_public",
                "name": "PUBLIC",
                "description": "General public user role",
                "permissions": ["create_application", "view_own_application", "upload_documents", "view_own_profile"],
                "is_active": True,
            },
            {
                "id": "role_district",
                "name": "DISTRICT_AUTHORITY",
                "description": "District authority role",
                "permissions": ["view_applications", "verify_documents", "approve_applications", "view_reports", "manage_cases"],
                "is_active": True,
            },
            {
                "id": "role_welfare",
                "name": "SOCIAL_WELFARE",
                "description": "Social welfare department role",
                "permissions": ["view_applications", "verify_documents", "approve_applications", "view_reports", "manage_beneficiaries", "disburse_funds"],
                "is_active": True,
            },
            {
                "id": "role_financial",
                "name": "FINANCIAL_INSTITUTION",
                "description": "Financial institution role",
                "permissions": ["view_payment_requests", "process_payments", "view_transaction_history", "generate_reports"],
                "is_active": True,
            },
            {
                "id": "role_admin",
                "name": "ADMIN",
                "description": "System administrator role",
                "permissions": ["manage_users", "manage_roles", "view_all_data", "system_configuration", "audit_logs"],
                "is_active": True,
            },
        ]

        for role_data in roles_data:
            try:
                await prisma.role.create(data=role_data)
            except:
                # Role already exists, skip
                pass

        # Create admin user
        try:
            admin_user = await prisma.user.create(
                data={
                    "email": "admin@nyayasetu.gov.in",
                    "phone_number": "+919876543210",
                    "full_name": "System Administrator",
                    "role": "ADMIN",
                    "is_active": True,
                    "is_verified": True,
                }
            )
        except:
            # Admin user already exists, get it
            admin_user = await prisma.user.find_unique(where={"email": "admin@nyayasetu.gov.in"})

        # Create sample users
        sample_users = [
            {
                "email": "john.doe@example.com",
                "phone_number": "+919876543211",
                "full_name": "John Doe",
                "aadhaar_number": "123456789012",
                "date_of_birth": datetime(1990, 1, 1),
                "gender": "MALE",
                "category": "SC",
                "address": "123 Main Street, City",
                "district": "Mumbai",
                "state": "Maharashtra",
                "pincode": "400001",
                "role": "PUBLIC",
                "is_active": True,
                "is_verified": True,
            },
            {
                "email": "jane.smith@example.com",
                "phone_number": "+919876543212",
                "full_name": "Jane Smith",
                "aadhaar_number": "123456789013",
                "date_of_birth": datetime(1985, 5, 15),
                "gender": "FEMALE",
                "category": "ST",
                "address": "456 Park Avenue, Town",
                "district": "Delhi",
                "state": "Delhi",
                "pincode": "110001",
                "role": "PUBLIC",
                "is_active": True,
                "is_verified": True,
            },
            {
                "email": "district.officer@example.com",
                "phone_number": "+919876543213",
                "full_name": "District Officer",
                "date_of_birth": datetime(1980, 3, 20),
                "gender": "MALE",
                "category": "GENERAL",
                "address": "789 Government Building",
                "district": "Bangalore",
                "state": "Karnataka",
                "pincode": "560001",
                "role": "DISTRICT_AUTHORITY",
                "is_active": True,
                "is_verified": True,
            },
            {
                "email": "welfare.officer@example.com",
                "phone_number": "+919876543214",
                "full_name": "Welfare Officer",
                "date_of_birth": datetime(1975, 12, 10),
                "gender": "FEMALE",
                "category": "GENERAL",
                "address": "321 Welfare Office",
                "district": "Chennai",
                "state": "Tamil Nadu",
                "pincode": "600001",
                "role": "SOCIAL_WELFARE",
                "is_active": True,
                "is_verified": True,
            },
            {
                "email": "bank.manager@example.com",
                "phone_number": "+919876543215",
                "full_name": "Bank Manager",
                "date_of_birth": datetime(1982, 8, 25),
                "gender": "MALE",
                "category": "GENERAL",
                "address": "654 Bank Building",
                "district": "Kolkata",
                "state": "West Bengal",
                "pincode": "700001",
                "role": "FINANCIAL_INSTITUTION",
                "is_active": True,
                "is_verified": True,
            },
        ]

        created_users = []
        for user_data in sample_users:
            try:
                user = await prisma.user.create(data=user_data)
                created_users.append(user)
            except:
                # User already exists, get it
                user = await prisma.user.find_unique(where={"email": user_data["email"]})
                if user:
                    created_users.append(user)

        # Create sample applications
        applications_data = [
            {
                "application_number": "NS20241201001",
                "user_id": created_users[0].id,
                "title": "Relief for Caste-based Discrimination",
                "description": "Application for monetary relief under PCR Act",
                "status": "APPROVED",
                "amount_requested": Decimal("50000.00"),
                "amount_approved": Decimal("50000.00"),
                "amount_disbursed": Decimal("50000.00"),
                "bank_account_number": "1234567890123456",
                "bank_ifsc_code": "SBIN0001234",
                "bank_name": "State Bank of India",
                "bank_branch": "Main Branch",
                "account_holder_name": "John Doe",
                "submitted_at": datetime.utcnow() - timedelta(days=5),
            },
            {
                "application_number": "NS20241201002",
                "user_id": created_users[1].id,
                "title": "Compensation for Atrocity",
                "description": "Application for compensation under PoA Act",
                "status": "UNDER_REVIEW",
                "amount_requested": Decimal("100000.00"),
                "bank_account_number": "2345678901234567",
                "bank_ifsc_code": "HDFC0001234",
                "bank_name": "HDFC Bank",
                "bank_branch": "City Branch",
                "account_holder_name": "Jane Smith",
                "submitted_at": datetime.utcnow() - timedelta(days=3),
            },
            {
                "application_number": "NS20241201003",
                "user_id": created_users[0].id,
                "title": "Inter-caste Marriage Incentive",
                "description": "Application for inter-caste marriage incentive",
                "status": "DRAFT",
                "amount_requested": Decimal("25000.00"),
            },
        ]

        created_applications = []
        for app_data in applications_data:
            try:
                application = await prisma.application.create(data=app_data)
                created_applications.append(application)
            except:
                # Application already exists, get it
                application = await prisma.application.find_unique(where={"application_number": app_data["application_number"]})
                if application:
                    created_applications.append(application)

        # Create sample documents
        documents_data = [
            {
                "application_id": created_applications[0].id,
                "user_id": created_users[0].id,
                "document_type": "CASTE_CERTIFICATE",
                "document_name": "Caste Certificate.pdf",
                "file_path": "/uploads/documents/caste_cert_1.pdf",
                "file_size": 1024000,
                "mime_type": "application/pdf",
                "status": "VERIFIED",
                "verified_by": created_users[2].id,
                "verified_at": datetime.utcnow() - timedelta(days=2),
            },
            {
                "application_id": created_applications[0].id,
                "user_id": created_users[0].id,
                "document_type": "BANK_PASSBOOK",
                "document_name": "Bank Passbook.pdf",
                "file_path": "/uploads/documents/passbook_1.pdf",
                "file_size": 2048000,
                "mime_type": "application/pdf",
                "status": "VERIFIED",
                "verified_by": created_users[2].id,
                "verified_at": datetime.utcnow() - timedelta(days=2),
            },
            {
                "application_id": created_applications[1].id,
                "user_id": created_users[1].id,
                "document_type": "CASTE_CERTIFICATE",
                "document_name": "Caste Certificate.pdf",
                "file_path": "/uploads/documents/caste_cert_2.pdf",
                "file_size": 1536000,
                "mime_type": "application/pdf",
                "status": "PENDING",
            },
            {
                "application_id": created_applications[1].id,
                "user_id": created_users[1].id,
                "document_type": "FIR_COPY",
                "document_name": "FIR Copy.pdf",
                "file_path": "/uploads/documents/fir_2.pdf",
                "file_size": 512000,
                "mime_type": "application/pdf",
                "status": "PENDING",
            },
        ]

        for doc_data in documents_data:
            await prisma.document.create(data=doc_data)

        # Create sample cases
        cases_data = [
            {
                "case_number": "CS20241201001",
                "application_id": created_applications[0].id,
                "user_id": created_users[0].id,
                "title": "Caste-based Discrimination Case",
                "description": "Case registered for caste-based discrimination incident",
                "fir_number": "FIR/2024/001",
                "police_station": "Main Police Station",
                "district": "Mumbai",
                "state": "Maharashtra",
                "status": "IN_COURT",
                "registered_at": datetime.utcnow() - timedelta(days=7),
            },
            {
                "case_number": "CS20241201002",
                "application_id": created_applications[1].id,
                "user_id": created_users[1].id,
                "title": "Atrocity Case",
                "description": "Case registered under PoA Act for atrocity",
                "fir_number": "FIR/2024/002",
                "police_station": "City Police Station",
                "district": "Delhi",
                "state": "Delhi",
                "status": "UNDER_INVESTIGATION",
                "registered_at": datetime.utcnow() - timedelta(days=4),
            },
        ]

        created_cases = []
        for case_data in cases_data:
            try:
                case = await prisma.case.create(data=case_data)
                created_cases.append(case)
            except:
                # Case already exists, get it
                case = await prisma.case.find_unique(where={"case_number": case_data["case_number"]})
                if case:
                    created_cases.append(case)

        # Create sample notifications
        notifications_data = [
            {
                "user_id": created_users[0].id,
                "title": "Application Approved",
                "message": "Your application NS20241201001 has been approved and funds have been disbursed.",
                "type": "SUCCESS",
                "is_read": True,
                "sent_at": datetime.utcnow() - timedelta(days=1),
                "application_id": created_applications[0].id,
            },
            {
                "user_id": created_users[1].id,
                "title": "Document Verification Required",
                "message": "Please upload additional documents for your application NS20241201002.",
                "type": "INFO",
                "is_read": False,
                "sent_at": datetime.utcnow() - timedelta(hours=2),
                "application_id": created_applications[1].id,
            },
            {
                "user_id": created_users[0].id,
                "title": "Case Update",
                "message": "Your case CS20241201001 has been filed in court.",
                "type": "INFO",
                "is_read": False,
                "sent_at": datetime.utcnow() - timedelta(hours=1),
                "case_id": created_cases[0].id,
            },
        ]

        for notif_data in notifications_data:
            await prisma.notification.create(data=notif_data)

        # Create sample disbursements
        disbursements_data = [
            {
                "application_id": created_applications[0].id,
                "amount": Decimal("50000.00"),
                "transaction_id": "TXN123456789",
                "bank_reference": "BANK_REF_001",
                "status": "COMPLETED",
                "disbursed_by": created_users[3].id,
                "disbursed_at": datetime.utcnow() - timedelta(days=1),
            },
        ]

        for disb_data in disbursements_data:
            await prisma.disbursement.create(data=disb_data)

        print("✅ Database seeded successfully!")

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        await prisma.disconnect()


if __name__ == "__main__":
    asyncio.run(main())
