"""
Seed UIDAI database with test data
Run this after migrations: python seed_uidai.py
"""
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL")

def seed_data():
    """Insert seed data into UIDAI table"""
    engine = create_engine(DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()
    
    try:
        # Insert UIDAI seed data
        session.execute(text("""
            INSERT INTO uidai (
                aadhaar_number,
                name,
                father_name,
                date_of_birth,
                gender,
                address,
                phone_number,
                created_at,
                updated_at
            ) VALUES (
                '362851176122',
                'Ram Kumar Sharma',
                'Rameshwar Sharma',
                '1985-06-15',
                'MALE',
                '123, Gandhi Nagar, New Delhi - 110001',
                '8637310611',
                NOW(),
                NOW()
            )
            ON CONFLICT (aadhaar_number) DO NOTHING;
        """))
        
        session.commit()
        print("✅ UIDAI seed data inserted successfully!")
        return True
        
    except Exception as e:
        session.rollback()
        print(f"❌ Error inserting seed data: {e}")
        return False
        
    finally:
        session.close()
        engine.dispose()

if __name__ == "__main__":
    success = seed_data()
    sys.exit(0 if success else 1)