#!/bin/bash
set -e
mkdir -p alembic/versions
if [ -z "$(ls -A alembic/versions)" ]; then
   alembic revision --autogenerate -m "initial_migration"
fi
alembic upgrade head
python seed_uidai.py || true
exec uvicorn main:app --host 0.0.0.0 --port 8000 --reload
