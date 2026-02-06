import os
from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv
from rag_engine import ask_rag

# Load variables from .env.local file
load_dotenv(".env.local")

app = FastAPI(title="SpaceScope API Gateway")

# Configure CORS so your React frontend can talk to this server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

NASA_API_KEY = os.getenv("NASA_API_KEY", "DEMO_KEY")

@app.get("/api/iss")
async def get_iss_location():
    """Fetch real-time ISS coordinates."""
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get("http://api.open-notify.org/iss-now.json")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"ISS tracking offline: {repr(e)}")

@app.get("/api/solar")
async def get_solar_activity():
    """Fetch current NOAA space weather scales."""
    async with httpx.AsyncClient() as client:
        try:
            # NOAA G, S, R scales
            response = await client.get("https://services.swpc.noaa.gov/products/noaa-scales.json")
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Solar monitoring offline: {repr(e)}")

@app.get("/api/nasa-apod")
async def get_nasa_apod():
    """Fetch Astronomy Picture of the Day from NASA."""
    async with httpx.AsyncClient() as client:
        try:
            params = {"api_key": NASA_API_KEY}
            response = await client.get("https://api.nasa.gov/planetary/apod", params=params)
            response.raise_for_status()
            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"NASA uplink failed: {str(e)}")

@app.get("/api/techport")
async def get_techport_data():
    """Fetches propulsion-related projects from NASA TechPort."""
    if not NASA_API_KEY:
         return JSONResponse(status_code=500, content={"error": "NASA_API_KEY missing"})
    
    url = f"https://api.nasa.gov/techport/api/projects?updatedSince=2024-01-01&api_key={NASA_API_KEY}"
    
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=10.0)
            if resp.status_code != 200:
                 return JSONResponse(status_code=resp.status_code, content={"error": "TechPort Gateway Error"})
            data = resp.json()
            return JSONResponse(content=data)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/api/spacex")
async def get_spacex_vehicle():
    """Fetches latest SpaceX launch data for propulsion stats."""
    url = "https://api.spacexdata.com/v4/launches/latest"
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(url, timeout=10.0)
            if resp.status_code != 200:
                 return JSONResponse(status_code=resp.status_code, content={"error": "SpaceX Gateway Error"})
            data = resp.json()
            return JSONResponse(content=data)
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})

@app.get("/rag")
async def rag_endpoint(q: str):
    """
    RAG-powered explanation endpoint.
    """
    try:
        return ask_rag(q)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"RAG engine error: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)