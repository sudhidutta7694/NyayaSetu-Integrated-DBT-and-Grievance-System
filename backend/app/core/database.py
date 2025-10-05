"""
Database configuration and connection management
"""

import asyncio
from typing import AsyncGenerator
from prisma import Prisma
from prisma.errors import PrismaError
import structlog

from app.core.config import settings
from app.core.exceptions import DatabaseException

logger = structlog.get_logger()

# Global Prisma client instance
prisma_client: Prisma = None


async def get_prisma_client() -> Prisma:
    """Get Prisma client instance"""
    global prisma_client
    if prisma_client is None:
        try:
            prisma_client = Prisma()
            await prisma_client.connect()
            logger.info("Prisma client connected successfully")
        except Exception as e:
            logger.error("Failed to connect Prisma client", error=str(e), exc_info=True)
            raise DatabaseException(f"Failed to connect to database: {str(e)}")
    return prisma_client


async def close_prisma_client():
    """Close Prisma client connection"""
    global prisma_client
    if prisma_client:
        await prisma_client.disconnect()
        prisma_client = None


async def init_db():
    """Initialize database connection and run migrations"""
    try:
        client = await get_prisma_client()
        
        # Test database connection
        await client.user.find_first()
        
        logger.info("Database connection established successfully")
        
        # Run any initialization queries here
        await seed_initial_data()
        
    except PrismaError as e:
        logger.error("Database initialization failed", error=str(e))
        raise DatabaseException(f"Database initialization failed: {str(e)}")
    except Exception as e:
        logger.error("Unexpected error during database initialization", error=str(e))
        raise DatabaseException(f"Unexpected database error: {str(e)}")


async def seed_initial_data():
    """Seed initial data into the database"""
    try:
        client = await get_prisma_client()
        
        # Check if admin user exists
        admin_user = await client.user.find_first(
            where={"email": "admin@nyayasetu.gov.in"}
        )
        
        if not admin_user:
            # Create admin user
            await client.user.create(
                data={
                    "email": "admin@nyayasetu.gov.in",
                    "full_name": "System Administrator",
                    "role": "ADMIN",
                    "is_active": True,
                    "is_verified": True,
                    "phone_number": "+919876543210"
                }
            )
            logger.info("Admin user created successfully")
        
        # Check if default roles exist
        roles = ["PUBLIC", "DISTRICT_AUTHORITY", "SOCIAL_WELFARE", "FINANCIAL_INSTITUTION", "ADMIN"]
        
        for role in roles:
            existing_role = await client.role.find_first(where={"name": role})
            if not existing_role:
                await client.role.create(
                    data={
                        "name": role,
                        "description": f"Default {role.lower()} role",
                        "permissions": get_default_permissions(role)
                    }
                )
                logger.info(f"Default role {role} created")
        
        logger.info("Initial data seeding completed")
        
    except Exception as e:
        logger.error("Error seeding initial data", error=str(e))
        # Don't raise exception here as it's not critical for startup


def get_default_permissions(role: str) -> list:
    """Get default permissions for a role"""
    permissions_map = {
        "PUBLIC": [
            "create_application",
            "view_own_application",
            "upload_documents",
            "view_own_profile"
        ],
        "DISTRICT_AUTHORITY": [
            "view_applications",
            "verify_documents",
            "approve_applications",
            "view_reports",
            "manage_cases"
        ],
        "SOCIAL_WELFARE": [
            "view_applications",
            "verify_documents",
            "approve_applications",
            "view_reports",
            "manage_beneficiaries",
            "disburse_funds"
        ],
        "FINANCIAL_INSTITUTION": [
            "view_payment_requests",
            "process_payments",
            "view_transaction_history",
            "generate_reports"
        ],
        "ADMIN": [
            "manage_users",
            "manage_roles",
            "view_all_data",
            "system_configuration",
            "audit_logs"
        ]
    }
    
    return permissions_map.get(role, [])


# Database dependency for FastAPI
async def get_database() -> AsyncGenerator[Prisma, None]:
    """Database dependency for FastAPI routes"""
    client = await get_prisma_client()
    try:
        yield client
    except Exception as e:
        error_msg = str(e) if str(e) else f"Unknown database error: {type(e).__name__}"
        logger.error("Database error in request", error=error_msg, exc_info=True)
        raise DatabaseException(f"Database error: {error_msg}")
    finally:
        # Don't close the client here as it's a global instance
        pass