from fastapi import APIRouter, HTTPException
from typing import Dict, List
from app.models.schemas import DeviceState, Alert
from app.utils.mock_data import mock_generator
from app.utils.state_manager import state_manager

router = APIRouter()

@router.get("/current-states")
async def get_current_device_states():
    """Get current device states for frontend synchronization"""
    try:
        return {
            "device_states": state_manager.get_device_states(),
            "occupancy": state_manager.get_room_occupancy(),
            "device_counts": state_manager.get_device_counts(),
            "room_info": state_manager.get_room_info(),
            "last_updated": state_manager.get_last_updated().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/sync-states")
async def sync_device_states(states: Dict[str, Dict[str, Dict[str, bool]]]):
    """Sync device states from frontend to backend"""
    try:
        updated_count = 0
        for room_id, zones in states.items():
            for zone_id, devices in zones.items():
                for device_type, state in devices.items():
                    if state_manager.update_device_state(room_id, zone_id, device_type, state):
                        updated_count += 1
        
        return {
            "status": "success",
            "message": f"Synced {updated_count} device states",
            "timestamp": state_manager.get_last_updated().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/")
async def get_all_zones():
    """Get all zones with their device states"""
    try:
        device_states = mock_generator.generate_device_states()
        rooms = mock_generator.generate_room_data()
        
        # Format data for zone control interface
        zones_data = {}
        for room_id, zones in device_states.items():
            room_info = next((r for r in rooms if r.id == room_id), None)
            zones_data[room_id] = {
                "room_name": room_info.name if room_info else room_id,
                "zones": zones
            }
        
        return zones_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{room_id}")
async def get_room_zones(room_id: str):
    """Get zones for a specific room"""
    try:
        device_states = mock_generator.generate_device_states()
        
        if room_id not in device_states:
            raise HTTPException(status_code=404, detail="Room not found")
        
        rooms = mock_generator.generate_room_data()
        room_info = next((r for r in rooms if r.id == room_id), None)
        
        return {
            "room_id": room_id,
            "room_name": room_info.name if room_info else room_id,
            "zones": device_states[room_id]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{room_id}/{zone_id}/{device_type}")
async def update_device_state(
    room_id: str, 
    zone_id: str, 
    device_type: str, 
    device_state: DeviceState
):
    """Update device state in a specific zone"""
    try:
        # Validate parameters
        valid_devices = ['lights', 'fans', 'projector', 'ac']
        if device_type not in valid_devices:
            raise HTTPException(status_code=400, detail=f"Invalid device type. Must be one of: {valid_devices}")
        
        # Update state in state manager
        success = state_manager.update_device_state(room_id, zone_id, device_type, device_state.status)
        
        if not success:
            raise HTTPException(status_code=404, detail=f"Room {room_id}, zone {zone_id}, or device {device_type} not found")
        
        return {
            "status": "success",
            "message": f"Updated {device_type} in {zone_id} of {room_id}",
            "updated_state": device_state.dict(),
            "timestamp": state_manager.get_last_updated().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{room_id}/schedule")
async def create_schedule(room_id: str, schedule_data: Dict):
    """Create or update automation schedule for a room"""
    try:
        # Validate room exists
        device_states = mock_generator.generate_device_states()
        if room_id not in device_states:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # In a real implementation, this would save to database
        return {
            "status": "success",
            "message": f"Schedule created for {room_id}",
            "schedule_id": f"schedule-{room_id}-001",
            "schedule": schedule_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{room_id}/schedule")
async def get_room_schedule(room_id: str):
    """Get automation schedule for a room"""
    try:
        # Mock schedule data
        schedule = {
            "room_id": room_id,
            "schedules": [
                {
                    "id": 1,
                    "name": "Morning Startup",
                    "time": "08:00",
                    "actions": {
                        "lights": {"status": True, "brightness": 80},
                        "ac": {"status": True, "temperature": 24},
                        "fans": {"status": False}
                    },
                    "enabled": True
                },
                {
                    "id": 2,
                    "name": "Evening Shutdown",
                    "time": "18:00",
                    "actions": {
                        "lights": {"status": False},
                        "ac": {"status": False},
                        "fans": {"status": False},
                        "projector": {"status": False}
                    },
                    "enabled": True
                }
            ]
        }
        
        return schedule
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{room_id}/optimize")
async def optimize_room_energy(room_id: str):
    """Trigger energy optimization for a room"""
    try:
        # Validate room exists
        device_states = mock_generator.generate_device_states()
        if room_id not in device_states:
            raise HTTPException(status_code=404, detail="Room not found")
        
        # Simulate optimization process
        optimizations = [
            "Reduced lighting brightness by 20%",
            "Adjusted AC temperature to 25°C",
            "Enabled smart fan scheduling",
            "Optimized projector auto-shutdown"
        ]
        
        return {
            "status": "success",
            "message": f"Energy optimization applied to {room_id}",
            "optimizations": optimizations,
            "estimated_savings": "15-20%",
            "optimization_id": f"opt-{room_id}-001"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))



@router.get("/automation/alerts", response_model=List[Alert])
async def get_automation_alerts():
    """Get automation and zone control related alerts"""
    try:
        automation_alerts = [
            Alert(
                id=1,
                type="info",
                message="Scheduled automation applied to Room 101",
                time="10 min ago",
                room_id="room-101"
            ),
            Alert(
                id=2,
                type="success",
                message="Energy optimization completed in Lab 201",
                time="30 min ago",
                room_id="lab-201"
            ),
            Alert(
                id=3,
                type="warning",
                message="Manual override detected in Room 102",
                time="1 hour ago",
                room_id="room-102"
            )
        ]
        
        return automation_alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
