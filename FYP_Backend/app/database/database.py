from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime, JSON, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./energy_management.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class RoomDB(Base):
    __tablename__ = "rooms"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    status = Column(String, default="empty")
    occupancy = Column(Integer, default=0)
    max_capacity = Column(Integer)
    temperature = Column(Float, default=22.0)
    power_consumption = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    zones = relationship("ZoneDB", back_populates="room")
    energy_readings = relationship("EnergyReadingDB", back_populates="room")
    devices = relationship("DeviceDB", back_populates="room")

class ZoneDB(Base):
    __tablename__ = "zones"
    
    id = Column(String, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"))
    name = Column(String)
    occupancy = Column(Integer, default=0)
    max_capacity = Column(Integer)
    devices_config = Column(JSON)  # Store device configuration as JSON
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    room = relationship("RoomDB", back_populates="zones")

class DeviceDB(Base):
    __tablename__ = "devices"
    
    id = Column(String, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"))
    zone_id = Column(String, ForeignKey("zones.id"))
    device_type = Column(String)  # lights, fans, projector, ac
    status = Column(Boolean, default=False)
    brightness = Column(Integer, nullable=True)  # For lights
    speed = Column(Integer, nullable=True)       # For fans
    temperature = Column(Integer, nullable=True) # For AC
    schedule_enabled = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    room = relationship("RoomDB", back_populates="devices")

class EnergyReadingDB(Base):
    __tablename__ = "energy_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    consumption = Column(Float)  # kWh
    cost = Column(Float)         # Currency
    efficiency = Column(Float)   # Percentage
    
    # Relationships
    room = relationship("RoomDB", back_populates="energy_readings")

class OccupancyReadingDB(Base):
    __tablename__ = "occupancy_readings"
    
    id = Column(Integer, primary_key=True, index=True)
    room_id = Column(String, ForeignKey("rooms.id"))
    zone_id = Column(String, ForeignKey("zones.id"))
    timestamp = Column(DateTime, default=datetime.utcnow)
    detected_people = Column(Integer)
    confidence = Column(Float)
    camera_feed_id = Column(String)

class AlertDB(Base):
    __tablename__ = "alerts"
    
    id = Column(Integer, primary_key=True, index=True)
    alert_type = Column(String)  # warning, info, success, error
    message = Column(String)
    room_id = Column(String, ForeignKey("rooms.id"), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Create database tables"""
    Base.metadata.create_all(bind=engine)