# Alembic Migrations

This folder contains Alembic migration scripts for SQLAlchemy models. To generate and apply migrations:

1. Install dependencies:
   ```sh
   pip install sqlalchemy alembic psycopg2-binary
   ```
2. Initialize Alembic (if not already):
   ```sh
   alembic init alembic
   ```
3. Edit `alembic.ini` to set your database URL.
4. Generate migration:
   ```sh
   alembic revision --autogenerate -m "Initial migration"
   ```
5. Apply migration:
   ```sh
   alembic upgrade head
   ```

Models are defined in `backend/models/`.
