import faiss
import pickle
import os
from sentence_transformers import SentenceTransformer
from groq import Groq
from dotenv import load_dotenv

# Determine the directory of the current script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Load env vars from .env.local in the base directory
load_dotenv(os.path.join(BASE_DIR, ".env.local"))

# Load embedding model (Runs locally)
try:
    model = SentenceTransformer("all-MiniLM-L6-v2")
except Exception as e:
    model = None
    print(f"⚠️ RAG Engine: SentenceTransformer failed to load: {e}")

# Load FAISS index & Data
index = None
texts = []
sources = []

def load_resources():
    global index, texts, sources
    if index is not None:
        return True
    
    try:
        index_path = os.path.join(BASE_DIR, "rag.index")
        pkl_path = os.path.join(BASE_DIR, "rag.pkl")
        
        if os.path.exists(index_path) and os.path.exists(pkl_path):
            index = faiss.read_index(index_path)
            with open(pkl_path, "rb") as f:
                data = pickle.load(f)
                texts = data["texts"]
                sources = data["sources"]
            return True
        else:
            print(f"⚠️ RAG Engine: Index files not found at {index_path}. Run index.py first.")
            return False
    except Exception as e:
        print(f"⚠️ RAG Engine Load Error: {e}")
        return False

# Lazy-loaded client
_client = None

def get_client():
    global _client
    if _client:
        return _client
    
    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GROQ_API_KEY")
    if not api_key:
        print("⚠️ RAG Engine: No API Key found in environment.")
        return None
        
    try:
        _client = Groq(api_key=api_key)
        return _client
    except Exception as e:
        print(f"⚠️ RAG Engine: Failed to init Groq: {e}")
        return None

def ask_rag(question: str, k: int = 3) -> dict:
    """
    Retrieve relevant documents and generate an answer using Groq (Llama 3).
    """
    client = get_client()
    if not client:
        return {"answer": "Error: API Key (GEMINI_API_KEY) not configured or client failed.", "sources": []}
        
    if not load_resources() or not model:
        return {"answer": "RAG Index or Model not initialized. Please run index.py.", "sources": []}

    # 1️⃣ Embed the question
    query_embedding = model.encode([question])

    # 2️⃣ Search FAISS index
    d, indices = index.search(query_embedding.astype("float32"), k)

    # 3️⃣ Build context from retrieved docs
    retrieved_texts = []
    retrieved_sources = []

    if len(indices) > 0:
        for idx in indices[0]:
            if 0 <= idx < len(texts):
                retrieved_texts.append(texts[idx])
                retrieved_sources.append(sources[idx])

    context = "\n\n".join(retrieved_texts)

    # 4️⃣ Construct prompt
    prompt = f"""
You are SpaceScope AI, an assistant specialized in space weather,
satellites, and cosmic phenomena.

Answer the question using ONLY the context below.
Explain clearly in simple, student-friendly language.
If the answer is not in the context, say you do not have enough data.

Context:
{context}

Question:
{question}
"""

    # 5️⃣ Generate response
    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=512
        )

        answer = response.choices[0].message.content.strip()

        return {
            "answer": answer,
            "sources": list(set(retrieved_sources))
        }
    except Exception as e:
        return {
            "answer": f"Groq API Error: {str(e)}",
            "sources": []
        }
