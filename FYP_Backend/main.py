from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.routers import dashboard, monitoring, occupancy, zone_control, energy_analytics, device_control, smart_detection
from app.database.database import init_db
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="IoT Energy Management API",
    description="Backend API for IoT-based Smart Energy Management System with Smart Detection",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])
app.include_router(monitoring.router, prefix="/api/monitoring", tags=["monitoring"])
app.include_router(occupancy.router, prefix="/api/occupancy", tags=["occupancy"])
app.include_router(zone_control.router, prefix="/api/zone-control", tags=["zone-control"])
app.include_router(energy_analytics.router, prefix="/api/energy-analytics", tags=["energy-analytics"])
app.include_router(device_control.router, prefix="/api/device-control", tags=["device-control"])
app.include_router(smart_detection.router, prefix="/api/smart-detection", tags=["smart-detection"])

@app.get("/")
async def root():
    return {"message": "IoT Energy Management API with Smart Detection is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "iot-energy-backend"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)