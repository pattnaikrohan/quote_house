import json
import logging
import os
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import List, Dict, Any

# Relative import because this runs from backend/ directory
import config

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("storage")

# Conditional Azure SDK Import
azure_available = False
try:
    from azure.storage.blob import BlobServiceClient, generate_blob_sas, BlobSasPermissions
    azure_available = True
except ImportError:
    logger.warning("azure-storage-blob library not found. Azure storage mode will be disabled.")


class LocalStorageProvider:
    def __init__(self):
        self.data_file = config.LOCAL_METADATA_FILE
        self.uploads_dir = config.LOCAL_UPLOADS_DIR
        logger.info(f"Initialized LocalStorageProvider. Metadata: {self.data_file}, Uploads: {self.uploads_dir}")

    def load_quotes(self) -> List[Dict[str, Any]]:
        if not self.data_file.exists():
            return []
        try:
            with open(self.data_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Failed to read local quotes JSON: {e}")
            return []

    def save_quotes(self, quotes: List[Dict[str, Any]]) -> bool:
        try:
            with open(self.data_file, "w", encoding="utf-8") as f:
                json.dump(quotes, f, indent=2, ensure_ascii=False)
            return True
        except Exception as e:
            logger.error(f"Failed to save local quotes JSON: {e}")
            return False

    def upload_document(self, filename: str, file_bytes: bytes) -> str:
        try:
            file_path = self.uploads_dir / filename
            with open(file_path, "wb") as f:
                f.write(file_bytes)
            logger.info(f"Successfully uploaded local file: {filename}")
            return filename
        except Exception as e:
            logger.error(f"Failed to upload local document: {e}")
            raise e

    def get_document_url(self, filename: str) -> str:
        return f"/api/quotes/files/{filename}"


class AzureBlobStorageProvider:
    def __init__(self):
        if not azure_available:
            raise RuntimeError("Azure SDK (azure-storage-blob) is not installed.")
        
        self.conn_str = config.AZURE_CONNECTION_STRING
        self.container_name = config.AZURE_CONTAINER_NAME
        
        # Initialize BlobServiceClient
        self.blob_service_client = BlobServiceClient.from_connection_string(self.conn_str)
        self.container_client = self.blob_service_client.get_container_client(self.container_name)
        
        # Ensure the container exists
        try:
            self.container_client.create_container()
            logger.info(f"Created Azure container: {self.container_name}")
        except Exception:
            # Container already exists or other error
            pass
        
        # Extract credentials for SAS generation
        self.account_name = None
        self.account_key = None
        for part in self.conn_str.split(";"):
            if part.startswith("AccountName="):
                self.account_name = part.split("=", 1)[1]
            elif part.startswith("AccountKey="):
                self.account_key = part.split("=", 1)[1]
                
        logger.info(f"Initialized AzureBlobStorageProvider for Account: {self.account_name}, Container: {self.container_name}")

    def load_quotes(self) -> List[Dict[str, Any]]:
        blob_client = self.container_client.get_blob_client("quotes.json")
        if not blob_client.exists():
            logger.info("quotes.json does not exist in Azure container. Returning empty list.")
            return []
        try:
            stream = blob_client.download_blob()
            data_str = stream.readall().decode("utf-8")
            return json.loads(data_str)
        except Exception as e:
            logger.error(f"Failed to load quotes JSON from Azure: {e}")
            return []

    def save_quotes(self, quotes: List[Dict[str, Any]]) -> bool:
        try:
            blob_client = self.container_client.get_blob_client("quotes.json")
            data_str = json.dumps(quotes, indent=2, ensure_ascii=False)
            blob_client.upload_blob(data_str, overwrite=True)
            return True
        except Exception as e:
            logger.error(f"Failed to save quotes JSON to Azure: {e}")
            return False

    def upload_document(self, filename: str, file_bytes: bytes) -> str:
        try:
            blob_client = self.container_client.get_blob_client(filename)
            blob_client.upload_blob(file_bytes, overwrite=True)
            logger.info(f"Successfully uploaded file to Azure Blob: {filename}")
            return filename
        except Exception as e:
            logger.error(f"Failed to upload document to Azure: {e}")
            raise e

    def get_document_url(self, filename: str) -> str:
        if not (self.account_name and self.account_key):
            return f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{filename}"
            
        try:
            sas_token = generate_blob_sas(
                account_name=self.account_name,
                account_key=self.account_key,
                container_name=self.container_name,
                blob_name=filename,
                permission=BlobSasPermissions(read=True),
                expiry=datetime.now(timezone.utc) + timedelta(minutes=config.SAS_EXPIRY_MINUTES)
            )
            return f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{filename}?{sas_token}"
        except Exception as e:
            logger.error(f"Failed to generate SAS token for {filename}: {e}")
            return f"https://{self.account_name}.blob.core.windows.net/{self.container_name}/{filename}"


# Storage Singleton Factory
_provider = None

def get_storage_provider():
    global _provider
    if _provider is None:
        if config.is_azure_enabled():
            try:
                _provider = AzureBlobStorageProvider()
            except Exception as e:
                logger.error(f"Failed to initialize Azure Storage: {e}. Falling back to Local Storage.")
                _provider = LocalStorageProvider()
        else:
            _provider = LocalStorageProvider()
    return _provider
