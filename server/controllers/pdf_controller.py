"""PDF Controller - Extract text from PDF files."""
import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_path):
    """Extract all text content from a PDF file."""
    try:
        doc = fitz.open(pdf_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        raise Exception(f"Failed to extract PDF text: {str(e)}")


def extract_text_from_bytes(pdf_bytes):
    """Extract text from PDF bytes (for uploaded files)."""
    try:
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text.strip()
    except Exception as e:
        raise Exception(f"Failed to extract PDF text: {str(e)}")
