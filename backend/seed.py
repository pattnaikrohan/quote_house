import random
from datetime import datetime, timedelta
import sys
from pathlib import Path

# Adjust path so config and storage can be imported correctly
sys.path.append(str(Path(__file__).resolve().parent))

import config
from storage import get_storage_provider

CUSTOMERS = [
    'Toll Ipec', 'Woolworths Group', 'BHP Billiton', 'Coles Group', 'Wesfarmers',
    'Santos Ltd', 'ANZ Banking', 'Rio Tinto', 'Qantas Freight', 'Australia Post',
    'JB Hi-Fi', 'Harvey Norman', 'Kmart Australia', 'Target Australia', 'David Jones',
    'Myer Holdings', 'Aldi Australia', 'Metcash Ltd', 'Endeavour Group', 'Viva Energy'
]
BRANCHES = ['Melbourne', 'Sydney', 'Brisbane', 'Perth', 'Adelaide']
REPS = [
    'Sarah Williams', 'James Nguyen', 'Emma Thompson', 'Daniel Park', 'Olivia Chen',
    'Liam Foster', 'Ava Martinez', 'Noah Campbell', 'Isabella Wright', 'Mason Turner'
]
DIRECTIONS = ['Import', 'Export', 'Domestic', 'Cross-trade']
MODES = ['Air', 'Sea', 'Road', 'Rail', 'Multi']
VERTICALS = ['Retail', 'FMCG', 'Pharma', 'Automotive', 'Technology', 'Mining', 'Agriculture', 'Other']
STATUSES = ['Active', 'Pending', 'Expired', 'Won', 'Lost']
DOC_TYPES = ['pdf', 'xlsx', 'docx']

def random_date(start_date, end_date):
    delta = end_date - start_date
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = random.randrange(int_delta)
    return start_date + timedelta(seconds=random_second)

def generate_quotes(n=120):
    now = datetime(2025, 6, 1)
    quotes = []
    
    for i in range(n):
        # Generate dates
        q_date = now - timedelta(days=random.randint(0, 540))
        effective_date = q_date + timedelta(days=random.randint(1, 10))
        expiry_date = q_date + timedelta(days=random.randint(30, 180))
        
        quote_no = f"QT-{q_date.year}-{1000 + i + 1:05d}"
        customer = random.choice(CUSTOMERS)
        branch = random.choice(BRANCHES)
        rep = random.choice(REPS)
        direction = random.choice(DIRECTIONS)
        mode = random.choice(MODES)
        vertical = random.choice(VERTICALS)
        cust_type = 'Existing' if random.random() > 0.3 else 'New'
        status = random.choice(STATUSES)
        
        # Decide document formats
        num_docs = 1 if random.random() < 0.55 else (2 if random.random() < 0.7 else 3)
        doc_types_sample = random.sample(DOC_TYPES, num_docs)
        # Ensure pdf is first if present
        doc_types_sample.sort(key=lambda t: 0 if t == 'pdf' else (1 if t == 'xlsx' else 2))
        
        customer_slug = customer.split(' ')[0].lower()
        docs = []
        for t in doc_types_sample:
            filename = f"{quote_no}_{customer_slug}.{t}"
            docs.append({
                "type": t,
                "name": filename,
                "url": f"/api/quotes/files/{filename}" # Will be resolved dynamically by storage provider in get_document_url
            })
            
        quotes.append({
            "id": i + 1,
            "quoteNo": quote_no,
            "customer": customer,
            "custType": cust_type,
            "branch": branch,
            "rep": rep,
            "quoteDate": q_date.strftime("%Y-%m-%d"),
            "effectiveDate": effective_date.strftime("%Y-%m-%d"),
            "expiryDate": expiry_date.strftime("%Y-%m-%d"),
            "direction": direction,
            "mode": mode,
            "vertical": vertical,
            "status": status,
            "docs": docs,
            "name": docs[0]["name"]
        })
        
    # Sort quotes: newest first by default
    quotes.sort(key=lambda q: q["quoteDate"], reverse=True)
    return quotes

def seed():
    print("Starting seeder...")
    provider = get_storage_provider()
    
    # Generate the 120 quotes data structure
    quotes = generate_quotes(120)
    
    print(f"Generated {len(quotes)} quote records. Uploading mock files...")
    
    # Create mock files for each document in quotes
    uploaded_files = set()
    for q in quotes:
        for doc in q["docs"]:
            filename = doc["name"]
            if filename not in uploaded_files:
                # Generate a simple mock text content
                file_content = f"Quote Document details:\nQuote Number: {q['quoteNo']}\nCustomer: {q['customer']}\nBranch: {q['branch']}\nSales Representative: {q['rep']}\nDate: {q['quoteDate']}\nExpiry Date: {q['expiryDate']}\nStatus: {q['status']}\nFormat: {doc['type'].upper()} Placeholder.\n".encode('utf-8')
                
                # Upload the file
                provider.upload_document(filename, file_content)
                uploaded_files.add(filename)
                
    # Save the quotes.json metadata structure
    print("Saving quotes.json metadata...")
    success = provider.save_quotes(quotes)
    
    if success:
        print("Seeding completed successfully!")
    else:
        print("Seeding failed during metadata save.")

if __name__ == "__main__":
    seed()
