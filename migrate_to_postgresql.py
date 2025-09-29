#!/usr/bin/env python3
"""
Migration script to transfer data from SQLite to PostgreSQL
"""
import sqlite3
import os
import sys
import logging
from datetime import datetime

# Add the current directory to Python path to allow app imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.postgresql import engine, SessionLocal, init_postgresql_db
from sqlalchemy import text

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def migrate_data():
    """Migrate data from SQLite to PostgreSQL"""
    sqlite_db_path = "game.db"

    if not os.path.exists(sqlite_db_path):
        logger.warning(f"SQLite database {sqlite_db_path} not found. Nothing to migrate.")
        return

    logger.info("Starting migration from SQLite to PostgreSQL...")

    # Initialize PostgreSQL database
    init_postgresql_db()

    # Connect to SQLite
    sqlite_conn = sqlite3.connect(sqlite_db_path)
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

    # Connect to PostgreSQL
    pg_session = SessionLocal()

    try:
        # Get all table names from SQLite
        sqlite_cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row[0] for row in sqlite_cursor.fetchall()]

        for table_name in tables:
            logger.info(f"Migrating table: {table_name}")

            # Get all data from SQLite table
            sqlite_cursor.execute(f"SELECT * FROM {table_name}")
            rows = sqlite_cursor.fetchall()

            if not rows:
                logger.info(f"Table {table_name} is empty, skipping...")
                continue

            # Get column names
            column_names = [description[0] for description in sqlite_cursor.description]

            # Clear existing data in PostgreSQL table (optional - remove if you want to preserve existing data)
            pg_session.execute(text(f"DELETE FROM {table_name}"))

            # Insert data into PostgreSQL
            for row in rows:
                # Convert row to dict
                row_dict = dict(row)

                # Handle different column types and prepare values
                values = []
                placeholders = []
                for col_name in column_names:
                    value = row_dict[col_name]

                    # Handle boolean values
                    if isinstance(value, int) and col_name in ['game_over', 'success', 'new_stage_start', 'is_guest', 'is_ready', 'is_active']:
                        value = bool(value)

                    values.append(value)
                    placeholders.append(f":{col_name}")

                # Create INSERT statement
                columns_str = ', '.join(column_names)
                placeholders_str = ', '.join(placeholders)
                insert_sql = f"INSERT INTO {table_name} ({columns_str}) VALUES ({placeholders_str})"

                try:
                    pg_session.execute(text(insert_sql), row_dict)
                except Exception as e:
                    logger.error(f"Error inserting row into {table_name}: {e}")
                    logger.error(f"Row data: {row_dict}")
                    continue

            # Update sequences for SERIAL columns
            if table_name in ['users', 'game_results', 'tournament_participants', 'tournament_events']:
                try:
                    # Get the maximum ID from the table
                    result = pg_session.execute(text(f"SELECT MAX(id) FROM {table_name}"))
                    max_id = result.scalar()
                    if max_id:
                        # Update the sequence
                        sequence_name = f"{table_name}_id_seq"
                        pg_session.execute(text(f"SELECT setval('{sequence_name}', {max_id})"))
                        logger.info(f"Updated sequence {sequence_name} to {max_id}")
                except Exception as e:
                    logger.warning(f"Could not update sequence for {table_name}: {e}")

            logger.info(f"Migrated {len(rows)} rows from {table_name}")

        # Commit all changes
        pg_session.commit()
        logger.info("Migration completed successfully!")

        # Create backup of SQLite database
        backup_name = f"game_backup_{datetime.now().strftime('%Y%m%d_%H%M%S')}.db"
        os.rename(sqlite_db_path, backup_name)
        logger.info(f"SQLite database backed up as {backup_name}")

    except Exception as e:
        logger.error(f"Migration failed: {e}")
        pg_session.rollback()
        raise
    finally:
        sqlite_conn.close()
        pg_session.close()

def verify_migration():
    """Verify that the migration was successful"""
    logger.info("Verifying migration...")

    pg_session = SessionLocal()
    try:
        # Check that tables exist and have data
        tables = ['users', 'game_sessions', 'game_results', 'tournaments', 'tournament_participants',
                 'tournament_game_sessions', 'tournament_events']

        for table_name in tables:
            result = pg_session.execute(text(f"SELECT COUNT(*) FROM {table_name}"))
            count = result.scalar()
            logger.info(f"Table {table_name}: {count} rows")

        logger.info("Migration verification completed!")

    except Exception as e:
        logger.error(f"Verification failed: {e}")
        raise
    finally:
        pg_session.close()

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(description='Migrate data from SQLite to PostgreSQL')
    parser.add_argument('--verify-only', action='store_true', help='Only verify the migration')
    parser.add_argument('--database-url', help='PostgreSQL database URL (overrides environment variable)')

    args = parser.parse_args()

    if args.database_url:
        os.environ['DATABASE_URL'] = args.database_url

    # Check if PostgreSQL environment variables are set
    database_url = os.getenv('DATABASE_URL')
    if not database_url or 'postgresql' not in database_url:
        logger.error("DATABASE_URL environment variable must be set to a PostgreSQL connection string")
        logger.error("Example: postgresql://username:password@localhost/database_name")
        sys.exit(1)

    try:
        if args.verify_only:
            verify_migration()
        else:
            migrate_data()
            verify_migration()
    except Exception as e:
        logger.error(f"Migration process failed: {e}")
        sys.exit(1)