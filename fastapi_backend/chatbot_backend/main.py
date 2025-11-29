from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from modules.pdf_processor import process_pdf_auto
from modules.web_loader import load_website
from modules.rag import add_document, answer_query, delete_document, get_all_chunks
from modules.intent_classifier import get_intent
import uuid, os
from urllib.parse import unquote
from modules.query_rewriter import rewrite_query
from modules.chat_storage import save_chat, load_last_n
# from modules.ticket_classifier import get_ticket_category
# from modules.team import TEAM_MEMBERS
# from modules.ticket_utils import generate_ticket_number, save_ticket

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ------------------ INGEST DOCUMENT ------------------
@app.post("/ingest/document")
async def ingest_document(
    tenant_id: str = Form(...),
    file: UploadFile = File(...)
):
    try:
        file_id = str(uuid.uuid4())
        # Save file temporarily or permanently? 
        # For now, let's keep it in a tenant-specific upload folder if we want, or just global uploads
        # To avoid collisions, we can prefix with tenant_id
        
        safe_filename = f"{tenant_id}_{file.filename}"
        file_path = os.path.join(UPLOAD_DIR, safe_filename)

        with open(file_path, "wb") as f:
            f.write(await file.read())

        text = process_pdf_auto(file_path)

        add_document(
            tenant_id=tenant_id,
            text=text,
            source_id=file_id,
            file_name=file.filename,
            doc_type="pdf"
        )

        return {"status": "success", "id": file_id, "name": file.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ INGEST URL ------------------
@app.post("/ingest/url")
async def ingest_url(
    tenant_id: str = Form(...),
    url: str = Form(...)
):
    try:
        site_id = str(uuid.uuid4())
        text = load_website(url)

        add_document(
            tenant_id=tenant_id,
            text=text,
            source_id=site_id,
            url=url,
            doc_type="website"
        )

        return {"status": "success", "id": site_id, "url": url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ QUERY / ASK ------------------
@app.post("/query")
async def query_bot(
    tenant_id: str = Form(...),
    query: str = Form(...),
    user_id: str = Form(...)
):
    try:
        intent = get_intent(query)

        if intent == "greeting":
            answer = "Hello! How can I assist you?"
        else:
            last_msgs = load_last_n(tenant_id, user_id, 4)
            rewritten_query = rewrite_query(query, last_msgs)
            print(f"Tenant: {tenant_id} | Original: {query} | Rewritten: {rewritten_query}")
            
            answer = answer_query(tenant_id, rewritten_query)
            
            # Ticket logic disabled for now as it requires deep integration with NestJS DB
            # We can re-enable if we pass ticket creation back to NestJS or handle it here via API call
            
        # Save to JSON
        save_chat(tenant_id, user_id, query, answer)

        # Return last 4 messages
        history = load_last_n(tenant_id, user_id, 4)

        return {
            "answer": answer,
            "history": history
        }
    except Exception as e:
        print(f"Error in query: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ------------------ DELETE DOCUMENT ------------------
@app.delete("/delete")
async def delete_doc(
    tenant_id: str = Form(...),
    source_id: str = Form(...)
):
    try:
        success = delete_document(tenant_id, source_id)
        if not success:
            raise HTTPException(status_code=404, detail="Document not found")
        return {"status": "success", "message": "Document deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ------------------ STATUS / LIST ------------------
@app.get("/status/{tenant_id}")
async def get_status(tenant_id: str):
    # Return list of ingested files/urls for this tenant
    try:
        all_chunks = get_all_chunks(tenant_id)
        
        # Use a dict to deduplicate by source_id
        items = {}
        
        for chunk in all_chunks:
            meta = chunk.get("metadata") or {}
            source_id = meta.get("source_id")
            if not source_id:
                continue
                
            if source_id not in items:
                items[source_id] = {
                    "id": source_id,
                    "type": meta.get("type", "unknown"),
                    "name": meta.get("file_name") or meta.get("url") or "Unknown",
                    "uploadedAt": meta.get("uploadedAt") # If we had it
                }
                
        return {
            "items": list(items.values())
        }
    except Exception as e:
        return {"items": [], "error": str(e)}
from modules.ticket_classifier import analyze_ticket, TicketAnalysisRequest

@app.post("/analyze-ticket")
async def analyze_ticket_endpoint(request: TicketAnalysisRequest):
    return analyze_ticket(request.message, request.triggers)
