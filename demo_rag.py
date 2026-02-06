from rag_engine import ask_rag
import time

print("🤔 Asking SpaceScope AI: 'Why is ion propulsion good for deep space?'")
print("...")

start = time.time()
response = ask_rag("Why is ion propulsion good for deep space?")
end = time.time()

print(f"\n🤖 Answer (generated in {end-start:.2f}s):")
print("-" * 40)
print(response["answer"])
print("-" * 40)
print("📚 Sources:", response["sources"])
