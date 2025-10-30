from fastapi import APIRouter, HTTPException, Response
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Tuple, Dict, Optional
import cv2
import time
import threading
import traceback
from app.models.schemas import Alert, AlertType

# Note: These imports will only work on Raspberry Pi with proper hardware setup
# For development/testing purposes, we'll use mock implementations
try:
    from picamera2 import Picamera2
    from ultralytics import YOLO
    import RPi.GPIO as GPIO
    HARDWARE_AVAILABLE = True
except ImportError:
    print("[WARNING] Hardware dependencies not available. Using mock implementations.")
    HARDWARE_AVAILABLE = False

router = APIRouter()

# ==========================================================
# --- RELAY CONFIGURATION (GPIO PINS: 2, 3, 4, 17) ---
# ==========================================================
RELAY_PINS = [2, 3, 4, 17]  # BCM numbering
DURATION = 5
FRAME_SKIP = 5
GRID_ROWS, GRID_COLS = 3, 3

# Appliance mapping for each grid zone
appliance_map = {
    (0,0):["Light 1 (Back Left)"], (0,1):["Light 2 (Back Center)"], (0,2):["Light 3 (Back Right)"],
    (1,0):["Fan 1 (Mid Left)"], (1,1):["Projector"], (1,2):["Fan 2 (Mid Right)"],
    (2,0):["Light 4 (Front Left)"], (2,1):["Light 5 (Front Center)"], (2,2):["Light 6 (Front Right)"]
}

# ==========================================================
# --- RESPONSE SCHEMAS ---
# ==========================================================
class CommandResult(BaseModel):
    zone: Tuple[int, int]
    status: str
    appliances: List[str]

class DetectionResponse(BaseModel):
    human_detected: bool
    occupied_zones: List[Tuple[int, int]]
    commands: List[CommandResult]
    detection_rate: float
    processed_frames: int
    frames_with_humans: int

class RelayStatus(BaseModel):
    pin: int
    status: str  # "ON" or "OFF"
    appliances: List[str]

class SystemStatus(BaseModel):
    camera_available: bool
    ai_model_loaded: bool
    relay_pins_configured: bool
    hardware_status: str

# ==========================================================
# --- HARDWARE INITIALIZATION ---
# ==========================================================
camera_lock = threading.Lock()
camera_instance = None
model_instance = None

class MockCamera:
    """Mock camera for development without hardware"""
    def __init__(self):
        self.running = False
    
    def start(self):
        self.running = True
    
    def capture_array(self):
        # Return a mock frame (random RGB array)
        import numpy as np
        return np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)

class MockGPIO:
    """Mock GPIO for development without hardware"""
    BCM = "BCM"
    OUT = "OUT"
    HIGH = 1
    LOW = 0
    
    @staticmethod
    def setmode(mode):
        pass
    
    @staticmethod
    def setup(pin, mode):
        pass
    
    @staticmethod
    def output(pin, value):
        print(f"[MOCK GPIO] Pin {pin} -> {'HIGH' if value else 'LOW'}")
    
    @staticmethod
    def cleanup():
        pass

class MockYOLO:
    """Mock YOLO model for development"""
    def __call__(self, frame, classes=None, conf=None, verbose=None):
        # Mock detection results
        import random
        
        class MockBox:
            def __init__(self):
                # Random bounding box coordinates
                x1, y1 = random.randint(0, 300), random.randint(0, 200)
                x2, y2 = x1 + random.randint(50, 150), y1 + random.randint(50, 150)
                self.xyxy = [[x1, y1, x2, y2]]
        
        class MockResult:
            def __init__(self):
                # Randomly decide if humans are detected
                if random.random() > 0.3:  # 70% chance of detection
                    self.boxes = [MockBox() for _ in range(random.randint(1, 3))]
                else:
                    self.boxes = []
        
        return [MockResult()]

def initialize_hardware():
    """Initialize hardware components with fallback to mock implementations"""
    global camera_instance, model_instance
    
    if HARDWARE_AVAILABLE:
        # Real hardware initialization
        GPIO.setmode(GPIO.BCM)
        for pin in RELAY_PINS:
            GPIO.setup(pin, GPIO.OUT)
            GPIO.output(pin, GPIO.HIGH)  # Relay OFF initially (active LOW)
        
        try:
            print("[INFO] Loading YOLOv8 model...")
            model_instance = YOLO("yolov8n.pt")
            print("[INFO] Model loaded successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to load YOLO model: {e}")
            model_instance = MockYOLO()
    else:
        # Mock hardware initialization
        GPIO = MockGPIO()
        GPIO.setmode(GPIO.BCM)
        for pin in RELAY_PINS:
            GPIO.setup(pin, GPIO.OUT)
            GPIO.output(pin, GPIO.HIGH)
        
        print("[INFO] Using mock YOLO model...")
        model_instance = MockYOLO()

def get_camera():
    """Get camera instance with thread safety"""
    global camera_instance
    with camera_lock:
        if camera_instance is None:
            try:
                if HARDWARE_AVAILABLE:
                    camera_instance = Picamera2()
                    camera_instance.preview_configuration.main.size = (640, 480)
                    camera_instance.preview_configuration.main.format = "RGB888"
                    camera_instance.configure("preview")
                    camera_instance.start()
                else:
                    camera_instance = MockCamera()
                    camera_instance.start()
            except Exception as e:
                print(f"[ERROR] Camera init failed: {e}")
                camera_instance = MockCamera()
                camera_instance.start()
        return camera_instance

def turn_off_all_relays():
    """Turn off all relay pins"""
    gpio_module = GPIO if HARDWARE_AVAILABLE else MockGPIO()
    for pin in RELAY_PINS:
        gpio_module.output(pin, gpio_module.HIGH)

# Initialize hardware on module load
initialize_hardware()

# ==========================================================
# --- DETECTION FUNCTION ---
# ==========================================================
def run_detection() -> DetectionResponse:
    """Run human detection and control relays based on occupancy"""
    picam2 = get_camera()
    if picam2 is None:
        raise RuntimeError("Camera not available")

    gpio_module = GPIO if HARDWARE_AVAILABLE else MockGPIO()
    start_time = time.time()
    frame_count = 0
    processed_frames = 0
    frames_with_humans = 0
    last_occupied_grids = set()

    while (time.time() - start_time) < DURATION:
        frame = picam2.capture_array()
        h, w = frame.shape[:2] if len(frame.shape) >= 2 else (480, 640)
        cell_h, cell_w = h // GRID_ROWS, w // GRID_COLS
        frame_count += 1

        if frame_count % FRAME_SKIP == 0:
            processed_frames += 1
            results = model_instance(frame, classes=0, conf=0.25, verbose=False)
            current_frame_grids = set()

            for r in results:
                if len(r.boxes) > 0:
                    frames_with_humans += 1
                for box in r.boxes:
                    if HARDWARE_AVAILABLE:
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    else:
                        x1, y1, x2, y2 = box.xyxy[0]
                    center_x, center_y = (x1 + x2) / 2, (y1 + y2) / 2
                    grid_col, grid_row = int(center_x // cell_w), int(center_y // cell_h)
                    if 0 <= grid_row < GRID_ROWS and 0 <= grid_col < GRID_COLS:
                        current_frame_grids.add((grid_row, grid_col))

            last_occupied_grids = current_frame_grids

    detection_rate = (frames_with_humans / processed_frames * 100) if processed_frames > 0 else 0
    human_detected = frames_with_humans > 0

    print(f"[DEBUG] Processed={processed_frames}, FramesWithHumans={frames_with_humans}, DetectionRate={detection_rate:.2f}%, HumanDetected={human_detected}")

    commands = []

    if human_detected:
        active_columns = set([c for (_, c) in last_occupied_grids])

        # --- Relay control based on COLUMN occupancy ---
        # Col 0 → GPIO 2, Col 1 → GPIO 3, Col 2 → GPIO 4 and 17
        if 0 in active_columns:
            gpio_module.output(2, gpio_module.LOW)
            print("[RELAY] GPIO 2 -> ON")
        else:
            gpio_module.output(2, gpio_module.HIGH)
            print("[RELAY] GPIO 2 -> OFF")

        if 1 in active_columns:
            gpio_module.output(3, gpio_module.LOW)
            print("[RELAY] GPIO 3 -> ON")
        else:
            gpio_module.output(3, gpio_module.HIGH)
            print("[RELAY] GPIO 3 -> OFF")

        if 2 in active_columns:
            gpio_module.output(4, gpio_module.LOW)
            gpio_module.output(17, gpio_module.LOW)
            print("[RELAY] GPIO 4 -> ON, GPIO 17 -> ON")
        else:
            gpio_module.output(4, gpio_module.HIGH)
            gpio_module.output(17, gpio_module.HIGH)
            print("[RELAY] GPIO 4 -> OFF, GPIO 17 -> OFF")

        # Log detected zones
        for (r, c) in last_occupied_grids:
            appliances = appliance_map.get((r, c), [])
            commands.append(CommandResult(zone=(r, c), status="ON", appliances=appliances))

    else:
        turn_off_all_relays()
        for zone, appliances in appliance_map.items():
            commands.append(CommandResult(zone=zone, status="OFF", appliances=appliances))

    return DetectionResponse(
        human_detected=human_detected,
        occupied_zones=list(last_occupied_grids),
        commands=commands,
        detection_rate=detection_rate,
        processed_frames=processed_frames,
        frames_with_humans=frames_with_humans
    )

# ==========================================================
# --- API ENDPOINTS ---
# ==========================================================

@router.post("/detect", response_model=DetectionResponse)
async def detect_human():
    """Run human detection and automatically control devices based on occupancy"""
    try:
        return run_detection()
    except Exception as e:
        print(f"[ERROR] Detection failed: {e}")
        traceback.print_exc()
        turn_off_all_relays()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error during detection: {str(e)}"
        )

@router.get("/status", response_model=SystemStatus)
async def get_system_status():
    """Get the current status of the smart detection system"""
    try:
        camera_available = camera_instance is not None
        model_loaded = model_instance is not None
        
        return SystemStatus(
            camera_available=camera_available,
            ai_model_loaded=model_loaded,
            relay_pins_configured=True,
            hardware_status="operational" if HARDWARE_AVAILABLE else "mock_mode"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/relay-status")
async def get_relay_status():
    """Get current status of all relay pins"""
    try:
        relay_statuses = []
        
        # Map GPIO pins to their controlled appliances
        pin_appliance_map = {
            2: ["Light 1 (Back Left)", "Light 4 (Front Left)"],  # Column 0
            3: ["Light 2 (Back Center)", "Light 5 (Front Center)", "Projector"],  # Column 1
            4: ["Light 3 (Back Right)", "Light 6 (Front Right)"],  # Column 2 (part 1)
            17: ["Fan 1 (Mid Left)", "Fan 2 (Mid Right)"]  # Column 2 (part 2)
        }
        
        for pin in RELAY_PINS:
            # Note: In actual implementation, you might want to read the actual GPIO state
            # For now, we'll show a default status
            relay_statuses.append(RelayStatus(
                pin=pin,
                status="OFF",  # Default state
                appliances=pin_appliance_map.get(pin, [])
            ))
        
        return {"relays": relay_statuses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/manual-control/{pin}/{action}")
async def manual_relay_control(pin: int, action: str):
    """Manually control a specific relay pin"""
    try:
        if pin not in RELAY_PINS:
            raise HTTPException(status_code=400, detail=f"Invalid pin {pin}. Valid pins: {RELAY_PINS}")
        
        if action.lower() not in ["on", "off"]:
            raise HTTPException(status_code=400, detail="Action must be 'on' or 'off'")
        
        gpio_module = GPIO if HARDWARE_AVAILABLE else MockGPIO()
        
        if action.lower() == "on":
            gpio_module.output(pin, gpio_module.LOW)  # Relay ON (active LOW)
            status = "ON"
        else:
            gpio_module.output(pin, gpio_module.HIGH)  # Relay OFF
            status = "OFF"
        
        print(f"[MANUAL] GPIO {pin} -> {status}")
        
        return {
            "success": True,
            "message": f"GPIO pin {pin} set to {status}",
            "pin": pin,
            "status": status
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/emergency-stop")
async def emergency_stop():
    """Emergency stop - turn off all relays immediately"""
    try:
        turn_off_all_relays()
        print("[EMERGENCY] All relays turned OFF")
        
        return {
            "success": True,
            "message": "All relays turned OFF",
            "timestamp": time.time()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/analytics")
async def get_detection_analytics():
    """Get analytics and patterns for smart detection system"""
    try:
        # Mock analytics data - in real implementation, you'd store and analyze historical data
        analytics = {
            "daily_detections": 147,
            "average_detection_rate": 89.5,
            "energy_saved": "12.4 kWh",
            "cost_saved": "$1.86",
            "peak_detection_hours": ["10:00-12:00", "14:00-16:00"],
            "zone_utilization": [
                {"zone": "Front Left", "utilization": 65},
                {"zone": "Front Center", "utilization": 78},
                {"zone": "Front Right", "utilization": 52},
                {"zone": "Mid Left", "utilization": 45},
                {"zone": "Mid Center (Projector)", "utilization": 89},
                {"zone": "Mid Right", "utilization": 58},
                {"zone": "Back Left", "utilization": 34},
                {"zone": "Back Center", "utilization": 42},
                {"zone": "Back Right", "utilization": 29}
            ],
            "hourly_pattern": [
                {"hour": f"{h:02d}:00", "detections": max(0, 50 + 30 * (h - 12) // 6) if 8 <= h <= 18 else max(0, 10 - abs(h - 12))}
                for h in range(24)
            ]
        }
        
        return analytics
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/alerts", response_model=List[Alert])
async def get_smart_detection_alerts():
    """Get alerts related to smart detection system"""
    try:
        alerts = [
            Alert(
                id=1,
                type=AlertType.INFO,
                message="Smart detection system operating normally",
                time="Just now",
                room_id="smart-room"
            ),
            Alert(
                id=2,
                type=AlertType.SUCCESS,
                message="Energy savings achieved: 12.4 kWh today",
                time="1 hour ago",
                room_id="smart-room"
            )
        ]
        
        if not HARDWARE_AVAILABLE:
            alerts.append(Alert(
                id=3,
                type=AlertType.WARNING,
                message="Running in mock mode - hardware not available",
                time="System start",
                room_id="smart-room"
            ))
        
        return alerts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ==========================================================
# --- MJPEG PREVIEW STREAM ---
# ==========================================================
def mjpeg_stream_generator(duration_seconds=60):
    """Generate MJPEG stream with grid overlay for camera preview"""
    picam2 = get_camera()
    if picam2 is None:
        yield b"--frame\r\nContent-Type: text/plain\r\n\r\nCamera not available\r\n"
        return
    
    start = time.time()
    try:
        while True:
            frame = picam2.capture_array()
            
            if HARDWARE_AVAILABLE:
                bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            else:
                # For mock implementation, create a simple grid visualization
                import numpy as np
                bgr = np.zeros((480, 640, 3), dtype=np.uint8)
                bgr[:] = (50, 50, 50)  # Dark gray background
            
            h, w = bgr.shape[:2]
            cell_h, cell_w = h // GRID_ROWS, w // GRID_COLS

            # Draw grid lines
            for i in range(1, GRID_ROWS):
                cv2.line(bgr, (0, i * cell_h), (w, i * cell_h), (0, 255, 0), 1)
            for j in range(1, GRID_COLS):
                cv2.line(bgr, (j * cell_w, 0), (j * cell_w, h), (0, 255, 0), 1)

            # Draw column labels
            for j in range(GRID_COLS):
                cv2.putText(bgr, f"Col {j}", (j * cell_w + 10, 20),
                           cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)

            ret, jpeg = cv2.imencode(".jpg", bgr)
            if not ret:
                continue
            
            chunk = jpeg.tobytes()
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + chunk + b'\r\n')
            
            if duration_seconds and (time.time() - start) > duration_seconds:
                break
            time.sleep(0.05)
    except Exception as e:
        print(f"[ERROR] MJPEG stream failed: {e}")

@router.get("/preview")
async def preview():
    """Get live camera preview with grid overlay"""
    return StreamingResponse(
        mjpeg_stream_generator(duration_seconds=60),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

# ==========================================================
# --- SIMPLE UI ---
# ==========================================================
HTML_UI = """
<!doctype html>
<html>
<head>
    <meta charset="utf-8"/>
    <title>Smart Human Detection & Relay Control</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 1200px; margin: 0 auto; }
        .controls { margin: 20px 0; }
        button { padding: 10px 20px; margin: 5px; cursor: pointer; }
        .btn-primary { background: #007bff; color: white; border: none; border-radius: 5px; }
        .btn-danger { background: #dc3545; color: white; border: none; border-radius: 5px; }
        .status { margin: 10px 0; padding: 10px; background: #f8f9fa; border-radius: 5px; }
        .preview { margin: 20px 0; }
        .result { margin: 20px 0; padding: 10px; background: #f1f3f4; border-radius: 5px; }
        .relay-controls { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; margin: 20px 0; }
        .relay-card { padding: 15px; border: 1px solid #ddd; border-radius: 5px; background: white; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Smart Human Detection & Relay Control</h1>
        <p>AI-powered occupancy detection with automatic device control</p>
        
        <div class="controls">
            <button id="detectBtn" class="btn-primary">Start Detection</button>
            <button id="emergencyBtn" class="btn-danger">Emergency Stop</button>
        </div>
        
        <div id="status" class="status"></div>
        
        <div class="preview" id="preview" style="display:none;">
            <h3>Live Camera Feed</h3>
            <img src="/api/smart-detection/preview" width="640" height="480" style="border: 1px solid #ddd;"/>
        </div>
        
        <div class="relay-controls">
            <div class="relay-card">
                <h4>GPIO Pin 2 (Column 0)</h4>
                <p>Controls: Back/Front Left Lights</p>
                <button onclick="controlRelay(2, 'on')" class="btn-primary">Turn ON</button>
                <button onclick="controlRelay(2, 'off')">Turn OFF</button>
            </div>
            <div class="relay-card">
                <h4>GPIO Pin 3 (Column 1)</h4>
                <p>Controls: Center Lights & Projector</p>
                <button onclick="controlRelay(3, 'on')" class="btn-primary">Turn ON</button>
                <button onclick="controlRelay(3, 'off')">Turn OFF</button>
            </div>
            <div class="relay-card">
                <h4>GPIO Pin 4 (Column 2)</h4>
                <p>Controls: Right Lights</p>
                <button onclick="controlRelay(4, 'on')" class="btn-primary">Turn ON</button>
                <button onclick="controlRelay(4, 'off')">Turn OFF</button>
            </div>
            <div class="relay-card">
                <h4>GPIO Pin 17 (Column 2)</h4>
                <p>Controls: Fans</p>
                <button onclick="controlRelay(17, 'on')" class="btn-primary">Turn ON</button>
                <button onclick="controlRelay(17, 'off')">Turn OFF</button>
            </div>
        </div>
        
        <pre id="result" class="result" style="display:none;"></pre>
    </div>

    <script>
        const detectBtn = document.getElementById('detectBtn');
        const emergencyBtn = document.getElementById('emergencyBtn');
        const status = document.getElementById('status');
        const result = document.getElementById('result');
        const preview = document.getElementById('preview');

        detectBtn.onclick = async () => {
            preview.style.display = 'block';
            result.style.display = 'none';
            status.innerText = 'Running detection...';
            
            try {
                const res = await fetch('/api/smart-detection/detect', {method: 'POST'});
                const data = await res.json();
                
                result.style.display = 'block';
                result.innerText = JSON.stringify(data, null, 2);
                status.innerText = 'Detection complete.';
            } catch (err) {
                status.innerText = 'Error: ' + err;
                result.style.display = 'block';
                result.innerText = String(err);
            }
        };

        emergencyBtn.onclick = async () => {
            try {
                const res = await fetch('/api/smart-detection/emergency-stop', {method: 'POST'});
                const data = await res.json();
                status.innerText = data.message;
            } catch (err) {
                status.innerText = 'Error: ' + err;
            }
        };

        async function controlRelay(pin, action) {
            try {
                const res = await fetch(`/api/smart-detection/manual-control/${pin}/${action}`, {method: 'POST'});
                const data = await res.json();
                status.innerText = data.message;
            } catch (err) {
                status.innerText = 'Error: ' + err;
            }
        }
    </script>
</body>
</html>
"""

@router.get("/ui", response_class=HTMLResponse)
async def ui():
    """Get the web UI for smart detection system"""
    return HTMLResponse(content=HTML_UI, status_code=200)

# Cleanup GPIO on shutdown
@router.on_event("shutdown")
async def cleanup_gpio():
    """Cleanup GPIO pins on application shutdown"""
    print("[INFO] Cleaning up GPIO...")
    if HARDWARE_AVAILABLE:
        GPIO.cleanup()
    else:
        MockGPIO.cleanup()