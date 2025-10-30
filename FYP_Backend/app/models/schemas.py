from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional, Tuple, Any
from datetime import datetime
from enum import Enum

class DeviceType(str, Enum):
    LIGHTS = "lights"
    FANS = "fans"
    PROJECTOR = "projector"
    AC = "ac"

class RoomStatus(str, Enum):
    ACTIVE = "active"
    EMPTY = "empty"
    MAINTENANCE = "maintenance"

class AlertType(str, Enum):
    WARNING = "warning"
    INFO = "info"
    SUCCESS = "success"
    ERROR = "error"

# Device Models
class DeviceState(BaseModel):
    status: bool
    brightness: Optional[int] = None  # For lights
    speed: Optional[int] = None       # For fans
    temperature: Optional[int] = None # For AC
    schedule: bool = True

class DeviceInfo(BaseModel):
    active: int
    total: int

class DeviceControl(BaseModel):
    lights: DeviceInfo
    fans: DeviceInfo
    projector: DeviceInfo
    ac: DeviceInfo

# Room Models
class Zone(BaseModel):
    id: str
    name: str
    occupancy: int
    max_capacity: int
    devices: Dict[str, int]

class Room(BaseModel):
    id: str
    name: str
    status: RoomStatus
    occupancy: int
    max_capacity: int
    temperature: float
    power_consumption: float
    zones: List[Zone]
    devices: DeviceControl

# Energy Models
class EnergyData(BaseModel):
    timestamp: datetime
    room_id: str
    consumption: float
    cost: float
    efficiency: float

class DeviceUsage(BaseModel):
    name: str
    value: int
    cost: float
    color: str

# Occupancy Models
class CameraFeed(BaseModel):
    id: str
    room_id: str
    name: str
    status: str
    detected_people: int
    confidence: float
    last_update: str
    zones: List[Zone]

# Analytics Models
class TimeSeriesData(BaseModel):
    time: str
    consumption: float
    cost: Optional[float] = None
    savings: Optional[float] = None
    efficiency: Optional[float] = None

class RoomComparison(BaseModel):
    room: str
    consumption: float
    efficiency: float
    savings: float

# Dashboard Models
class DashboardMetrics(BaseModel):
    total_occupancy: int
    active_rooms: int
    power_consumption: float
    daily_savings: float
    efficiency_percentage: float

class DashboardEnergyData(BaseModel):
    consumption: float
    cost: float
    savings: float
    efficiency: float
    time_series: List[TimeSeriesData]

class ClassroomStatus(BaseModel):
    room: str
    occupancy: int
    status: RoomStatus
    devices: Dict[str, int]

# Alert Models
class Alert(BaseModel):
    id: int
    type: AlertType
    message: str
    time: str
    room_id: Optional[str] = None

# API Response Models
class DashboardResponse(BaseModel):
    metrics: DashboardMetrics
    energy_data: List[TimeSeriesData]
    device_usage: List[DeviceUsage]
    classroom_status: List[ClassroomStatus]

class MonitoringResponse(BaseModel):
    current_time: datetime
    realtime_data: List[TimeSeriesData]
    rooms_data: List[Room]
    alerts: List[Alert]

class OccupancyResponse(BaseModel):
    camera_feeds: List[CameraFeed]
    hourly_occupancy: List[Dict]
    zone_utilization: List[Dict]

class ZoneControlResponse(BaseModel):
    rooms: Dict[str, Room]
    device_states: Dict[str, Dict[str, Dict[str, DeviceState]]]

class EnergyAnalyticsResponse(BaseModel):
    weekly_data: List[TimeSeriesData]
    monthly_data: List[TimeSeriesData]
    device_breakdown: List[DeviceUsage]
    room_comparison: List[RoomComparison]
    hourly_pattern: List[Dict]

class DeviceControlResponse(BaseModel):
    devices: Dict[str, Dict[str, DeviceState]]
    rooms: Dict[str, str]

# Smart Detection Models
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
    model_config = ConfigDict(protected_namespaces=())
    
    camera_available: bool
    ai_model_loaded: bool
    relay_pins_configured: bool
    hardware_status: str

class SmartDetectionAnalytics(BaseModel):
    daily_detections: int
    average_detection_rate: float
    energy_saved: str
    cost_saved: str
    peak_detection_hours: List[str]
    zone_utilization: List[Dict[str, Any]]
    hourly_pattern: List[Dict[str, Any]]