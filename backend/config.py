import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from a .env file if present
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent

# Azure Storage Settings
# Set this environment variable or define it in a .env file to enable Azure Blob Storage
AZURE_CONNECTION_STRING = os.getenv("AZURE_STORAGE_CONNECTION_STRING", "")
AZURE_CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME", "quotes")

# Local Storage Fallback Settings (used if AZURE_CONNECTION_STRING is empty)
LOCAL_DATA_DIR = BASE_DIR / "data"
LOCAL_UPLOADS_DIR = LOCAL_DATA_DIR / "uploads"
LOCAL_METADATA_FILE = LOCAL_DATA_DIR / "quotes.json"

# Ensure local directories exist
LOCAL_DATA_DIR.mkdir(exist_ok=True)
LOCAL_UPLOADS_DIR.mkdir(exist_ok=True)

# Application Settings
HOST = "127.0.0.1"
PORT = 8005
SAS_EXPIRY_MINUTES = 15

# URLs and CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://brave-coast-0a8c9ec00.7.azurestaticapps.net")
BACKEND_URL = os.getenv("BACKEND_URL", "https://quotehouse.azurewebsites.net")

# Parse allowed CORS origins from environment, or use default list
env_origins = os.getenv("CORS_ORIGINS", "")
if env_origins:
    CORS_ORIGINS = [origin.strip() for origin in env_origins.split(",") if origin.strip()]
else:
    CORS_ORIGINS = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        FRONTEND_URL.rstrip("/"),
    ]


def is_azure_enabled() -> bool:
    return bool(AZURE_CONNECTION_STRING)
