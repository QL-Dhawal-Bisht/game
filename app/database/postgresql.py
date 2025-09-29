from sqlalchemy import create_engine, text, Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.sql import func
from config.settings import DATABASE_URL
import logging

logger = logging.getLogger(__name__)

# Create SQLAlchemy engine
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db() -> Session:
    """Get database session"""
    db = SessionLocal()
    try:
        return db
    finally:
        db.close()


def get_db_raw():
    """Get raw database connection with dict-like row access for backward compatibility"""
    class DictRow:
        def __init__(self, row, columns):
            self._row = row
            self._columns = columns

        def __getitem__(self, key):
            if isinstance(key, int):
                return self._row[key]
            return getattr(self._row, key)

        def keys(self):
            return [col.name for col in self._columns]

    class DictConnection:
        def __init__(self, session):
            self.session = session

        def execute(self, query, params=None):
            if params:
                result = self.session.execute(text(query), params)
            else:
                result = self.session.execute(text(query))
            return DictCursor(result, self.session)

        def commit(self):
            self.session.commit()

        def close(self):
            self.session.close()

    class DictCursor:
        def __init__(self, result, session):
            self.result = result
            self.session = session
            self._rows = None

        def fetchone(self):
            if self._rows is None:
                try:
                    row = self.result.fetchone()
                    if row:
                        return DictRow(row, self.result.keys())
                    return None
                except Exception:
                    return None
            return None

        def fetchall(self):
            try:
                rows = self.result.fetchall()
                return [DictRow(row, self.result.keys()) for row in rows]
            except Exception:
                return []

    session = SessionLocal()
    return DictConnection(session)


def init_postgresql_db():
    """Initialize PostgreSQL database tables"""
    try:
        with engine.connect() as conn:
            # Users table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    password_hash TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    total_score INTEGER DEFAULT 0,
                    games_played INTEGER DEFAULT 0,
                    best_score INTEGER DEFAULT 0
                )
            """))

            # Game sessions table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS game_sessions (
                    id VARCHAR(255) PRIMARY KEY,
                    user_id INTEGER,
                    stage INTEGER DEFAULT 1,
                    score INTEGER DEFAULT 0,
                    attempts INTEGER DEFAULT 0,
                    extracted_keys TEXT DEFAULT '[]',
                    conversation_history TEXT DEFAULT '[]',
                    character_mood VARCHAR(50) DEFAULT 'helpful',
                    resistance_level INTEGER DEFAULT 1,
                    failed_attempts INTEGER DEFAULT 0,
                    game_over BOOLEAN DEFAULT FALSE,
                    success BOOLEAN DEFAULT FALSE,
                    new_stage_start BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """))

            # Game results table for leaderboard
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS game_results (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER,
                    session_id VARCHAR(255),
                    final_score INTEGER,
                    stages_completed INTEGER,
                    total_attempts INTEGER,
                    completion_time INTEGER,
                    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """))

            # Tournaments table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS tournaments (
                    id VARCHAR(255) PRIMARY KEY,
                    room_code VARCHAR(255) UNIQUE NOT NULL,
                    host_user_id INTEGER,
                    stage INTEGER DEFAULT 1,
                    status VARCHAR(50) DEFAULT 'waiting',
                    max_participants INTEGER DEFAULT 2,
                    tournament_mode VARCHAR(50) DEFAULT 'head_to_head',
                    time_limit INTEGER DEFAULT 600,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    started_at TIMESTAMP,
                    completed_at TIMESTAMP,
                    winner_user_id INTEGER,
                    FOREIGN KEY (host_user_id) REFERENCES users (id),
                    FOREIGN KEY (winner_user_id) REFERENCES users (id)
                )
            """))

            # Tournament participants table
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS tournament_participants (
                    id SERIAL PRIMARY KEY,
                    tournament_id VARCHAR(255),
                    user_id INTEGER,
                    is_guest BOOLEAN DEFAULT FALSE,
                    guest_name VARCHAR(255),
                    is_ready BOOLEAN DEFAULT FALSE,
                    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    final_score INTEGER DEFAULT 0,
                    keys_found INTEGER DEFAULT 0,
                    completion_time INTEGER,
                    position INTEGER,
                    FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
                    FOREIGN KEY (user_id) REFERENCES users (id),
                    UNIQUE(tournament_id, user_id)
                )
            """))

            # Tournament game sessions
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS tournament_game_sessions (
                    id VARCHAR(255) PRIMARY KEY,
                    tournament_id VARCHAR(255),
                    participant_id INTEGER,
                    stage INTEGER DEFAULT 1,
                    score INTEGER DEFAULT 0,
                    time_taken INTEGER DEFAULT 0,
                    status VARCHAR(50) DEFAULT 'active',
                    session_data TEXT,
                    current_keys TEXT DEFAULT '[]',
                    start_time TIMESTAMP,
                    end_time TIMESTAMP,
                    completed_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT FALSE,
                    FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
                    FOREIGN KEY (participant_id) REFERENCES tournament_participants (id)
                )
            """))

            # Tournament events
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS tournament_events (
                    id SERIAL PRIMARY KEY,
                    tournament_id VARCHAR(255),
                    participant_id INTEGER,
                    event_type VARCHAR(100),
                    event_data TEXT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
                    FOREIGN KEY (participant_id) REFERENCES tournament_participants (id)
                )
            """))

            # Successful prompt exploitation history
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS prompt_exploitation_history (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER,
                    session_id VARCHAR(255),
                    stage INTEGER,
                    user_prompt TEXT,
                    ai_response TEXT,
                    keys_extracted TEXT,
                    conversation_context TEXT,
                    exploitation_technique VARCHAR(100),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            """))

            conn.commit()
            logger.info("PostgreSQL database tables initialized successfully")

    except Exception as e:
        logger.error(f"Error initializing PostgreSQL database: {e}")
        raise