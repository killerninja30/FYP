from fastapi import APIRouter, HTTPException, WebSocket
from typing import List, Dict
from app.models.schemas import Room, EnergyData, TimeSeriesData
from app.utils.mock_data import mock_generator
import asyncio
import json

router = APIRouter()

# Store active WebSocket connections
active_connections: List[WebSocket] = []

@router.websocket("/realtime")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time monitoring data"""
    await websocket.accept()
    active_connections.append(websocket)
    
    try:
        while True:
            # Generate real-time data
            rooms = mock_generator.generate_room_data()
            energy_data = await get_realtime_energy()
            
            data = {
                "type": "realtime_update",
                "timestamp": "now",
                "rooms": [room.dict() for room in rooms],
                "energy": energy_data
            }
            
            await websocket.send_text(json.dumps(data))
            await asyncio.sleep(5)  # Update every 5 seconds
            
    except Exception as e:
        if websocket in active_connections:
            active_connections.remove(websocket)

@router.get("/rooms", response_model=List[Room])
async def get_monitoring_rooms():
    """Get real-time room monitoring data"""
    try:
        return mock_generator.generate_room_data()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/energy", response_model=Dict)
async def get_realtime_energy():
    """Get real-time energy consumption data"""
    try:
        time_series = mock_generator.generate_energy_time_series(12)  # Last 12 hours
        
        # Get current consumption (last point)
        current = time_series[-1] if time_series else None
        
        return {
            "current_consumption": current.consumption if current else 0,
            "current_cost": current.cost if current else 0,
            "efficiency": current.efficiency if current else 0,
            "time_series": time_series,
            "status": "updating"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/room/{room_id}")
async def get_room_details(room_id: str):
    """Get detailed monitoring data for a specific room"""
    try:
        rooms = mock_generator.generate_room_data()
        room = next((r for r in rooms if r.id == room_id), None)
        
        if not room:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Generate additional details for monitoring
        zone_energy = {}
        for zone in room.zones:
            zone_energy[zone.id] = {
                "consumption": round(zone.occupancy * 0.1 + 2, 1),
                "efficiency": round(85 + (zone.occupancy / zone.max_capacity) * 10, 1)
            }
        
        return {
            "room": room.dict(),
            "zone_energy": zone_energy,
            "last_updated": "just now"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/system-status")
async def get_system_status():
    """Get overall system monitoring status"""
    try:
        rooms = mock_generator.generate_room_data()
        
        total_devices = 0
        active_devices = 0
        
        for room in rooms:
            devices = room.devices
            total_devices += (devices.lights.total + devices.fans.total + 
                            devices.projector.total + devices.ac.total)
            active_devices += (devices.lights.active + devices.fans.active + 
                             devices.projector.active + devices.ac.active)
        
        system_status = {
            "overall_status": "operational",
            "total_devices": total_devices,
            "active_devices": active_devices,
            "device_efficiency": round((active_devices / total_devices) * 100, 1) if total_devices > 0 else 0,
            "network_status": "connected",
            "last_sync": "1 min ago"
        }
        
        return system_status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
