import os
import uuid
import pickle
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain_community.retrievers import BM25Retriever
from langchain_text_splitters import RecursiveCharacterTextSplitter

# =============================================================
# MODELS
# =============================================================
embeddings = OpenAIEmbeddings(model="text-embedding-3-small")
llm = ChatOpenAI(model="gpt-4o-mini")

# =============================================================
# HELPERS
# =============================================================
def get_tenant_dir(tenant_id: str):
    path = f"data/{tenant_id}"
    os.makedirs(path, exist_ok=True)
    return path

def get_paths(tenant_id: str):
    base = get_tenant_dir(tenant_id)
    return {
        "vectorstore": f"{base}/vectorstore.faiss",
        "chunks": f"{base}/chunks.pkl"
    }

def load_tenant_data(tenant_id: str):
    paths = get_paths(tenant_id)
    
    # Load Chunks
    if os.path.exists(paths["chunks"]):
        with open(paths["chunks"], "rb") as f:
            all_chunks = pickle.load(f)
    else:
        all_chunks = []

    # Load FAISS
    if os.path.exists(paths["vectorstore"]) and os.path.exists(os.path.join(paths["vectorstore"], "index.faiss")):
        faiss_store = FAISS.load_local(paths["vectorstore"], embeddings, allow_dangerous_deserialization=True)
    else:
        # Initialize empty store if not exists
        faiss_store = FAISS.from_texts(["FAST University"], embedding=embeddings)
        # We don't save immediately here, only on write
        
    return all_chunks, faiss_store

def save_tenant_data(tenant_id: str, all_chunks, faiss_store):
    paths = get_paths(tenant_id)
    
    # Save Chunks
    with open(paths["chunks"], "wb") as f:
        pickle.dump(all_chunks, f)
        
    # Save FAISS
    faiss_store.save_local(paths["vectorstore"])

# =============================================================
# TEXT SPLITTER
# =============================================================
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=350,
    chunk_overlap=80
)

# =============================================================
# ADD DOCUMENTS (PDF or website)
# =============================================================
def add_document(tenant_id: str, text: str, source_id: str, file_name=None, url=None, doc_type="pdf"):
    all_chunks, faiss_store = load_tenant_data(tenant_id)

    chunks = text_splitter.split_text(text)

    full_chunks = []
    for ch in chunks:
        metadata = {
            "source_id": source_id,
            "type": doc_type,
            "file_name": file_name,
            "url": url,
            "tenant_id": tenant_id
        }
        full_chunks.append({"text": ch, "metadata": metadata})

    # 1. Update BM25 chunks
    all_chunks.extend(full_chunks)

    # 2. Update FAISS with texts only but metadata preserved
    faiss_store.add_texts(
        texts=[c["text"] for c in full_chunks],
        metadatas=[c["metadata"] for c in full_chunks]
    )
    
    save_tenant_data(tenant_id, all_chunks, faiss_store)

# =============================================================
# DELETE DOCUMENT BY SOURCE ID
# =============================================================
def delete_document(tenant_id: str, source_id: str):
    all_chunks, _ = load_tenant_data(tenant_id)

    # 1. Remove chunks locally
    new_chunks = [c for c in all_chunks if c["metadata"]["source_id"] != source_id]
    
    if len(new_chunks) == len(all_chunks):
        return False # Nothing deleted

    # 2. Rebuild FAISS (required because FAISS delete is tricky without IDs)
    if new_chunks:
        texts = [c["text"] for c in new_chunks]
        metas = [c["metadata"] for c in new_chunks]
        new_faiss_store = FAISS.from_texts(texts, embedding=embeddings, metadatas=metas)
    else:
        new_faiss_store = FAISS.from_texts(["FAST University"], embedding=embeddings)

    save_tenant_data(tenant_id, new_chunks, new_faiss_store)
    return True

# =============================================================
# HYBRID RETRIEVAL
# =============================================================
def hybrid_retrieve(tenant_id: str, query: str):
    all_chunks, faiss_store = load_tenant_data(tenant_id)
    
    if not all_chunks:
        return []

    semantic_docs = faiss_store.as_retriever(search_kwargs={"k": 6}).invoke(query)

    bm25 = BM25Retriever.from_texts([c["text"] for c in all_chunks])
    bm25.k = 6
    bm25_docs = bm25.invoke(query)

    final = {id(d): d for d in semantic_docs + bm25_docs}
    return list(final.values())[:5]

# =============================================================
# ANSWER QUERY
# =============================================================
def answer_query(tenant_id: str, query: str) -> str:
    docs = hybrid_retrieve(tenant_id, query)

    if not docs:
        return "Sorry, no matching information found."

    context = "\n\n".join(
        [d.page_content[:1500] for d in docs if hasattr(d, "page_content")]
    )

    prompt = f"""
You are the official AI assistant.
Use the provided database context to answer.

CONTEXT:
{context}

QUESTION: {query}

If not found say:
"Sorry, exact information not found in the database."
"""

    return llm.invoke(prompt).content.strip()

def get_all_chunks(tenant_id: str):
    all_chunks, _ = load_tenant_data(tenant_id)
    return all_chunks
