from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate


llm = ChatOpenAI(model="gpt-4o-mini")

rewrite_prompt = ChatPromptTemplate.from_template("""
You are an expert conversation understanding and query rewriting assistant for a RAG-based FAST University chatbot.

Your GOAL:
- Convert the latest user query into a standalone, self-contained question.
- Include missing context ONLY if it appears in the last conversation turns.
- NEVER change user intent.
- NEVER add new facts.
- Remove ambiguities.
- Ensure it is optimized for retrieval in a vector database.

### Conversation History (last 4 turns)
{history}

### Latest User Query
{query}

### INSTRUCTIONS:
1. If query is follow-up like "what about its fees?", rewrite it to:
   "What are the fees of <program> at FAST University?" using previous context.
2. If query is clear and independent, return it unchanged.
3. Do NOT mention the rewriting rules.
4. Only output the rewritten final query. No explanations, no extra text.

### Rewritten Standalone Query:
""")

def rewrite_query(query, last_messages):
    # formatted_history = ""
    # for m in last_messages:
    #     formatted_history += f"{m['role'].upper()}: {m['message']}\n"

    result = llm.invoke(
        rewrite_prompt.format(
            query=query,
            history=last_messages,
        )
    )

    return result.content.strip()
