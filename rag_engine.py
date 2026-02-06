import pickle
import os
from groq import Groq
from dotenv import load_dotenv

# Determine the directory of the current script
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# Load env vars from .env
load_dotenv()

# Global states for RAG
_model = None
_index = None
texts = []
sources = []
rag_status = {"status": "uninitialized", "error": None}

def load_resources():
    global _index, texts, sources, rag_status
    if _index is not None:
        return True
    
    try:
        # Lazy import of faiss-cpu
        import faiss
        
        index_path = os.path.join(BASE_DIR, "rag.index")
        pkl_path = os.path.join(BASE_DIR, "rag.pkl")
        
        if os.path.exists(index_path) and os.path.exists(pkl_path):
            _index = faiss.read_index(index_path)
            with open(pkl_path, "rb") as f:
                data = pickle.load(f)
                texts = data["texts"]
                sources = data["sources"]
            rag_status["status"] = "ready"
            return True
        else:
            rag_status["status"] = "degraded"
            rag_status["error"] = "Index files missing"
            print(f"⚠️ RAG Engine: Index files not found at {index_path}. Run index.py first.")
            return False
    except ImportError as e:
        rag_status["status"] = "disabled"
        rag_status["error"] = f"Dependency missing: {str(e)}"
        print(f"⚠️ RAG Engine: faiss could not be loaded: {e}")
        return False
    except Exception as e:
        rag_status["status"] = "error"
        rag_status["error"] = str(e)
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

def get_model():
    global _model
    if _model:
        return _model
    try:
        from sentence_transformers import SentenceTransformer
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        return _model
    except Exception as e:
        print(f"⚠️ RAG Engine: SentenceTransformer failed to load: {e}")
        return None

def ask_rag(question: str, k: int = 3) -> dict:
    """
    Retrieve relevant documents and generate an answer using Groq (Llama 3).
    """
    client = get_client()
    if not client:
        return {"answer": "Error: API Key not configured.", "sources": []}
        
    model = get_model()
    if not load_resources() or not model:
        status_msg = f"RAG Engine is currently {rag_status['status']}."
        if rag_status['error']:
            status_msg += f" Reason: {rag_status['error']}"
        return {"answer": f"⚠️ {status_msg}. Please check system logs for dependency issues.", "sources": []}

    try:
        # 1️⃣ Embed the question
        query_embedding = model.encode([question])

        # 2️⃣ Search FAISS index
        d, indices = _index.search(query_embedding.astype("float32"), k)

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
            "answer": f"RAG Processing Error: {str(e)}",
            "sources": []
        }

def get_rag_status():
    return rag_status
