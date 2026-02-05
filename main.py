import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import httpx
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()

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
            raise HTTPException(status_code=500, detail=f"ISS tracking offline: {str(e)}")

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
            raise HTTPException(status_code=500, detail=f"Solar monitoring offline: {str(e)}")

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
