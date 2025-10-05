#!/bin/bash

# Backend startup script
set -e

echo "Starting NyayaSetu Backend..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until pg_isready -h $POSTGRES_HOST -p $POSTGRES_PORT -U $POSTGRES_USER; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

# Run database migrations
echo "Running database migrations..."
prisma migrate deploy

# Start the application
echo "Starting FastAPI application..."
exec uvicorn main:app --host 0.0.0.0 --port 8000
