import logging
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Query
from fastapi.responses import FileResponse, RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

import config
from storage import get_storage_provider

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("main")

app = FastAPI(title="Quote House API", version="1.0.0")

# CORS Middleware for local frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Storage Provider
storage = get_storage_provider()


@app.get("/api/quotes")
def get_quotes(
    q: Optional[str] = None,
    customer: Optional[str] = None,
    branch: Optional[str] = None,
    rep: Optional[str] = None,
    direction: Optional[str] = None,
    mode: Optional[str] = None,
    vertical: Optional[str] = None,
    custType: Optional[str] = None,
    status: Optional[str] = None,
    quoteFrom: Optional[str] = None,
    quoteTo: Optional[str] = None,
    expiryFrom: Optional[str] = None,
    expiryTo: Optional[str] = None,
    sort_col: str = "quoteDate",
    sort_dir: str = "desc"
):
    """
    Returns filtered and sorted list of quotes.
    """
    try:
        quotes = storage.load_quotes()
    except Exception as e:
        logger.error(f"Failed to load quotes: {e}")
        raise HTTPException(status_code=500, detail="Could not load quotes from storage")

    # Apply Search Query (across quoteNo, customer, and primary file name)
    if q:
        q_lower = q.lower().strip()
        quotes = [
            r for r in quotes
            if q_lower in r.get("quoteNo", "").lower()
            or q_lower in r.get("customer", "").lower()
            or q_lower in r.get("name", "").lower()
        ]

    # Apply Dropdown Filters
    if customer:
        quotes = [r for r in quotes if r.get("customer") == customer]
    if branch:
        quotes = [r for r in quotes if r.get("branch") == branch]
    if rep:
        quotes = [r for r in quotes if r.get("rep") == rep]
    if direction:
        quotes = [r for r in quotes if r.get("direction") == direction]
    if mode:
        quotes = [r for r in quotes if r.get("mode") == mode]
    if vertical:
        quotes = [r for r in quotes if r.get("vertical") == vertical]
    if custType:
        quotes = [r for r in quotes if r.get("custType") == custType]
    if status:
        quotes = [r for r in quotes if r.get("status") == status]

    # Apply Date Range Filters
    if quoteFrom:
        quotes = [r for r in quotes if r.get("quoteDate", "") >= quoteFrom]
    if quoteTo:
        quotes = [r for r in quotes if r.get("quoteDate", "") <= quoteTo]
    if expiryFrom:
        quotes = [r for r in quotes if r.get("expiryDate", "") >= expiryFrom]
    if expiryTo:
        quotes = [r for r in quotes if r.get("expiryDate", "") <= expiryTo]

    # Apply Sorting
    reverse = sort_dir == "desc"
    
    # Validation of sort column
    valid_cols = ["quoteDate", "expiryDate", "customer", "quoteNo"]
    col = sort_col if sort_col in valid_cols else "quoteDate"
    
    quotes.sort(key=lambda r: r.get(col, ""), reverse=reverse)

    return quotes


@app.get("/api/quotes/filters")
def get_filters():
    """
    Returns distinct filter options for the search dropdowns.
    """
    try:
        quotes = storage.load_quotes()
    except Exception as e:
        logger.error(f"Failed to load quotes for filters: {e}")
        return {}

    # Extract distinct sorted values
    filters = {
        "customers": sorted(list(set(r["customer"] for r in quotes if r.get("customer")))),
        "branches": sorted(list(set(r["branch"] for r in quotes if r.get("branch")))),
        "reps": sorted(list(set(r["rep"] for r in quotes if r.get("rep")))),
        "directions": sorted(list(set(r["direction"] for r in quotes if r.get("direction")))),
        "modes": sorted(list(set(r["mode"] for r in quotes if r.get("mode")))),
        "verticals": sorted(list(set(r["vertical"] for r in quotes if r.get("vertical")))),
        "custTypes": sorted(list(set(r["custType"] for r in quotes if r.get("custType")))),
        "statuses": sorted(list(set(r["status"] for r in quotes if r.get("status")))),
    }
    return filters


@app.get("/api/quotes/{quote_id}/open/{doc_idx}")
def open_document(quote_id: int, doc_idx: int, redirect: bool = True):
    """
    Redirects to or returns the URL for a specific document.
    """
    try:
        quotes = storage.load_quotes()
    except Exception as e:
        logger.error(f"Failed to load quotes for document lookup: {e}")
        raise HTTPException(status_code=500, detail="Could not load quotes from storage")

    quote = next((q for q in quotes if q["id"] == quote_id), None)
    if not quote:
        raise HTTPException(status_code=404, detail="Quote not found")

    docs = quote.get("docs", [])
    if doc_idx < 0 or doc_idx >= len(docs):
        raise HTTPException(status_code=404, detail="Document index out of range")

    doc = docs[doc_idx]
    filename = doc["name"]
    
    # Generate download URL via storage provider (SAS token for Azure, or local api link)
    doc_url = storage.get_document_url(filename)
    
    if redirect:
        return RedirectResponse(url=doc_url)
    else:
        return {"url": doc_url}


@app.post("/api/quotes/upload")
async def upload_quote(
    file: UploadFile = File(...),
    quoteNo: str = Form(...),
    customer: str = Form(...),
    custType: str = Form(...),
    status: str = Form(...),
    branch: str = Form(...),
    rep: str = Form(...),
    direction: str = Form(...),
    mode: str = Form(...),
    vertical: Optional[str] = Form(None),
    quoteDate: str = Form(...),
    effectiveDate: Optional[str] = Form(None),
    expiryDate: str = Form(...)
):
    """
    Endpoint for uploading a file and saving metadata.
    """
    # 1. Validation
    if not file.filename:
        raise HTTPException(status_code=400, detail="File name cannot be empty")
        
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "xlsx", "xls", "docx", "doc"]:
        raise HTTPException(
            status_code=400, 
            detail="Unsupported file format. Only PDF, Excel (xlsx, xls), and Word (docx, doc) are allowed."
        )

    try:
        # Load existing quotes
        quotes = storage.load_quotes()
        
        # 2. Upload document bytes to storage provider
        file_bytes = await file.read()
        storage.upload_document(file.filename, file_bytes)

        # 3. Create new record
        new_id = max([q["id"] for q in quotes], default=0) + 1
        new_record = {
            "id": new_id,
            "quoteNo": quoteNo,
            "customer": customer,
            "custType": custType,
            "branch": branch,
            "rep": rep,
            "quoteDate": quoteDate,
            "effectiveDate": effectiveDate or "",
            "expiryDate": expiryDate,
            "direction": direction,
            "mode": mode,
            "vertical": vertical or "Other",
            "status": status,
            "docs": [
                {
                    "type": ext,
                    "name": file.filename,
                    "url": f"/api/quotes/files/{file.filename}"
                }
            ],
            "name": file.filename
        }
        
        # Insert at the beginning of the list
        quotes.insert(0, new_record)
        
        # 4. Save metadata back to storage
        storage.save_quotes(quotes)
        
        return {"id": new_id, "quoteNo": quoteNo, "message": "Quote uploaded and saved successfully"}
        
    except Exception as e:
        logger.error(f"Error during quote upload: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to upload quote: {str(e)}")


@app.get("/api/quotes/files/{filename}")
def serve_file(filename: str):
    """
    Serves files from local upload directory. Used ONLY in local development mode.
    """
    if config.is_azure_enabled():
        raise HTTPException(status_code=400, detail="Local file serving is disabled in Azure Storage mode")
        
    file_path = config.LOCAL_UPLOADS_DIR / filename
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(status_code=404, detail="File not found")
        
    return FileResponse(path=file_path, filename=filename)
