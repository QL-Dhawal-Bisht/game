#!/usr/bin/env python3
"""
Setup script for PostgreSQL database initialization
"""
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
import os
import sys

# Add the app directory to the path so we can import our modules
sys.path.append('./app')

# Database connection details
DB_NAME = "ai_escape_room"
DB_USER = "gameuser"
DB_PASS = "gamepass123"
DB_HOST = "localhost"

def setup_database():
    """Setup PostgreSQL database with proper permissions"""

    print("🐘 Setting up PostgreSQL database...")

    # Connect as postgres user to create database and user
    try:
        # Connect to PostgreSQL server (not specific database)
        conn = psycopg2.connect(
            host=DB_HOST,
            user="postgres",
            database="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Drop and recreate database for clean setup
        print(f"📦 Creating database '{DB_NAME}'...")
        cursor.execute(f"DROP DATABASE IF EXISTS {DB_NAME}")
        cursor.execute(f"CREATE DATABASE {DB_NAME}")

        # Drop and recreate user
        print(f"👤 Creating user '{DB_USER}'...")
        cursor.execute(f"DROP USER IF EXISTS {DB_USER}")
        cursor.execute(f"CREATE USER {DB_USER} WITH PASSWORD '{DB_PASS}'")

        # Grant all privileges
        cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER}")
        cursor.execute(f"ALTER USER {DB_USER} CREATEDB")

        cursor.close()
        conn.close()

        print("✅ Database and user created successfully!")

    except psycopg2.Error as e:
        print(f"❌ Error setting up database: {e}")
        return False

    # Connect to the new database and set up schema permissions
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user="postgres"
        )
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        print("🔐 Setting up schema permissions...")
        cursor.execute(f"GRANT ALL ON SCHEMA public TO {DB_USER}")
        cursor.execute(f"GRANT CREATE ON SCHEMA public TO {DB_USER}")
        cursor.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO {DB_USER}")
        cursor.execute(f"ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO {DB_USER}")

        cursor.close()
        conn.close()

        print("✅ Schema permissions set successfully!")

    except psycopg2.Error as e:
        print(f"❌ Error setting up schema permissions: {e}")
        return False

    return True

def initialize_tables():
    """Initialize game tables using our existing init function"""
    print("📋 Initializing game tables...")

    # Set environment variables
    os.environ['USE_POSTGRESQL'] = 'true'
    os.environ['DATABASE_URL'] = f'postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}'

    try:
        from database.connection import init_db
        init_db()
        print("✅ All game tables initialized successfully!")
        return True
    except Exception as e:
        print(f"❌ Error initializing tables: {e}")
        return False

def test_connection():
    """Test the database connection and show tables"""
    print("🔍 Testing database connection...")

    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASS
        )
        cursor = conn.cursor()

        # List all tables
        cursor.execute("""
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
            ORDER BY table_name
        """)
        tables = cursor.fetchall()

        print("📊 Tables in database:")
        for table in tables:
            print(f"  ✓ {table[0]}")

        cursor.close()
        conn.close()

        print("✅ Database connection test successful!")
        return True

    except psycopg2.Error as e:
        print(f"❌ Connection test failed: {e}")
        return False

if __name__ == "__main__":
    print("🎮 AI Escape Room - PostgreSQL Setup")
    print("=" * 50)

    # Step 1: Setup database and user
    if not setup_database():
        print("❌ Database setup failed!")
        exit(1)

    # Step 2: Initialize tables
    if not initialize_tables():
        print("❌ Table initialization failed!")
        exit(1)

    # Step 3: Test connection
    if not test_connection():
        print("❌ Connection test failed!")
        exit(1)

    print("=" * 50)
    print("🎉 PostgreSQL setup completed successfully!")
    print(f"📝 Database: {DB_NAME}")
    print(f"👤 User: {DB_USER}")
    print(f"🔗 Connection: postgresql://{DB_USER}:{DB_PASS}@{DB_HOST}/{DB_NAME}")
    print("")
    print("💡 Your application is now configured to use PostgreSQL!")
    print("💡 Restart your FastAPI server to use the new database.")