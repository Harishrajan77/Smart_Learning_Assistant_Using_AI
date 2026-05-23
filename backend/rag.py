import json
import re
from pathlib import Path

import faiss
import numpy as np
from pypdf import PdfReader
from sentence_transformers import SentenceTransformer


BASE_DIR = Path(__file__).resolve().parent.parent
INDEX_DIR = BASE_DIR / "faiss_indexes"

_embedding_model: SentenceTransformer | None = None


def get_embedding_model() -> SentenceTransformer:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
    return _embedding_model


def sanitize_name(value: str) -> str:
    cleaned = re.sub(r"[^a-zA-Z0-9_-]+", "_", value).strip("_")
    return cleaned or "document"


def extract_text_from_pdf(file_path: str) -> str:
    reader = PdfReader(file_path)
    pages = [page.extract_text() or "" for page in reader.pages]
    text = "\n".join(pages).strip()
    if not text:
        raise ValueError("No readable text was found inside the PDF.")
    return text


def chunk_text(text: str, chunk_size: int = 700, overlap: int = 120) -> list[str]:
    words = text.split()
    chunks: list[str] = []
    start = 0

    while start < len(words):
        end = min(start + chunk_size, len(words))
        chunk = " ".join(words[start:end]).strip()
        if chunk:
            chunks.append(chunk)
        if end == len(words):
            break
        start = max(end - overlap, 0)

    return chunks


def build_and_store_index(file_id: int, filename: str, file_path: str) -> dict[str, str | int]:
    text = extract_text_from_pdf(file_path)
    chunks = chunk_text(text)

    if not chunks:
        raise ValueError("Unable to generate chunks from the uploaded PDF.")

    model = get_embedding_model()
    embeddings = model.encode(chunks, convert_to_numpy=True)
    embeddings = np.asarray(embeddings, dtype="float32")

    index = faiss.IndexFlatL2(embeddings.shape[1])
    index.add(embeddings)

    safe_name = sanitize_name(Path(filename).stem)
    index_path = INDEX_DIR / f"{file_id}_{safe_name}.index"
    metadata_path = INDEX_DIR / f"{file_id}_{safe_name}.json"

    faiss.write_index(index, str(index_path))
    metadata_path.write_text(json.dumps({"chunks": chunks, "text": text}, indent=2), encoding="utf-8")

    return {
        "index_path": str(index_path),
        "metadata_path": str(metadata_path),
        "chunk_count": len(chunks),
    }


def load_document_bundle(file_id: int) -> tuple[faiss.Index, list[str], str]:
    matches = list(INDEX_DIR.glob(f"{file_id}_*.index"))
    if not matches:
        raise FileNotFoundError("No FAISS index found for this file.")

    index_path = matches[0]
    metadata_path = index_path.with_suffix(".json")
    metadata = json.loads(metadata_path.read_text(encoding="utf-8"))
    index = faiss.read_index(str(index_path))
    return index, metadata["chunks"], metadata["text"]


def retrieve_context(file_id: int, query: str, top_k: int = 4) -> list[str]:
    index, chunks, _ = load_document_bundle(file_id)
    model = get_embedding_model()
    query_embedding = model.encode([query], convert_to_numpy=True)
    query_embedding = np.asarray(query_embedding, dtype="float32")

    distances, indices = index.search(query_embedding, top_k)
    matched_chunks: list[str] = []

    for idx in indices[0]:
        if idx == -1:
            continue
        matched_chunks.append(chunks[idx])

    return matched_chunks


def get_document_text(file_id: int) -> str:
    _, _, text = load_document_bundle(file_id)
    return text
