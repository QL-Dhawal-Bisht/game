web: uvicorn main:app --host 0.0.0.0 --port $PORT
release: python -c "from app.database.connection import init_db; import os; os.environ.setdefault('USE_POSTGRESQL', 'true'); init_db()"