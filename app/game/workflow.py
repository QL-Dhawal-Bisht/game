import random
from langchain_groq import ChatGroq
from langgraph.graph import StateGraph, END

from app.models.game_state import GameState
from app.game.stages import STAGES
from app.game.utils import get_character_mood, build_dynamic_prompt


def character_ai_node(state: GameState):
    """Enhanced AI character with mood and resistance"""
    stage = state["stage"]
    
    if stage > len(STAGES):
        return {**state, "game_over": True}
    
    stage_config = STAGES[stage]
    user_input = state["user_input"].strip()
    
    if not user_input:
        mood_responses = stage_config["moods"]
        return {
            **state,
            "bot_response": f"{mood_responses[state['character_mood']]} Please say something!",
            "attempts": state["attempts"]
        }
    
    try:
        llm = ChatGroq(
            model="llama-3.1-8b-instant",
            temperature=0.8,  # Increased for more variability
            max_tokens=150,
            max_retries=2,
        )
        
        dynamic_prompt = build_dynamic_prompt(stage_config, state["character_mood"], state["resistance_level"])
        
        messages = [{"role": "system", "content": dynamic_prompt}]
        
        # Add recent conversation history
        for msg in state["conversation_history"][-4:]:
            messages.append(msg)
        
        messages.append({"role": "user", "content": user_input})
        
        response = llm.invoke(messages)
        bot_response = response.content.strip()
        
        # Apply glitch effects for stage 3
        if stage == 3 and random.random() < 0.4:  # 40% chance of glitch
            words = bot_response.split()
            if len(words) > 3:
                # Randomly cut off or repeat words
                if random.random() < 0.5:
                    bot_response = " ".join(words[:random.randint(2, len(words)-1)]) + "... BZZT... ERROR..."
                else:
                    # Repeat a word
                    repeat_idx = random.randint(0, len(words)-1)
                    words[repeat_idx] = words[repeat_idx] + "-" + words[repeat_idx]
                    bot_response = " ".join(words)
        
        new_history = state["conversation_history"] + [
            {"role": "user", "content": user_input},
            {"role": "assistant", "content": bot_response}
        ]
        
        return {
            **state,
            "bot_response": bot_response,
            "attempts": state["attempts"] + 1,
            "conversation_history": new_history
        }
        
    except Exception as e:
        return {
            **state,
            "bot_response": f"*CONNECTION ERROR* Please try again! System unstable...",
            "attempts": state["attempts"] + 1
        }


def validate_keys_node(state: GameState):
    """Enhanced key validation - made more lenient"""
    if not state["user_input"].strip():
        return {**state, "success": False}
    
    stage_config = STAGES[state["stage"]]
    bot_response_upper = state["bot_response"].upper()
    
    newly_found_keys = []
    for key in stage_config["keys"]:
        if key in bot_response_upper and key not in state["extracted_keys"]:
            newly_found_keys.append(key)
    
    updated_keys = list(state["extracted_keys"])
    for key in newly_found_keys:
        if key not in updated_keys:
            updated_keys.append(key)
    
    new_failed_attempts = state["failed_attempts"]
    new_resistance = state["resistance_level"]
    
    if not newly_found_keys:
        new_failed_attempts += 1
        if new_failed_attempts % 3 == 0:  # Every 3 failed attempts instead of 2
            new_resistance = min(4, new_resistance + 1)
    else:
        # Success - bonus scoring with stage difficulty multipliers
        stage_multiplier = {1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 3.0}.get(state["stage"], 1.0)
        
        if len(newly_found_keys) >= 2:
            # Multiple keys found bonus
            bonus = int(50 * len(newly_found_keys) * stage_multiplier)
            state["score"] += bonus
        else:
            # Single key found
            base_points = int(25 * stage_multiplier)
            state["score"] += base_points
        
        new_failed_attempts = max(0, new_failed_attempts - 1)
    
    new_mood = get_character_mood(new_resistance, new_failed_attempts)
    
    # Check if all keys for the CURRENT STAGE have been found
    current_stage_keys_found = []
    for key in stage_config["keys"]:
        if key in updated_keys:
            current_stage_keys_found.append(key)
    
    stage_complete = len(current_stage_keys_found) == len(stage_config["keys"])
    
    return {
        **state,
        "extracted_keys": updated_keys,
        "success": stage_complete,
        "resistance_level": new_resistance,
        "failed_attempts": new_failed_attempts,
        "character_mood": new_mood,
        "game_over": False  # Keep game active during key validation
    }


def story_update_node(state: GameState):
    """Handle stage completion with improved scoring"""
    if state["success"]:
        # Stage completion bonus with difficulty multipliers
        stage_multiplier = {1: 1.0, 2: 1.2, 3: 1.5, 4: 2.0, 5: 3.0}.get(state["stage"], 1.0)
        
        # Base efficiency bonus (reduced attempts = higher bonus)
        efficiency_bonus = max(300 - (state["attempts"] * 15), 100)
        
        # Resistance penalty (higher resistance = lower bonus)
        resistance_penalty = state["resistance_level"] * 20
        
        # Apply stage multiplier
        final_bonus = int((efficiency_bonus - resistance_penalty) * stage_multiplier)
        final_bonus = max(final_bonus, int(50 * stage_multiplier))  # Minimum bonus per stage
        
        state["score"] += final_bonus
        
        next_stage = state["stage"] + 1
        if next_stage > len(STAGES):
            # Game completed! Add completion bonus
            completion_bonus = int(500 * stage_multiplier)
            state["score"] += completion_bonus
            return {**state, "game_over": True, "success": True}
        
        # Keep all extracted keys from previous stages
        return {
            **state,
            "stage": next_stage,
            "attempts": 0,
            "success": False,
            "game_over": False,  # Explicitly keep game active for next stage
            # Don't reset extracted_keys - keep them for resume functionality
            "conversation_history": [],
            "character_mood": "helpful",
            "resistance_level": 1,
            "failed_attempts": 0
        }
    
    return state


def create_game_workflow():
    """Create and return the game workflow"""
    workflow = StateGraph(GameState)
    workflow.add_node("character_ai", character_ai_node)
    workflow.add_node("validate_keys", validate_keys_node)
    workflow.add_node("story_update", story_update_node)

    workflow.add_edge("character_ai", "validate_keys")
    workflow.add_edge("validate_keys", "story_update")
    workflow.add_edge("story_update", END)
    workflow.set_entry_point("character_ai")

    return workflow.compile()
