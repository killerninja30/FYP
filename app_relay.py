from fastapi import FastAPI, Response
from fastapi.responses import HTMLResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
from picamera2 import Picamera2
from ultralytics import YOLO
import cv2
import time
import threading
import traceback
import atexit
import RPi.GPIO as GPIO

# --- Relay Setup ---
GPIO.setmode(GPIO.BCM)
relay_pins = [2, 3]  # Relay pins
for pin in relay_pins:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, GPIO.HIGH)  # OFF initially

def cleanup_gpio():
    GPIO.cleanup()
    print("[INFO] GPIO cleaned up!")

atexit.register(cleanup_gpio)

# --- FastAPI App ---
app = FastAPI(title="Smart Exercise & Posture Recognition API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Detection Settings ---
DURATION = 5
FRAME_SKIP = 5
GRID_ROWS, GRID_COLS = 2, 2

# Map zones to appliances
appliance_map = {
    (0, 0): ["Left Zone"], 
    (0, 1): ["Right Zone"],
    (1, 0): ["Left Zone"], 
    (1, 1): ["Right Zone"]
}

# Map zones to relay pins
zone_to_pin = {
    (0, 0): 2,
    (0, 1): 3,
    (1, 0): 2,
    (1, 1): 3
}

# --- Load YOLO ---
print("[INFO] Loading YOLOv8 model...")
model = YOLO("yolov8n.pt")
print("[INFO] Model loaded successfully.")

# --- Response Schemas ---
class CommandResult(BaseModel):
    zone: Tuple[int, int]
    status: str
    appliances: List[str]

class DetectionResponse(BaseModel):
    human_detected: bool
    occupied_zones: List[Tuple[int, int]]
    commands: List[CommandResult]

# --- Global Camera Singleton ---
camera_lock = threading.Lock()
camera_instance = None

def get_camera():
    global camera_instance
    with camera_lock:
        if camera_instance is None:
            try:
                camera_instance = Picamera2()
                camera_instance.preview_configuration.main.size = (640, 480)
                camera_instance.preview_configuration.main.format = "RGB888"
                camera_instance.configure("preview")
                camera_instance.start()
            except Exception as e:
                print("[ERROR] Camera init failed:", e)
                camera_instance = None
        return camera_instance

# --- Relay Control Function ---
def control_relays(occupied_zones: List[Tuple[int,int]]):
    # Left half (col=0) -> Relay 2, Right half (col=1) -> Relay 3
    GPIO.output(2, GPIO.LOW if any(z[1]==0 for z in occupied_zones) else GPIO.HIGH)
    GPIO.output(3, GPIO.LOW if any(z[1]==1 for z in occupied_zones) else GPIO.HIGH)

# --- Detection Function ---
def run_detection() -> DetectionResponse:
    picam2 = get_camera()
    if picam2 is None:
        raise RuntimeError("Camera not available")

    start_time = time.time()
    frame_count = 0
    processed_frames = 0
    last_occupied_grids = set()

    while (time.time() - start_time) < DURATION:
        frame = picam2.capture_array()
        h, w, _ = frame.shape
        cell_h, cell_w = h // GRID_ROWS, w // GRID_COLS
        frame_count += 1

        if frame_count % FRAME_SKIP == 0:
            processed_frames += 1
            results = model(frame, classes=0, conf=0.3, verbose=False)  # lower threshold
            current_frame_grids = set()
            for r in results:
                if len(r.boxes) == 0:
                    continue
                for box in r.boxes:
                    # Convert tensor to numpy
                    x1, y1, x2, y2 = box.xyxy.cpu().numpy()[0]
                    center_x, center_y = (x1 + x2)/2, (y1 + y2)/2
                    grid_col, grid_row = int(center_x // cell_w), int(center_y // cell_h)
                    if 0 <= grid_row < GRID_ROWS and 0 <= grid_col < GRID_COLS:
                        current_frame_grids.add((grid_row, grid_col))
            last_occupied_grids = current_frame_grids

    human_detected = len(last_occupied_grids) > 0
    commands = []
    for r in range(GRID_ROWS):
        for c in range(GRID_COLS):
            status = "ON" if (r,c) in last_occupied_grids else "OFF"
            commands.append(CommandResult(zone=(r,c), status=status, appliances=appliance_map[(r,c)]))

    # --- Control relays based on detection ---
    control_relays(list(last_occupied_grids))

    return DetectionResponse(
        human_detected=human_detected,
        occupied_zones=list(last_occupied_grids),
        commands=commands
    )

# --- MJPEG Preview with 2x2 grid overlay ---
def mjpeg_stream_generator(duration_seconds=60):
    picam2 = get_camera()
    if picam2 is None:
        yield b"--frame\r\nContent-Type: text/plain\r\n\r\nCamera not available\r\n"
        return

    h, w = 480, 640
    cell_h, cell_w = h // GRID_ROWS, w // GRID_COLS
    start = time.time()
    try:
        while True:
            frame = picam2.capture_array()
            # Draw 2x2 grid
            for r in range(1, GRID_ROWS):
                cv2.line(frame, (0, r*cell_h), (w, r*cell_h), (0,255,0), 2)
            for c in range(1, GRID_COLS):
                cv2.line(frame, (c*cell_w, 0), (c*cell_w, h), (0,255,0), 2)

            bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            ret, jpeg = cv2.imencode(".jpg", bgr)
            if not ret:
                continue
            chunk = jpeg.tobytes()
            yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + chunk + b'\r\n')
            if duration_seconds and (time.time() - start) > duration_seconds:
                break
            time.sleep(0.05)
    except Exception as e:
        print("[ERROR] MJPEG stream failed:", e)

@app.get("/preview")
def preview():
    return StreamingResponse(
        mjpeg_stream_generator(duration_seconds=60),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

# --- UI ---
HTML_UI = """
<!doctype html>
<html>
<head><meta charset="utf-8"/><title>Human Detection UI</title></head>
<body>
<h1>Smart Human Detection</h1>
<button id="startBtn">Start Detection</button>
<div id="status"></div>
<div id="preview" style="display:none;"><img src="/preview" width="640" height="480"/></div>
<pre id="result" style="display:none;"></pre>
<script>
const btn=document.getElementById('startBtn');
const status=document.getElementById('status');
const result=document.getElementById('result');
const preview=document.getElementById('preview');
btn.onclick=async()=>{
  preview.style.display='block'; result.style.display='none'; status.innerText='Running detection...';
  try{
    const res=await fetch('/detect',{method:'POST'});
    const text=await res.text(); let data;
    try{data=JSON.parse(text);}catch{throw new Error(text);}
    result.style.display='block'; result.innerText=JSON.stringify(data,null,2);
    status.innerText='Detection complete.';
  }catch(err){status.innerText='Error: '+err; result.style.display='block'; result.innerText=String(err);}
};
</script>
</body>
</html>
"""
@app.get("/ui", response_class=HTMLResponse)
def ui(): return HTMLResponse(content=HTML_UI, status_code=200)
@app.get("/")
def root(): return {"message": "Smart Exercise & Posture Recognition API is running!"}
