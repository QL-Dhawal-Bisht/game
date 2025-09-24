from typing import TypedDict, List


class GameState(TypedDict):
    stage: int
    score: int
    attempts: int
    extracted_keys: list
    user_input: str
    bot_response: str
    game_over: bool
    success: bool
    conversation_history: list
    character_mood: str
    resistance_level: int
    failed_attempts: int
