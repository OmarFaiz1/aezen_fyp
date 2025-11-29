import base64
import os
from pdf2image import convert_from_path
from openai import OpenAI
from langchain_community.document_loaders import PyPDFLoader
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# ---------------------------
# Attempt normal extraction
# ---------------------------
def extract_text_langchain(pdf_path):
    try:
        loader = PyPDFLoader(pdf_path)
        pages = loader.load()
        text = "\n".join([p.page_content for p in pages])
        return text.strip()
    except:
        return ""


# ---------------------------
# Vision OCR (your previous code)
# ---------------------------
def extract_text_ocr(pdf_path):
    pages = convert_from_path(pdf_path, dpi=300)
    full_text = ""

    for i, page in enumerate(pages):
        temp_img = f"temp_{i}.png"
        page.save(temp_img)

        with open(temp_img, "rb") as f:
            b64 = base64.b64encode(f.read()).decode()

        response = client.responses.create(
            model="gpt-4o-mini",
            input=[
                {
                    "role": "user",
                    "content": [
                        {"type": "input_text",
                         "text": "Extract all readable text from this scanned page."},
                        {"type": "input_image",
                         "image_url": f"data:image/png;base64,{b64}"}
                    ]
                }
            ]
        )

        page_text = ""
        for out in response.output:
            if out.type == "message":
                for c in out.content:
                    if hasattr(c, "text"):
                        page_text += c.text

        full_text += f"\n\n### PAGE {i+1}\n{page_text}"
        os.remove(temp_img)

    return full_text


# ---------------------------
# AUTO-DETECT READABLE vs NON-READABLE PDF
# ---------------------------
def process_pdf_auto(pdf_path):
    # 1) Try using LangChain normal extraction
    text = extract_text_langchain(pdf_path)

    if len(text) > 500:  # readable PDF
        print("[INFO] PDF is readable — using normal extraction.")
        return text

    # 2) If too short → assume scanned
    print("[INFO] PDF seems non-readable — using GPT-Vision OCR.")
    ocr_text = extract_text_ocr(pdf_path)
    return ocr_text

