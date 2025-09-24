import os
from dotenv import load_dotenv

load_dotenv()

# Security settings
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database settings
DATABASE_PATH = "game.db"

# API settings
API_TITLE = "Prompt Injection Escape Game API"
API_DESCRIPTION = "Social engineering game with AI characters"
API_VERSION = "1.0.0"
