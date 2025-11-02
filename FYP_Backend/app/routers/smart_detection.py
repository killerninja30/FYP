# app/routers/smart_detection.py
from fastapi import APIRouter, Response
from fastapi.responses import HTMLResponse, StreamingResponse
from pydantic import BaseModel
from typing import List, Tuple
from picamera2 import Picamera2
from ultralytics import YOLO
import cv2
import time
import threading
import traceback
import RPi.GPIO as GPIO

# -----------------------------
# Router
# -----------------------------
router = APIRouter()

# -----------------------------
# Relay Configuration
# -----------------------------
RELAY_PINS = [2, 3, 4, 17]  # BCM numbering

GPIO.setmode(GPIO.BCM)
for pin in RELAY_PINS:
    GPIO.setup(pin, GPIO.OUT)
    GPIO.output(pin, GPIO.HIGH)  # OFF initially (active LOW)

def turn_off_all_relays():
    for pin in RELAY_PINS:
        GPIO.output(pin, GPIO.HIGH)

# -----------------------------
# Detection Settings
# -----------------------------
DURATION = 5  # seconds per scan
FRAME_SKIP = 5
GRID_ROWS, GRID_COLS = 3, 3

print("[INFO] Loading YOLOv8 model...")
model = YOLO("yolov8n.pt")
print("[INFO] Model loaded successfully.")

# -----------------------------
# Response Schemas
# -----------------------------
class CommandResult(BaseModel):
    zone: Tuple[int, int]
    status: str

class DetectionResponse(BaseModel):
    human_detected: bool
    occupied_zones: List[Tuple[int, int]]
    commands: List[CommandResult]
    processed: int
    frames_with_humans: int
    detection_rate: float
    pin_status: dict
    logs: List[str]

# -----------------------------
# Camera Handler
# -----------------------------
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

# -----------------------------
# Detection Function
# -----------------------------
def run_detection() -> DetectionResponse:
    picam2 = get_camera()
    if picam2 is None:
        raise RuntimeError("Camera not available")

    start_time = time.time()
    frame_count = 0
    processed_frames = 0
    frames_with_humans = 0
    last_occupied_grids = set()

    logs = []  # âœ… frontend logs

    while (time.time() - start_time) < DURATION:
        frame = picam2.capture_array()
        h, w, _ = frame.shape
        cell_h, cell_w = h // GRID_ROWS, w // GRID_COLS
        frame_count += 1

        if frame_count % FRAME_SKIP == 0:
            processed_frames += 1
            results = model(frame, classes=0, conf=0.25, verbose=False)
            current_frame_grids = set()

            for r in results:
                if len(r.boxes) > 0:
                    frames_with_humans += 1
                for box in r.boxes:
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                    center_x, center_y = (x1 + x2) / 2, (y1 + y2) / 2
                    grid_col = int(center_x // cell_w)
                    grid_row = int(center_y // cell_h)
                    if 0 <= grid_row < GRID_ROWS and 0 <= grid_col < GRID_COLS:
                        current_frame_grids.add((grid_row, grid_col))

            last_occupied_grids = current_frame_grids

    detection_rate = (frames_with_humans / processed_frames * 100) if processed_frames > 0 else 0
    human_detected = frames_with_humans > 0

    logs.append(
        f"[DETECTION] Processed={processed_frames}, FramesWithHumans={frames_with_humans}, DetectionRate={detection_rate:.2f}%, HumanDetected={human_detected}"
    )

    commands = []
    pin_status = {}

    if human_detected:
        active_columns = {col for (_, col) in last_occupied_grids}

        for i, pin in enumerate(RELAY_PINS):
            if i in active_columns:
                GPIO.output(pin, GPIO.LOW)
                state = "ON"
            else:
                GPIO.output(pin, GPIO.HIGH)
                state = "OFF"

            logs.append(f"[RELAY] GPIO {pin} -> {state}")
            pin_status[pin] = state

        for pos in last_occupied_grids:
            commands.append(CommandResult(zone=pos, status="ON"))

    else:
        turn_off_all_relays()
        for pin in RELAY_PINS:
            logs.append(f"[RELAY] GPIO {pin} -> OFF")
            pin_status[pin] = "OFF"
        commands.append(CommandResult(zone=(-1, -1), status="OFF"))

    print("\n".join(logs))  # âœ… terminal log

    return DetectionResponse(
        human_detected=human_detected,
        occupied_zones=list(last_occupied_grids),
        commands=commands,
        processed=processed_frames,
        frames_with_humans=frames_with_humans,
        detection_rate=detection_rate,
        pin_status=pin_status,
        logs=logs
    )

# -----------------------------
# Automatic Detection Thread
# -----------------------------
def auto_detection_loop():
    while True:
        try:
            run_detection()
        except Exception as e:
            print("[ERROR] Auto detection failed:", e)
        time.sleep(6)  # 6 second loop

threading.Thread(target=auto_detection_loop, daemon=True).start()

# -----------------------------
# API Endpoints
# -----------------------------
@router.post("/detect", response_model=DetectionResponse)
def detect_human():
    try:
        return run_detection()
    except Exception as e:
        print("[ERROR] Detection failed:", e)
        traceback.print_exc()
        turn_off_all_relays()
        return Response(
            content='{"error": "Internal server error during detection"}',
            media_type="application/json",
            status_code=500
        )

@router.get("/preview")
def preview():
    def mjpeg_stream_generator():
        picam2 = get_camera()
        if picam2 is None:
            yield b"--frame\r\nContent-Type: text/plain\r\n\r\nCamera not available\r\n"
            return
        try:
            while True:
                frame = picam2.capture_array()
                bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
                h, w, _ = bgr.shape
                cell_h, cell_w = h // GRID_ROWS, w // GRID_COLS
                for i in range(1, GRID_ROWS):
                    cv2.line(bgr, (0, i * cell_h), (w, i * cell_h), (0, 255, 0), 1)
                for j in range(1, GRID_COLS):
                    cv2.line(bgr, (j * cell_w, 0), (j * cell_w, h), (0, 255, 0), 1)
                ret, jpeg = cv2.imencode(".jpg", bgr)
                if not ret:
                    continue
                chunk = jpeg.tobytes()
                yield (b'--frame\r\nContent-Type: image/jpeg\r\n\r\n' + chunk + b'\r\n')
                time.sleep(0.05)
        except Exception as e:
            print("[ERROR] MJPEG stream failed:", e)

    return StreamingResponse(
        mjpeg_stream_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

HTML_UI = """
<!doctype html>
<html>
<head><meta charset="utf-8"/><title>Smart Human Detection</title></head>
<body>
<h1>Smart Human Detection</h1>
<div id="preview"><img src="/api/smart-detection/preview" width="640" height="480"/></div>
<pre id="result"></pre>
</body>
</html>
"""

@router.get("/ui", response_class=HTMLResponse)
def ui():
    return HTMLResponse(content=HTML_UI, status_code=200)

@router.on_event("shutdown")
def cleanup_gpio():
    print("[INFO] Cleaning up GPIO...")
    GPIO.cleanup()
