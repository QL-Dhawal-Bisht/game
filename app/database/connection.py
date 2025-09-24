import sqlite3


def get_db():
    """Get database connection with row factory"""
    conn = sqlite3.connect("game.db")
    conn.row_factory = sqlite3.Row
    return conn


def init_db():
    """Initialize database tables"""
    conn = sqlite3.connect("game.db")
    cursor = conn.cursor()
    
    # Users table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            total_score INTEGER DEFAULT 0,
            games_played INTEGER DEFAULT 0,
            best_score INTEGER DEFAULT 0
        )
    """)
    
    # Game sessions table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS game_sessions (
            id TEXT PRIMARY KEY,
            user_id INTEGER,
            stage INTEGER DEFAULT 1,
            score INTEGER DEFAULT 0,
            attempts INTEGER DEFAULT 0,
            extracted_keys TEXT DEFAULT '[]',
            conversation_history TEXT DEFAULT '[]',
            character_mood TEXT DEFAULT 'helpful',
            resistance_level INTEGER DEFAULT 1,
            failed_attempts INTEGER DEFAULT 0,
            game_over BOOLEAN DEFAULT FALSE,
            success BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Game results table for leaderboard
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS game_results (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            session_id TEXT,
            final_score INTEGER,
            stages_completed INTEGER,
            total_attempts INTEGER,
            completion_time INTEGER,
            completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    
    # Tournaments table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tournaments (
            id TEXT PRIMARY KEY,
            room_code TEXT UNIQUE NOT NULL,
            host_user_id INTEGER,
            stage INTEGER DEFAULT 1,
            status TEXT DEFAULT 'waiting', -- waiting, ready, active, completed, cancelled
            max_participants INTEGER DEFAULT 2,
            tournament_mode TEXT DEFAULT 'head_to_head', -- head_to_head, battle_royale
            time_limit INTEGER DEFAULT 600, -- 10 minutes in seconds
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            started_at TIMESTAMP,
            completed_at TIMESTAMP,
            winner_user_id INTEGER,
            FOREIGN KEY (host_user_id) REFERENCES users (id),
            FOREIGN KEY (winner_user_id) REFERENCES users (id)
        )
    """)
    
    # Tournament participants table
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tournament_participants (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_id TEXT,
            user_id INTEGER,
            is_guest BOOLEAN DEFAULT FALSE,
            guest_name TEXT,
            is_ready BOOLEAN DEFAULT FALSE,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            final_score INTEGER DEFAULT 0,
            keys_found INTEGER DEFAULT 0,
            completion_time INTEGER,
            position INTEGER, -- final ranking position
            FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
            FOREIGN KEY (user_id) REFERENCES users (id),
            UNIQUE(tournament_id, user_id)
        )
    """)
    
    # Tournament game sessions (extends regular game sessions for tournament context)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tournament_game_sessions (
            id TEXT PRIMARY KEY,
            tournament_id TEXT,
            participant_id INTEGER,
            stage INTEGER DEFAULT 1,
            score INTEGER DEFAULT 0,
            time_taken INTEGER DEFAULT 0,
            status TEXT DEFAULT 'active',
            session_data TEXT, -- JSON storing game state
            current_keys TEXT DEFAULT '[]',
            start_time TIMESTAMP,
            end_time TIMESTAMP,
            completed_at TIMESTAMP,
            is_active BOOLEAN DEFAULT FALSE,
            FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
            FOREIGN KEY (participant_id) REFERENCES tournament_participants (id)
        )
    """)
    
    # Tournament events (for real-time updates)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS tournament_events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            tournament_id TEXT,
            participant_id INTEGER,
            event_type TEXT, -- key_found, stage_complete, ready_status, etc.
            event_data TEXT, -- JSON data
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (tournament_id) REFERENCES tournaments (id),
            FOREIGN KEY (participant_id) REFERENCES tournament_participants (id)
        )
    """)
    
    conn.commit()
    conn.close()
