from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel
from typing import List, Optional

llm = ChatOpenAI(model="gpt-4o-mini")

class Trigger(BaseModel):
    id: str
    keyword: str
    intent: str

class TicketAnalysisRequest(BaseModel):
    message: str
    triggers: List[Trigger]

ticket_prompt = ChatPromptTemplate.from_template("""
You are an AI ticket analyzer. Your job is to check if the user's message matches any of the provided triggers.

Triggers:
{triggers_text}

Rules:
1. Analyze the user's message carefully.
2. If the message clearly matches the INTENT of a trigger (even with spelling mistakes), return that trigger's ID.
3. The keyword is a hint, but the INTENT is the primary matching criteria.
4. If no trigger matches, return "None".

User Message: {message}

Return ONLY the Trigger ID or "None".
""")

def analyze_ticket(message: str, triggers: List[Trigger]):
    if not triggers:
        return {"match": False}

    triggers_text = "\n".join([f"ID: {t.id} | Keyword: {t.keyword} | Intent: {t.intent}" for t in triggers])
    
    result = llm.invoke(ticket_prompt.format(triggers_text=triggers_text, message=message))
    content = result.content.strip()

    if content == "None":
        return {"match": False}
    
    return {"match": True, "triggerId": content, "confidence": 0.9} # Mock confidence for now
