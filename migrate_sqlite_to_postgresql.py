#!/usr/bin/env python3
"""
Migration script to move data from SQLite to PostgreSQL
Run this when you want to upgrade from SQLite to PostgreSQL
"""
import sqlite3
import psycopg2
import json
import os
from dotenv import load_dotenv

load_dotenv()

def migrate_data():
    """Migrate data from SQLite to PostgreSQL"""

    print("🔄 Starting SQLite to PostgreSQL migration...")

    # SQLite connection
    sqlite_conn = sqlite3.connect("game.db")
    sqlite_conn.row_factory = sqlite3.Row
    sqlite_cursor = sqlite_conn.cursor()

    # PostgreSQL connection
    postgres_url = os.getenv("DATABASE_URL")
    if not postgres_url:
        print("❌ DATABASE_URL not found in environment variables")
        return False

    try:
        postgres_conn = psycopg2.connect(postgres_url)
        postgres_cursor = postgres_conn.cursor()

        # Initialize PostgreSQL tables first
        print("📋 Initializing PostgreSQL tables...")
        os.environ['USE_POSTGRESQL'] = 'true'
        from app.database.connection import init_db
        init_db()

        # Migrate users table
        print("👥 Migrating users...")
        sqlite_cursor.execute("SELECT * FROM users")
        users = sqlite_cursor.fetchall()

        for user in users:
            postgres_cursor.execute("""
                INSERT INTO users (id, username, email, password_hash, created_at, total_score, games_played, best_score)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, tuple(user))

        print(f"✅ Migrated {len(users)} users")

        # Migrate game_sessions table
        print("🎮 Migrating game sessions...")
        sqlite_cursor.execute("SELECT * FROM game_sessions")
        sessions = sqlite_cursor.fetchall()

        for session in sessions:
            postgres_cursor.execute("""
                INSERT INTO game_sessions
                (id, user_id, stage, score, attempts, extracted_keys, conversation_history,
                 character_mood, resistance_level, failed_attempts, game_over, success,
                 new_stage_start, created_at, updated_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, tuple(session))

        print(f"✅ Migrated {len(sessions)} game sessions")

        # Migrate prompt_exploitation_history table
        print("🛡️ Migrating security logs...")
        sqlite_cursor.execute("SELECT * FROM prompt_exploitation_history")
        exploits = sqlite_cursor.fetchall()

        for exploit in exploits:
            postgres_cursor.execute("""
                INSERT INTO prompt_exploitation_history
                (id, user_id, session_id, stage, user_prompt, ai_response, keys_extracted,
                 conversation_context, exploitation_technique, created_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, tuple(exploit))

        print(f"✅ Migrated {len(exploits)} security logs")

        # Migrate game_results table
        print("🏆 Migrating game results...")
        sqlite_cursor.execute("SELECT * FROM game_results")
        results = sqlite_cursor.fetchall()

        for result in results:
            postgres_cursor.execute("""
                INSERT INTO game_results
                (id, user_id, session_id, final_score, stages_completed, total_attempts,
                 completion_time, completed_at)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON CONFLICT (id) DO NOTHING
            """, tuple(result))

        print(f"✅ Migrated {len(results)} game results")

        # Commit all changes
        postgres_conn.commit()

        print("🎉 Migration completed successfully!")
        print(f"📊 Summary:")
        print(f"   - Users: {len(users)}")
        print(f"   - Game Sessions: {len(sessions)}")
        print(f"   - Security Logs: {len(exploits)}")
        print(f"   - Game Results: {len(results)}")

        return True

    except Exception as e:
        print(f"❌ Migration failed: {e}")
        postgres_conn.rollback()
        return False

    finally:
        sqlite_conn.close()
        postgres_conn.close()

if __name__ == "__main__":
    print("🚀 AI Escape Room - Database Migration Tool")
    print("=" * 50)

    # Check if SQLite database exists
    if not os.path.exists("game.db"):
        print("❌ SQLite database (game.db) not found!")
        exit(1)

    # Check if PostgreSQL URL is configured
    if not os.getenv("DATABASE_URL"):
        print("❌ PostgreSQL DATABASE_URL not configured!")
        print("💡 Set DATABASE_URL in your environment variables")
        exit(1)

    # Confirm migration
    response = input("⚠️  This will migrate data from SQLite to PostgreSQL. Continue? (y/n): ")
    if response.lower() != 'y':
        print("Migration cancelled.")
        exit(0)

    # Run migration
    success = migrate_data()

    if success:
        print("\n✅ Migration completed!")
        print("💡 Update your environment variable: USE_POSTGRESQL=true")
        print("💡 Restart your application to use PostgreSQL")
    else:
        print("\n❌ Migration failed!")
        print("💡 Check the error messages above and try again")