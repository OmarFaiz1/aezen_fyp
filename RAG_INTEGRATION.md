# AEZEN RAG Integration Architecture (NestJS + FastAPI)

This document outlines the architecture, data flow, and API contracts for integrating the **AEZEN NestJS Backend** with a **Python FastAPI RAG (Retrieval-Augmented Generation) System**.

The core requirement is **Multi-Tenancy**: The RAG system must strictly isolate knowledge bases and responses per tenant.

---

## 1. High-Level Architecture

```mermaid
graph TD
    User[User (WhatsApp/Web)] -->|Message| NestJS[NestJS Backend]
    
    subgraph "NestJS (Orchestrator)"
        Auth[Auth & Tenant Guard]
        ChatService[Chat Service]
        KBService[Knowledge Base Service]
    end
    
    subgraph "FastAPI (AI Engine)"
        API[FastAPI Endpoints]
        Embed[Embedding Model]
        LLM[LLM (GPT/Llama)]
        VectorDB[(Vector Database)]
    end
    
    NestJS -->|1. Forward Message + TenantID| API
    API -->|2. Retrieve Context (Filter by TenantID)| VectorDB
    VectorDB -->|3. Return Chunks| API
    API -->|4. Generate Response| LLM
    API -->|5. Return Answer| NestJS
    NestJS -->|6. Reply to User| User
```

---

## 2. Multi-Tenancy Strategy

To ensure data isolation and context-aware responses, **every request** from NestJS to FastAPI must include the `tenant_id`.

### Vector Database Isolation
The FastAPI system should use one of the following strategies to isolate tenant data in the Vector DB (e.g., Pinecone, Chroma, Qdrant, pgvector):

1.  **Metadata Filtering (Recommended for Scalability)**:
    *   Store all vectors in a single index/collection.
    *   Add `tenant_id` as metadata to every vector.
    *   **Query Time**: Apply a strict filter: `where: { "tenant_id": { "$eq": "target_tenant_id" } }`.
    *   *Pros*: Efficient, easy to manage single DB instance.
    *   *Cons*: Must ensure filter is *always* applied.

2.  **Namespaces / Collections**:
    *   Create a separate "Namespace" (Pinecone) or "Collection" (Chroma) for each `tenant_id`.
    *   *Pros*: Hard isolation.
    *   *Cons*: Managing thousands of namespaces can be complex depending on the DB provider.

---

## 3. Knowledge Base Upload Flow (Ingestion)

We want an optimized and secure flow. **NestJS should act as the gatekeeper** to handle authentication, file storage, and rate limiting before passing data to the AI system.

### The Flow:
1.  **Frontend**: User uploads a file (PDF, Doc, txt) via the Knowledge Base UI.
2.  **NestJS**:
    *   Authenticates user and checks permissions.
    *   Saves the file to object storage (e.g., AWS S3, MinIO, or local `uploads/` folder).
    *   Creates a record in the SQL DB: `KnowledgeBaseItem { id, tenantId, status: 'processing' }`.
    *   **Async Trigger**: Sends a request to FastAPI to ingest the file.
3.  **FastAPI (`POST /ingest`)**:
    *   Receives file/text and `tenant_id`.
    *   **Parsing**: Extracts text from PDF/Doc.
    *   **Chunking**: Splits text into chunks (e.g., 500 tokens).
    *   **Embedding**: Converts chunks to vectors.
    *   **Storage**: Saves vectors + metadata (`tenant_id`, `source_id`) to Vector DB.
    *   Returns success/failure.
4.  **NestJS**: Updates `KnowledgeBaseItem` status to `active`.

---

## 4. API Contract (NestJS <-> FastAPI)

FastAPI should expose the following endpoints. Secure these with a shared **API Key**.

### A. Chat / Inference
**Endpoint**: `POST /chat`

**Request Payload**:
```json
{
  "tenant_id": "uuid-of-tenant",
  "query": "What is the return policy?",
  "history": [
    {"role": "user", "content": "Hi"},
    {"role": "assistant", "content": "Hello! How can I help?"}
  ],
  "system_prompt": "You are a helpful assistant for..." // Optional: Tenant specific prompt
}
```

**Response**:
```json
{
  "response": "Our return policy allows returns within 30 days...",
  "sources": [
    {"source_id": "doc-123", "score": 0.89, "text": "Returns are accepted..."}
  ]
}
```

### B. Ingestion (Upload)
**Endpoint**: `POST /ingest`

**Request (Multipart/Form-Data)**:
*   `file`: (Binary file data)
*   `tenant_id`: (String)
*   `document_id`: (String - ID from NestJS DB to link back)

**Response**:
```json
{
  "status": "success",
  "chunks_processed": 15
}
```

### C. Deletion
**Endpoint**: `DELETE /ingest/:document_id`

**Request**:
*   Query Param: `tenant_id` (Security check)

**Logic**:
*   Delete all vectors where `metadata.source_id == document_id` AND `metadata.tenant_id == tenant_id`.

---

## 5. Implementation Checklist for FastAPI Developer

- [ ] **Setup FastAPI**: Install `fastapi`, `uvicorn`, `langchain` (or `llama-index`).
- [ ] **Vector DB**: Choose and setup a Vector DB (e.g., ChromaDB locally for dev, Pinecone for prod).
- [ ] **Ingestion Pipeline**:
    -   Implement `PyPDF2` or `Unstructured` for file parsing.
    -   Implement `RecursiveCharacterTextSplitter` for chunking.
- [ ] **RAG Chain**:
    -   Implement `similarity_search` with **metadata filtering** for `tenant_id`.
    -   Pass retrieved context + user query to LLM.
- [ ] **Security**: Add a dependency to check `X-API-Key` header matches the one stored in NestJS `.env`.

## 6. Optimization & Scalability Tips

1.  **Queueing**: For large file uploads, NestJS should push a job to a queue (e.g., BullMQ/Redis). A worker should then call the FastAPI ingestion endpoint. This prevents the HTTP request from timing out on large PDFs.
2.  **Hybrid Search**: If possible, use a Vector DB that supports Hybrid Search (Keyword + Semantic) for better accuracy (e.g., matching specific product SKUs).
3.  **Caching**: Cache frequent queries in Redis (hashed query + tenant_id) to save LLM costs and latency.
