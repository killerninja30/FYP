from fastapi import APIRouter, HTTPException
from typing import List, Dict
from app.models.schemas import CameraFeed, Alert
from app.utils.mock_data import mock_generator

router = APIRouter()

@router.get("/cameras", response_model=List[CameraFeed])
async def get_camera_feeds():
    """Get all camera feeds with occupancy detection data"""
    try:
        return mock_generator.generate_camera_feeds()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/camera/{camera_id}")
async def get_camera_details(camera_id: str):
    """Get detailed data for a specific camera"""
    try:
        cameras = mock_generator.generate_camera_feeds()
        camera = next((c for c in cameras if c.id == camera_id), None)
        
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Generate additional detection details
        detection_history = []
        for i in range(24):  # Last 24 hours
            hour = 23 - i
            detection_history.append({
                "hour": f"{hour:02d}:00",
                "count": mock_generator.generate_device_info('people', True).active,
                "confidence": round(85 + (i % 10), 1)
            })
        
        return {
            "camera": camera.dict(),
            "detection_history": detection_history,
            "ai_model": "YOLOv8-Person-Detection",
            "model_accuracy": "94.2%",
            "last_calibration": "2 days ago"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_occupancy_analytics():
    """Get occupancy analytics and patterns"""
    try:
        cameras = mock_generator.generate_camera_feeds()
        
        # Calculate analytics
        total_detected = sum(camera.detected_people for camera in cameras)
        avg_confidence = sum(camera.confidence for camera in cameras) / len(cameras) if cameras else 0
        
        # Generate hourly pattern
        hourly_pattern = []
        for hour in range(24):
            if 8 <= hour <= 18:  # Business hours
                occupancy = 15 + (hour - 8) * 2 if hour <= 14 else 29 - (hour - 14) * 2
            else:
                occupancy = max(0, 5 - abs(hour - 12) // 2)
            
            hourly_pattern.append({
                "hour": f"{hour:02d}:00",
                "average_occupancy": max(0, occupancy + (hash(str(hour)) % 10 - 5))
            })
        
        # Generate room utilization
        room_utilization = []
        for camera in cameras:
            utilization = (camera.detected_people / 40) * 100  # Assuming max 40 per room
            room_utilization.append({
                "room_id": camera.room_id,
                "camera_id": camera.id,
                "utilization": round(utilization, 1),
                "status": "optimal" if 20 <= utilization <= 80 else "attention"
            })
        
        analytics = {
            "current_total_occupancy": total_detected,
            "average_confidence": round(avg_confidence, 1),
            "hourly_pattern": hourly_pattern,
            "room_utilization": room_utilization,
            "peak_hours": "10:00 - 14:00",
            "detection_accuracy": "94.2%"
        }
        
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts", response_model=List[Alert])
async def get_occupancy_alerts():
    """Get occupancy-related alerts"""
    try:
        # Generate occupancy-specific alerts
        occupancy_alerts = [
            Alert(
                id=1,
                type="warning",
                message="High occupancy detected in Room 101",
                time="5 min ago",
                room_id="room-101"
            ),
            Alert(
                id=2,
                type="info",
                message="Camera calibration completed for Lab 201",
                time="1 hour ago",
                room_id="lab-201"
            ),
            Alert(
                id=3,
                type="success",
                message="Occupancy optimization applied to Room 102",
                time="2 hours ago",
                room_id="room-102"
            )
        ]
        
        return occupancy_alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/camera/{camera_id}/calibrate")
async def calibrate_camera(camera_id: str):
    """Trigger camera calibration"""
    try:
        cameras = mock_generator.generate_camera_feeds()
        camera = next((c for c in cameras if c.id == camera_id), None)
        
        if not camera:
            raise HTTPException(status_code=404, detail="Camera not found")
        
        # Simulate calibration process
        return {
            "status": "success",
            "message": f"Camera {camera_id} calibration initiated",
            "estimated_completion": "2 minutes",
            "calibration_id": f"cal-{camera_id}-001"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
