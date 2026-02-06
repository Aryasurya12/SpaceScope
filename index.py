import os
import pickle
import faiss
from sentence_transformers import SentenceTransformer

# Folder containing RAG text files
DATA_DIR = "rag_data"

# Load embedding model
model = SentenceTransformer("all-MiniLM-L6-v2")

texts = []
sources = []

print("📂 Loading RAG documents...")

if not os.path.exists(DATA_DIR):
    os.makedirs(DATA_DIR)
    print(f"⚠️ Created missing directory: {DATA_DIR}")

# Read all .txt files from rag_data
for filename in os.listdir(DATA_DIR):
    if filename.endswith(".txt"):
        path = os.path.join(DATA_DIR, filename)
        with open(path, "r", encoding="utf-8") as f:
            content = f.read().strip()
            if content:
                texts.append(content)
                sources.append(filename)

if not texts:
    print("⚠️ No text files found in rag_data folder. Creating a sample one.")
    sample_path = os.path.join(DATA_DIR, "intro.txt")
    with open(sample_path, "w", encoding="utf-8") as f:
        f.write("SpaceScope is a dashboard for tracking space missions, solar weather, and orbital dynamics. It integrates NASA and SpaceX APIs.")
    texts.append("SpaceScope is a dashboard for tracking space missions, solar weather, and orbital dynamics. It integrates NASA and SpaceX APIs.")
    sources.append("intro.txt")

print(f"✅ Loaded {len(texts)} documents")

# Generate embeddings
print("🧠 Generating embeddings...")
embeddings = model.encode(texts, show_progress_bar=True)

# Create FAISS index
dimension = embeddings.shape[1]
index = faiss.IndexFlatL2(dimension)
index.add(embeddings)

# Save index and metadata
faiss.write_index(index, "rag.index")
with open("rag.pkl", "wb") as f:
    pickle.dump(
        {
            "texts": texts,
            "sources": sources
        },
        f
    )

print("🎉 RAG index created successfully")
print("📁 Files generated:")
print(" - rag.index")
print(" - rag.pkl")
