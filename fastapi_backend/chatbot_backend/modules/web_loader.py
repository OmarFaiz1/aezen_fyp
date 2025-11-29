from dotenv import load_dotenv
from langchain_community.document_loaders import WebBaseLoader
load_dotenv()
import os

def load_website(url):
    try:
        loader = WebBaseLoader(url)
        docs = loader.load()
        return "\n\n".join([d.page_content for d in docs])
    except Exception as e:
        print(f"Error loading website: {e}")
        return ""
