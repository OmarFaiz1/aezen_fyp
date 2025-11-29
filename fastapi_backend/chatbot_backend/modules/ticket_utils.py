import uuid
from datetime import datetime
import json
import os

def generate_ticket_number():
    return f"TKT-{uuid.uuid4().hex[:8].upper()}"

def save_ticket(ticket):
    if not os.path.exists("tickets"):
        os.makedirs("tickets")

    filepath = f"tickets/{ticket['id']}.json"
    with open(filepath, "w") as f:
        json.dump(ticket, f, indent=4)
