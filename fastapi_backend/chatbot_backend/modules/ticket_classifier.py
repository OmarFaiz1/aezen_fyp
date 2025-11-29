from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate

llm = ChatOpenAI(model="gpt-4o-mini")

ticket_prompt = ChatPromptTemplate.from_template("""
You are an AI ticket classifier. Your job is to classify the user's issue
into ONE category:

1. complaint
2. refund
3. exchange
4. none  (if no ticket is needed)

Rules:
- If user reports misbehavior, service issue → complaint
- If user requests refund, overpayment, money issue → refund
- If user wants change in department, course, admission → exchange
- If chatbot simply couldn't answer, but it's a genuine FAST query → complaint
- DO NOT invent a category.

Query: {query}

Return ONLY the category name.
""")

def get_ticket_category(query):
    result = llm.invoke(ticket_prompt.format(query=query))
    return result.content.strip()
