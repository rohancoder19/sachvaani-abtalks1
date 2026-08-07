from pydantic_settings import BaseSettings
from dotenv import load_dotenv
import os

load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "Autonomous AI Creator Microservice"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017/autonomous-ai-creator")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    
    EDITORIAL_MIN_SCORE: float = 7.50
    SIMILARITY_THRESHOLD: float = 0.82

    class Config:
        case_sensitive = True

settings = Settings()
