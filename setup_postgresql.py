#!/usr/bin/env python3
"""
Setup script for PostgreSQL migration
"""
import os
import sys

def create_env_template():
    """Create a template .env file with PostgreSQL settings"""
    env_template = """# PostgreSQL Configuration
USE_POSTGRESQL=true
DATABASE_URL=postgresql://username:password@localhost/ai_escape_room

# Security settings
SECRET_KEY=your-secret-key-change-this

# Copy your existing environment variables here
"""

    env_file = ".env.postgresql"
    with open(env_file, "w") as f:
        f.write(env_template)

    print(f"Created {env_file} template file.")
    print("Please update the DATABASE_URL with your PostgreSQL connection details.")
    print("Then copy/rename this file to .env to use PostgreSQL.")

def show_migration_instructions():
    """Show migration instructions"""
    instructions = """
PostgreSQL Migration Instructions:
=================================

1. Install PostgreSQL (if not already installed):
   - Ubuntu/Debian: sudo apt install postgresql postgresql-contrib
   - macOS: brew install postgresql
   - Windows: Download from https://www.postgresql.org/download/

2. Create a database:
   sudo -u postgres createdb ai_escape_room
   # Or with a specific user:
   createdb -U username ai_escape_room

3. Update your .env file with PostgreSQL settings:
   USE_POSTGRESQL=true
   DATABASE_URL=postgresql://username:password@localhost/ai_escape_room

4. Run the migration:
   python migrate_to_postgresql.py

5. Your SQLite database will be backed up automatically.

6. Start your application - it will now use PostgreSQL!

Note: All existing functionality will remain the same.
"""
    print(instructions)

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "--env-template":
        create_env_template()
    else:
        show_migration_instructions()

        if input("\nCreate .env template file? (y/N): ").lower() == 'y':
            create_env_template()