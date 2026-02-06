import httpx
import asyncio

async def check(name, url):
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=10.0)
            status = resp.status_code
            if status == 200:
                print(f"✅ {name}: ONLINE (200)")
            else:
                print(f"❌ {name}: ERROR ({status}) - {resp.text[:50]}...")
    except Exception as e:
        print(f"❌ {name}: UNREACHABLE ({str(e)})")

async def main():
    print("🔍 Diagnostics Started...")
    await check("ISS Data", "http://localhost:8000/api/iss")
    await check("Solar Data", "http://localhost:8000/api/solar")
    await check("SpaceX Launch", "http://localhost:8000/api/spacex")
    await check("NASA TechPort", "http://localhost:8000/api/techport")
    await check("RAG Engine", "http://localhost:8000/rag?q=Is%20Propulsion%20Cool")
    print("🏁 Diagnostics Complete.")

if __name__ == "__main__":
    asyncio.run(main())
