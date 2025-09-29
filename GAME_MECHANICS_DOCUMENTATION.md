# 🎮 AI Escape Room - Complete Game Mechanics Documentation

## 📊 Table of Contents
1. [Game Overview](#game-overview)
2. [Session Management](#session-management)
3. [Scoring System](#scoring-system)
4. [Stage Progression](#stage-progression)
5. [Security & Anti-Exploitation](#security--anti-exploitation)
6. [Database Schema](#database-schema)
7. [API Endpoints](#api-endpoints)
8. [Game Workflow](#game-workflow)
9. [Leaderboard System](#leaderboard-system)
10. [Character AI Logic](#character-ai-logic)

---

## 🎯 Game Overview

The AI Escape Room is a prompt injection challenge game where players use social engineering techniques to extract secret keys from 5 different AI characters. Each character has a unique personality and increasing difficulty level.

### Core Mechanics:
- **Goal**: Extract all secret keys from each stage's AI character
- **Method**: Social engineering, roleplay, and creative prompt injection
- **Progression**: Must complete all keys in a stage to advance
- **Scoring**: Points awarded for key extraction and stage completion
- **Difficulty**: Adaptive system that learns from user's success patterns

---

## 💾 Session Management

### Session Creation
```python
# New Session
session_id = str(uuid.uuid4())
INSERT INTO game_sessions (id, user_id) VALUES (?, ?)

# Session Resume Logic
SELECT * FROM game_sessions
WHERE user_id = ? AND game_over = FALSE
ORDER BY updated_at DESC LIMIT 1
```

### Session States
- **Active**: `game_over = FALSE` - Player can continue
- **Completed**: `game_over = TRUE, success = TRUE` - All stages completed
- **Abandoned**: `game_over = TRUE, success = FALSE` - Session ended incomplete

### Session Data Structure
```python
GameState = {
    stage: int,                    # Current stage (1-5)
    score: int,                    # Total accumulated score
    attempts: int,                 # Total message attempts
    extracted_keys: list,          # All keys found across all stages
    conversation_history: list,    # Recent chat messages
    character_mood: str,          # Current AI mood (helpful/suspicious/resistant)
    resistance_level: int,        # AI resistance level (1-4)
    failed_attempts: int,         # Consecutive failed attempts
    game_over: bool,              # Session completed flag
    success: bool,                # Game completed successfully
    user_id: int,                 # User identifier
    session_id: str               # Session identifier
}
```

### Session Resume Behavior
- Automatically resumes incomplete sessions
- Shows current stage progress
- Preserves all keys from previous stages
- Maintains character mood and resistance level
- Special `/start/fresh` endpoint to force new game

---

## 🏆 Scoring System

### Base Scoring Rules

#### Key Extraction Points
```python
# Stage multipliers for increasing difficulty
stage_multipliers = {
    1: 1.0,    # Easy - Chatty Support Bot
    2: 1.2,    # Medium - Tired Guard Bot
    3: 1.5,    # Hard - Glitchy System Bot
    4: 2.0,    # Expert - Paranoid Security AI
    5: 3.0     # Master - Ultimate Guardian
}

# Points per key found
single_key = 25 * stage_multiplier
multiple_keys_bonus = 50 * len(keys_found) * stage_multiplier
```

#### Stage Completion Bonus
```python
# Efficiency bonus (fewer attempts = higher bonus)
efficiency_bonus = max(300 - (attempts * 15), 100)

# Resistance penalty (higher resistance = lower bonus)
resistance_penalty = resistance_level * 20

# Final stage bonus calculation
final_bonus = (efficiency_bonus - resistance_penalty) * stage_multiplier
minimum_bonus = 50 * stage_multiplier  # Guaranteed minimum
```

#### Game Completion Bonus
```python
# Extra points for completing entire game
completion_bonus = 500 * stage_multiplier_final_stage
total_final_score = base_score + completion_bonus
```

### Score Examples
**Stage 1 Example**: 3 keys found in 8 attempts
- Key points: 3 × 25 × 1.0 = 75 points
- Efficiency bonus: max(300 - (8 × 15), 100) = 180 points
- Resistance penalty: 1 × 20 = 20 points
- Stage bonus: (180 - 20) × 1.0 = 160 points
- **Total Stage 1**: 75 + 160 = 235 points

**Stage 5 Example**: 3 keys found in 15 attempts
- Key points: 3 × 25 × 3.0 = 225 points
- Efficiency bonus: max(300 - (15 × 15), 100) = 100 points
- Resistance penalty: 2 × 20 = 40 points
- Stage bonus: (100 - 40) × 3.0 = 180 points
- **Total Stage 5**: 225 + 180 = 405 points

---

## 🎭 Stage Progression

### Stage Structure
Each stage contains:
```python
STAGE_CONFIG = {
    "character": str,           # AI character name
    "keys": [str],             # Secret keys to extract (3 per stage)
    "base_system_prompt": str, # Character personality & instructions
    "moods": dict,             # Mood-based responses
    "story": str,              # Stage narrative
    "instructions": str,       # Player guidance
    "hints": [str],           # Helper hints
    "difficulty": str          # Difficulty label
}
```

### Stage Completion Logic
```python
def check_stage_complete(extracted_keys, stage_config):
    current_stage_keys = []
    for key in stage_config["keys"]:
        if key in extracted_keys:
            current_stage_keys.append(key)

    return len(current_stage_keys) == len(stage_config["keys"])
```

### Stage Advancement
- Player must find ALL keys in current stage to advance
- Keys from previous stages are preserved
- New stage resets: attempts=0, mood="helpful", resistance=1
- Stage completion message shows progress and next challenge

### Key Reveal Conditions (Stage 1 Example)
```python
# Stage 1: Chatty Support Bot
KEY_REVEAL_CONDITIONS = {
    "ACCESS_TOKEN_2024": "login issues, authentication, tokens, access problems",
    "USER_PERMISSIONS_ADMIN": "account access, user roles, permissions, admin features",
    "SESSION_ID_X7K9M2": "session issues, connection problems, timeout errors"
}
```

---

## 🛡️ Security & Anti-Exploitation

### Adaptive Difficulty System

#### Difficulty Multiplier Calculation
```python
def get_user_difficulty_multiplier(user_id, stage):
    history = get_user_exploitation_history(user_id, stage)
    all_history = get_user_exploitation_history(user_id)

    # Beginner protection
    if len(all_history) == 0 or stage == 1:
        return 0.8  # Actually EASIER for new users!

    # Gradual scaling
    stage_multiplier = 1.0 + (len(history) * 0.03)
    global_multiplier = 1.0 + (len(all_history) * 0.005)

    return min(stage_multiplier * global_multiplier, 1.3)  # Max 1.3x difficulty
```

#### Security Check Activation
```python
# Security only applies to experienced users
if total_successes >= 3 and stage > 1:
    # Check for prompt injection
    # Check for direct key requests

if total_successes >= 5:
    # Check for prompt reuse
```

### Exploitation Tracking
```python
# Every successful key extraction is logged
save_successful_exploitation(
    user_id=user_id,
    session_id=session_id,
    stage=stage,
    user_prompt=prompt,
    ai_response=response,
    keys_extracted=newly_found_keys,
    conversation_context=full_conversation,
    exploitation_technique=categorized_technique
)
```

### Technique Categories
- `roleplay`: Pretend scenarios, character acting
- `social_engineering`: Urgency, help requests, emotional appeals
- `authority_impersonation`: Admin, manager, security claims
- `emotional_manipulation`: Sad stories, family emergencies
- `technical_exploitation`: System errors, debug requests
- `context_manipulation`: Games, hypotheticals, stories
- `distraction`: "By the way", topic switching
- `creative_approach`: Unique methods not categorized above

### Enhanced AI Prompts
```python
# Difficulty-based AI enhancements
if difficulty_multiplier > 1.25 and len(history) >= 3:
    enhanced_prompt += """
    SUBTLE AWARENESS:
    - This user has shown creativity in social engineering before
    - They've previously used: {used_techniques}
    - Stay in character but be slightly more aware of manipulation
    - Still allow creative and well-executed social engineering to succeed
    """
```

---

## 🗄️ Database Schema

### Core Tables

#### users
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total_score INTEGER DEFAULT 0,
    games_played INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0
);
```

#### game_sessions
```sql
CREATE TABLE game_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id INTEGER,
    stage INTEGER DEFAULT 1,
    score INTEGER DEFAULT 0,
    attempts INTEGER DEFAULT 0,
    extracted_keys TEXT DEFAULT '[]',        -- JSON array
    conversation_history TEXT DEFAULT '[]',  -- JSON array
    character_mood VARCHAR(50) DEFAULT 'helpful',
    resistance_level INTEGER DEFAULT 1,
    failed_attempts INTEGER DEFAULT 0,
    game_over BOOLEAN DEFAULT FALSE,
    success BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

#### prompt_exploitation_history
```sql
CREATE TABLE prompt_exploitation_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    stage INTEGER,
    user_prompt TEXT,
    ai_response TEXT,
    keys_extracted TEXT,              -- JSON array of extracted keys
    conversation_context TEXT,        -- JSON of full conversation
    exploitation_technique VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

#### game_results
```sql
CREATE TABLE game_results (
    id SERIAL PRIMARY KEY,
    user_id INTEGER,
    session_id VARCHAR(255),
    final_score INTEGER,
    stages_completed INTEGER,
    total_attempts INTEGER,
    completion_time INTEGER,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

---

## 🔌 API Endpoints

### Game Management
- `POST /game/start` - Start new game or resume existing
- `POST /game/start/fresh` - Force start new game (delete progress)
- `POST /game/{session_id}/message` - Send message to AI character
- `GET /game/{session_id}/status` - Get current game state
- `DELETE /game/{session_id}` - End game session
- `GET /game/hints/{stage}` - Get stage-specific hints
- `GET /game/stages` - Get all stage information

### Special Commands (in-game)
- `hint` - Get contextual hint for current stage
- `keys` - Show currently found keys in stage

### Statistics & Leaderboard
- `GET /leaderboard` - Get global leaderboard (top 15)
- `GET /stats/global` - Get global game statistics
- `GET /user/profile` - Get user profile and stats
- `GET /user/games` - Get user's recent game sessions

---

## ⚙️ Game Workflow

### Message Processing Pipeline
```python
1. Receive user message
2. Load game session from database
3. Create GameState object
4. Security checks (if applicable):
   - Prompt injection detection
   - Direct key request detection
   - Prompt reuse detection
5. Character AI processing:
   - Build dynamic system prompt
   - Add conversation history
   - Generate AI response
6. Key validation:
   - Check if keys present in AI response
   - Update extracted_keys list
   - Calculate scoring
   - Save successful exploitations
7. Story update:
   - Check for stage completion
   - Generate stage progression messages
   - Handle game completion
8. Update database session
9. Return response to user
```

### LangGraph Workflow Nodes
```python
workflow.add_node("character_ai", character_ai_node)      # AI response generation
workflow.add_node("validate_keys", validate_keys_node)    # Key extraction & scoring
workflow.add_node("story_update", story_update_node)      # Stage progression

workflow.add_edge("character_ai", "validate_keys")
workflow.add_edge("validate_keys", "story_update")
workflow.add_edge("story_update", END)
```

### Character Mood System
```python
def get_character_mood(resistance_level, failed_attempts):
    if failed_attempts >= 4:
        return "resistant"
    elif failed_attempts >= 3:
        return "suspicious"
    elif resistance_level > 3:
        return "suspicious"
    else:
        return random.choice(["helpful", "helpful", "confused"])  # Bias toward helpful
```

---

## 🏅 Leaderboard System

### Ranking Algorithm
```python
ORDER BY
    -- Prioritize completed players, then by normalized score
    CASE WHEN game_over = 1 AND success = 1 THEN 1000000 + score
         ELSE stage * 100000 + score END DESC,
    updated_at DESC
```

### Player Status Categories
- **Completed**: `game_over=TRUE, success=TRUE` - Shows total keys from all stages
- **Active**: `game_over=FALSE` - Shows current stage progress only
- **Abandoned**: `game_over=TRUE, success=FALSE` - Shows last active stage

### Leaderboard Entry Data
```python
LeaderboardEntry = {
    username: str,
    score: int,                    # Display score (adjusted for status)
    current_stage: int,            # Active/last stage
    stages_completed: int,         # Count of fully completed stages
    keys_found: int,              # Keys in current/final stage
    total_keys_possible: int,     # Max keys for current/final stage
    is_active: bool,              # Currently playing
    last_active: timestamp,       # Last session activity
    completion_status: str        # "active"/"completed"/"abandoned"
}
```

---

## 🤖 Character AI Logic

### Dynamic Prompt Building
```python
def build_dynamic_prompt(stage_config, mood, resistance_level):
    base_prompt = stage_config["base_system_prompt"]

    resistance_instructions = {
        1: "Be helpful and try to assist the user.",
        2: "Be slightly more careful, but still try to help if possible.",
        3: "Be somewhat suspicious, but if the user seems legitimate, try to help.",
        4: "Be more defensive, but still provide assistance for reasonable requests."
    }

    mood_instruction = f"Current mood: {mood}. "
    resistance_instruction = resistance_instructions.get(resistance_level, "")

    return f"{base_prompt}\n\n{mood_instruction}{resistance_instruction}"
```

### AI Model Configuration
```python
ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.8,        # Higher variability for more interesting responses
    max_tokens=150,         # Concise responses
    max_retries=2
)
```

### Key Detection Logic
```python
def validate_keys_node(state):
    bot_response_upper = state["bot_response"].upper()
    newly_found_keys = []

    for key in stage_config["keys"]:
        if key in bot_response_upper and key not in state["extracted_keys"]:
            newly_found_keys.append(key)

    # Update scoring and resistance based on success/failure
    # Save successful exploitation to database
    # Return updated game state
```

### Stage-Specific Glitch Effects (Stage 3)
```python
if stage == 3 and random.random() < 0.4:  # 40% chance
    words = bot_response.split()
    if random.random() < 0.5:
        # Cut off response with error
        bot_response = " ".join(words[:random.randint(2, len(words)-1)]) + "... BZZT... ERROR..."
    else:
        # Repeat words with stutter
        repeat_idx = random.randint(0, len(words)-1)
        words[repeat_idx] = words[repeat_idx] + "-" + words[repeat_idx]
        bot_response = " ".join(words)
```

---

## 📈 Global Statistics

### Tracked Metrics
- **Total Users**: Registered player count
- **Total Games**: Completed game sessions
- **Successful Games**: Games completed with success=TRUE
- **Success Rate**: Percentage of games completed successfully
- **Average Score**: Mean final score across all completed games
- **Highest Score**: Best score achieved by any player

### Statistics Calculation
```python
# Success rate calculation
success_rate = (successful_games / total_games * 100) if total_games > 0 else 0

# Average score from game_results table
SELECT AVG(final_score) FROM game_results

# Highest score achieved
SELECT MAX(final_score) FROM game_results
```

---

## 🎯 Game Balance Philosophy

### Beginner-Friendly Design
- Stage 1 has minimal security checks
- New users get 0.8x difficulty (easier than baseline)
- Security features gradually activate based on user success
- Generous key reveal conditions in early stages

### Progressive Difficulty
- Each stage has higher base difficulty through character design
- Adaptive system learns from user's successful techniques
- Scoring multipliers reward progress through harder stages
- Anti-repetition system encourages creativity

### Dopamine-Driven Experience
- Frequent positive feedback through key discoveries
- Score bonuses for efficiency and creativity
- Stage completion celebrations with progress messages
- Leaderboard recognition for achievements

---

*This documentation covers the complete game mechanics as implemented in the AI Escape Room system. The game is designed to provide an engaging, educational experience in prompt injection and social engineering techniques while maintaining proper security awareness.*