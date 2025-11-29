import streamlit as st
import requests

FASTAPI_URL = "http://localhost:8000"

st.set_page_config(page_title="FAST Chatbot", layout="wide")
st.title("FAST University Chatbot")

# ----------------- Manage PDFs -----------------
st.header("📄 Manage PDFs")
uploaded_pdf = st.file_uploader("Upload PDFs", type=["pdf"], accept_multiple_files=True)

if uploaded_pdf and st.button("Upload PDFs"):
    for pdf in uploaded_pdf:
        files = {"file": (pdf.name, pdf.getvalue(), "application/pdf")}
        requests.post(f"{FASTAPI_URL}/upload-pdf", files=files)
    st.success("All PDFs uploaded!")

# PDF container
pdf_container = st.container()
with pdf_container:
    pdf_list = requests.get(f"{FASTAPI_URL}/files").json().get("files", [])
    if pdf_list:
        for pdf in pdf_list:
            col1, col2 = st.columns([4, 1])
            col1.write(pdf)
            if col2.button("❌ Remove", key=f"pdf_delete_{pdf}"):
                requests.delete(f"{FASTAPI_URL}/delete-pdf", params={"filename": pdf})
                st.experimental_rerun()
    else:
        st.info("No PDFs uploaded yet.")

# ----------------- Manage Websites -----------------
st.header("🌐 Manage Websites")
url = st.text_input("Add a website URL")
if st.button("Add Website") and url.strip():
    requests.post(f"{FASTAPI_URL}/upload-link", data={"url": url.strip()})
    st.success("Website scraped and stored!")

# Website container
website_container = st.container()
with website_container:
    web_list = requests.get(f"{FASTAPI_URL}/websites").json().get("websites", [])
    if web_list:
        for site in web_list:
            col1, col2 = st.columns([4, 1])
            col1.write(site)
            if col2.button("❌ Remove", key=f"site_delete_{site}"):
                requests.delete(f"{FASTAPI_URL}/delete-website", params={"url": site})
                st.experimental_rerun()  # this now refreshes the container properly
    else:
        st.info("No websites added yet.")

# ----------------- Chatbot -----------------
st.header("🤖 FAST Chatbot")

user_id = "03225676122"   # for now static, later dynamic login

query = st.text_input("Ask a question")

if st.button("Ask") and query.strip():
    res = requests.post(
        f"{FASTAPI_URL}/ask",
        data={"query": query.strip(), "user_id": user_id}
    )

    data = res.json()
    answer = data.get("answer", "No response")
    history = data.get("history", [])

    st.markdown("### Answer:")
    st.write(answer)

    st.markdown("---")
    st.markdown("### 🕘 Recent Chat (Last 4 Messages)")

    for msg in history:
        st.write(f"**You:** {msg['query']}")
        st.write(f"**Bot:** {msg['answer']}")
        st.write("---")

