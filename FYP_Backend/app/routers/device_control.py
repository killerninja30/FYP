from fastapi import APIRouter, HTTPException, Body
from typing import Dict, List
from app.models.schemas import DeviceState, Alert
from app.utils.mock_data import mock_generator

router = APIRouter()

@router.get("/")
async def get_all_devices():
    """Get all devices across all rooms and zones"""
    try:
        device_states = mock_generator.generate_device_states()
        rooms = mock_generator.generate_room_data()
        
        # Format comprehensive device list
        all_devices = []
        
        for room_id, zones in device_states.items():
            room_info = next((r for r in rooms if r.id == room_id), None)
            room_name = room_info.name if room_info else room_id
            
            for zone_id, devices in zones.items():
                for device_type, device_state in devices.items():
                    device_info = {
                        "id": f"{room_id}-{zone_id}-{device_type}",
                        "room_id": room_id,
                        "room_name": room_name,
                        "zone_id": zone_id,
                        "device_type": device_type,
                        "status": device_state.status,
                        "last_updated": "2 min ago",
                        "energy_consumption": f"{device_state.brightness or device_state.speed or device_state.temperature or 0}W",
                        "device_state": device_state.dict()
                    }
                    all_devices.append(device_info)
        
        return {
            "devices": all_devices,
            "total_devices": len(all_devices),
            "active_devices": len([d for d in all_devices if d["status"]]),
            "last_sync": "1 min ago"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/room/{room_id}")
async def get_room_devices(room_id: str):
    """Get all devices for a specific room"""
    try:
        device_states = mock_generator.generate_device_states()
        
        if room_id not in device_states:
            raise HTTPException(status_code=404, detail="Room not found")
        
        rooms = mock_generator.generate_room_data()
        room_info = next((r for r in rooms if r.id == room_id), None)
        
        return {
            "room_id": room_id,
            "room_name": room_info.name if room_info else room_id,
            "zones": device_states[room_id],
            "device_count": sum(len(devices) for devices in device_states[room_id].values())
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/control")
async def control_device(control_request: Dict = Body(...)):
    """Control a specific device"""
    try:
        required_fields = ["room_id", "zone_id", "device_type", "action"]
        for field in required_fields:
            if field not in control_request:
                raise HTTPException(status_code=400, detail=f"Missing required field: {field}")
        
        room_id = control_request["room_id"]
        zone_id = control_request["zone_id"]
        device_type = control_request["device_type"]
        action = control_request["action"]
        
        # Validate device type
        valid_devices = ['lights', 'fans', 'projector', 'ac']
        if device_type not in valid_devices:
            raise HTTPException(status_code=400, detail=f"Invalid device type. Must be one of: {valid_devices}")
        
        # Validate action
        valid_actions = ['turn_on', 'turn_off', 'adjust']
        if action not in valid_actions:
            raise HTTPException(status_code=400, detail=f"Invalid action. Must be one of: {valid_actions}")
        
        # Process the control action
        response = {
            "status": "success",
            "device_id": f"{room_id}-{zone_id}-{device_type}",
            "action_performed": action,
            "timestamp": "now"
        }
        
        if action == "turn_on":
            response["message"] = f"{device_type.title()} turned on in {zone_id} of {room_id}"
            response["new_state"] = {"status": True}
        elif action == "turn_off":
            response["message"] = f"{device_type.title()} turned off in {zone_id} of {room_id}"
            response["new_state"] = {"status": False}
        elif action == "adjust":
            # Handle adjustment parameters
            if device_type == "lights" and "brightness" in control_request:
                brightness = control_request["brightness"]
                response["message"] = f"Lights brightness adjusted to {brightness}% in {zone_id} of {room_id}"
                response["new_state"] = {"status": True, "brightness": brightness}
            elif device_type == "fans" and "speed" in control_request:
                speed = control_request["speed"]
                response["message"] = f"Fan speed adjusted to {speed}% in {zone_id} of {room_id}"
                response["new_state"] = {"status": True, "speed": speed}
            elif device_type == "ac" and "temperature" in control_request:
                temperature = control_request["temperature"]
                response["message"] = f"AC temperature set to {temperature}°C in {zone_id} of {room_id}"
                response["new_state"] = {"status": True, "temperature": temperature}
            else:
                response["message"] = f"{device_type.title()} settings adjusted in {zone_id} of {room_id}"
                response["new_state"] = {"status": True}
        
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/bulk-control")
async def bulk_control_devices(bulk_request: Dict = Body(...)):
    """Control multiple devices at once"""
    try:
        if "devices" not in bulk_request or "action" not in bulk_request:
            raise HTTPException(status_code=400, detail="Missing required fields: devices, action")
        
        devices = bulk_request["devices"]
        action = bulk_request["action"]
        settings = bulk_request.get("settings", {})
        
        results = []
        
        for device in devices:
            try:
                device_result = {
                    "device_id": f"{device['room_id']}-{device['zone_id']}-{device['device_type']}",
                    "status": "success",
                    "action": action
                }
                
                if action == "turn_on":
                    device_result["message"] = f"{device['device_type'].title()} turned on"
                elif action == "turn_off":
                    device_result["message"] = f"{device['device_type'].title()} turned off"
                elif action == "schedule":
                    device_result["message"] = f"Schedule applied to {device['device_type']}"
                elif action == "optimize":
                    device_result["message"] = f"Energy optimization applied to {device['device_type']}"
                
                results.append(device_result)
            except Exception as device_error:
                results.append({
                    "device_id": f"{device.get('room_id', 'unknown')}-{device.get('zone_id', 'unknown')}-{device.get('device_type', 'unknown')}",
                    "status": "error",
                    "message": str(device_error)
                })
        
        successful = len([r for r in results if r["status"] == "success"])
        failed = len(results) - successful
        
        return {
            "bulk_operation": {
                "total_devices": len(devices),
                "successful": successful,
                "failed": failed,
                "action": action
            },
            "results": results,
            "timestamp": "now"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/energy-consumption")
async def get_device_energy_consumption():
    """Get energy consumption breakdown by device type"""
    try:
        device_states = mock_generator.generate_device_states()
        
        # Calculate consumption by device type
        consumption_data = {
            "lights": {"total_devices": 0, "active_devices": 0, "consumption": 0},
            "fans": {"total_devices": 0, "active_devices": 0, "consumption": 0},
            "projector": {"total_devices": 0, "active_devices": 0, "consumption": 0},
            "ac": {"total_devices": 0, "active_devices": 0, "consumption": 0}
        }
        
        # Device power ratings (in watts)
        power_ratings = {
            "lights": 60,
            "fans": 75,
            "projector": 300,
            "ac": 1500
        }
        
        for room_id, zones in device_states.items():
            for zone_id, devices in zones.items():
                for device_type, device_state in devices.items():
                    consumption_data[device_type]["total_devices"] += 1
                    if device_state.status:
                        consumption_data[device_type]["active_devices"] += 1
                        consumption_data[device_type]["consumption"] += power_ratings[device_type]
        
        # Convert to kWh and add cost
        for device_type in consumption_data:
            consumption_kwh = consumption_data[device_type]["consumption"] / 1000  # Convert to kWh
            consumption_data[device_type]["consumption_kwh"] = round(consumption_kwh, 2)
            consumption_data[device_type]["daily_cost"] = round(consumption_kwh * 24 * 4, 0)  # ₹4 per kWh
            consumption_data[device_type]["efficiency"] = round(
                (consumption_data[device_type]["active_devices"] / 
                 max(consumption_data[device_type]["total_devices"], 1)) * 100, 1
            )
        
        return {
            "device_consumption": consumption_data,
            "total_consumption_kwh": sum(data["consumption_kwh"] for data in consumption_data.values()),
            "total_daily_cost": sum(data["daily_cost"] for data in consumption_data.values()),
            "analysis_timestamp": "now"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/status-overview")
async def get_device_status_overview():
    """Get overview of device statuses across the system"""
    try:
        device_states = mock_generator.generate_device_states()
        
        # Count devices by status
        status_counts = {
            "total": 0,
            "active": 0,
            "inactive": 0,
            "scheduled": 0,
            "manual_override": 0
        }
        
        device_health = []
        
        for room_id, zones in device_states.items():
            for zone_id, devices in zones.items():
                for device_type, device_state in devices.items():
                    status_counts["total"] += 1
                    
                    if device_state.status:
                        status_counts["active"] += 1
                    else:
                        status_counts["inactive"] += 1
                    
                    if device_state.schedule:
                        status_counts["scheduled"] += 1
                    
                    # Simulate some devices with manual override
                    if hash(f"{room_id}-{zone_id}-{device_type}") % 7 == 0:
                        status_counts["manual_override"] += 1
                    
                    # Device health simulation
                    health_score = 85 + (hash(f"{room_id}-{zone_id}-{device_type}") % 15)
                    device_health.append({
                        "device_id": f"{room_id}-{zone_id}-{device_type}",
                        "health_score": health_score,
                        "status": "excellent" if health_score > 95 else "good" if health_score > 85 else "attention"
                    })
        
        # Calculate percentages
        total = status_counts["total"]
        status_percentages = {
            "active": round((status_counts["active"] / total) * 100, 1) if total > 0 else 0,
            "inactive": round((status_counts["inactive"] / total) * 100, 1) if total > 0 else 0,
            "scheduled": round((status_counts["scheduled"] / total) * 100, 1) if total > 0 else 0,
            "manual_override": round((status_counts["manual_override"] / total) * 100, 1) if total > 0 else 0
        }
        
        return {
            "status_counts": status_counts,
            "status_percentages": status_percentages,
            "device_health": device_health,
            "system_health": round(sum(d["health_score"] for d in device_health) / len(device_health), 1),
            "last_maintenance": "3 days ago",
            "next_scheduled_maintenance": "in 4 days"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts", response_model=List[Alert])
async def get_device_alerts():
    """Get device control related alerts"""
    try:
        device_alerts = [
            Alert(
                id=1,
                type="warning",
                message="Projector in Room 101 requires maintenance",
                time="30 min ago",
                room_id="room-101"
            ),
            Alert(
                id=2,
                type="info",
                message="Bulk optimization applied to 12 devices",
                time="1 hour ago",
                room_id=""
            ),
            Alert(
                id=3,
                type="success",
                message="AC temperature optimized in Lab 201",
                time="2 hours ago",
                room_id="lab-201"
            ),
            Alert(
                id=4,
                type="warning",
                message="Manual override detected on 3 devices",
                time="3 hours ago",
                room_id="room-102"
            )
        ]
        
        return device_alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
