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

def is_azure_enabled() -> bool:
    return bool(AZURE_CONNECTION_STRING)
