from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o-mini")

intent_prompt = ChatPromptTemplate.from_template("""
You are an intent classifier for a customer support chatbot.

Classify query into exactly one:

1. greeting
2. rag_query

- If the user is greeting (hi, hello, etc.) → greeting
- For ANY other question or request → rag_query

Query: {query}

Return ONLY ONE LABEL.
""")

def get_intent(query):
    result = llm.invoke(intent_prompt.format(query=query))
    return result.content.strip()
