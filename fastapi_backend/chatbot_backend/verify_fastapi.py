import requests
import os

BASE_URL = "http://127.0.0.1:8000"
TENANT_ID = "test_tenant"
USER_ID = "test_user"

def test_ingest_url():
    print("Testing URL Ingestion...")
    url = "https://example.com"
    try:
        res = requests.post(f"{BASE_URL}/ingest/url", data={"tenant_id": TENANT_ID, "url": url})
        print(f"Status: {res.status_code}")
        print(f"Response: {res.json()}")
    except Exception as e:
        print(f"Failed: {e}")

def test_query():
    print("\nTesting Query...")
    query = "What is example domain?"
    try:
        res = requests.post(f"{BASE_URL}/query", data={"tenant_id": TENANT_ID, "user_id": USER_ID, "query": query})
        print(f"Status: {res.status_code}")
        print(f"Response: {res.json()}")
    except Exception as e:
        print(f"Failed: {e}")

def test_status():
    print("\nTesting Status...")
    try:
        res = requests.get(f"{BASE_URL}/status/{TENANT_ID}")
        print(f"Status: {res.status_code}")
        print(f"Response: {res.json()}")
    except Exception as e:
        print(f"Failed: {e}")

if __name__ == "__main__":
    test_ingest_url()
    test_query()
    test_status()
