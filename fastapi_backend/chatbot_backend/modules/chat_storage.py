import os
import json
from datetime import datetime

CHAT_DIR = "chat_data"
os.makedirs(CHAT_DIR, exist_ok=True)

def _get_file(tenant_id: str, user_id: str):
    tenant_path = os.path.join(CHAT_DIR, tenant_id)
    os.makedirs(tenant_path, exist_ok=True)
    
    safe_user = user_id.replace("/", "_").replace("\\", "_")
    return os.path.join(tenant_path, f"{safe_user}.json")

def load_history(tenant_id: str, user_id: str):
    path = _get_file(tenant_id, user_id)
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def save_chat(tenant_id: str, user_id: str, query: str, answer: str):
    path = _get_file(tenant_id, user_id)
    history = load_history(tenant_id, user_id)

    entry = {
        "query": query,
        "answer": answer,
        "timestamp": datetime.utcnow().isoformat()
    }

    history.append(entry)

    with open(path, "w", encoding="utf-8") as f:
        json.dump(history, f, indent=4)

def load_last_n(tenant_id: str, user_id: str, n: int = 4):
    history = load_history(tenant_id, user_id)
    return history[-n:]
