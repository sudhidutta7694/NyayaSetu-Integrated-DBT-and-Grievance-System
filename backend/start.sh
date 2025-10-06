#!/bin/bash

# Backend startup script
set -e

echo "Starting NyayaSetu Backend..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
python -c "
import psycopg2
import time
import os

def wait_for_db():
    max_attempts = 30
    attempt = 0
    while attempt < max_attempts:
        try:
            conn = psycopg2.connect(
                host=os.environ.get('POSTGRES_HOST', 'postgres'),
                port=os.environ.get('POSTGRES_PORT', '5432'),
                user=os.environ.get('POSTGRES_USER', 'nyayasetu'),
                password='password',
                database=os.environ.get('POSTGRES_DB', 'nyayasetu_db')
            )
            conn.close()
            print('Database is ready!')
            return True
        except psycopg2.OperationalError:
            attempt += 1
            print(f'Database not ready, attempt {attempt}/{max_attempts}. Waiting...')
            time.sleep(2)
    
    print('Failed to connect to database after maximum attempts')
    return False

wait_for_db()
"

# Initialize Alembic if not already initialized
if [ ! -d "alembic/versions" ]; then
    echo "Creating alembic versions directory..."
    mkdir -p alembic/versions
fi

# Check if we have any migration files
if [ -z "$(ls -A alembic/versions/)" ]; then
    echo "No migration files found. Creating initial migration..."
    alembic revision --autogenerate -m "Initial migration"
fi

# Run database migrations
echo "Running database migrations..."
alembic upgrade head

# Start the application
echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
