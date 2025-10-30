#!/usr/bin/env python3
"""
Database seeding script for IoT Energy Management System
Populates the database with realistic sample data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import get_db, init_db, RoomDB, ZoneDB, DeviceDB, EnergyReadingDB, OccupancyReadingDB, AlertDB
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random
import json

def seed_rooms(db: Session):
    """Seed rooms data"""
    print("Seeding rooms...")
    
    rooms_data = [
        {
            "id": "room-101",
            "name": "Room 101",
            "status": "active",
            "max_capacity": 40,
            "temperature": 22.1,
            "humidity": 45.2,
            "air_quality": 85
        },
        {
            "id": "room-102", 
            "name": "Room 102",
            "status": "active",
            "max_capacity": 35,
            "temperature": 23.5,
            "humidity": 42.8,
            "air_quality": 88
        },
        {
            "id": "lab-201",
            "name": "Computer Lab 201",
            "status": "active", 
            "max_capacity": 50,
            "temperature": 21.8,
            "humidity": 38.5,
            "air_quality": 92
        },
        {
            "id": "lab-202",
            "name": "Research Lab 202",
            "status": "maintenance",
            "max_capacity": 25,
            "temperature": 20.5,
            "humidity": 35.0,
            "air_quality": 78
        },
        {
            "id": "auditorium",
            "name": "Main Auditorium",
            "status": "active",
            "max_capacity": 200,
            "temperature": 24.2,
            "humidity": 48.5,
            "air_quality": 90
        }
    ]
    
    for room_data in rooms_data:
        existing_room = db.query(RoomDB).filter(RoomDB.id == room_data["id"]).first()
        if not existing_room:
            room = RoomDB(**room_data)
            db.add(room)
    
    db.commit()
    print(f"Seeded {len(rooms_data)} rooms")

def seed_devices(db: Session):
    """Seed device data"""
    print("Seeding devices...")
    
    rooms = db.query(RoomDB).all()
    device_types = ["lights", "fans", "projector", "ac"]
    
    for room in rooms:
        for device_type in device_types:
            # Generate random device counts based on room type
            if room.name == "Main Auditorium":
                total = random.randint(15, 25) if device_type == "lights" else random.randint(8, 12)
            elif "Lab" in room.name:
                total = random.randint(8, 15) if device_type == "lights" else random.randint(4, 8)
            else:
                total = random.randint(5, 10) if device_type == "lights" else random.randint(2, 6)
                
            if device_type == "projector":
                total = 1 if "Lab" in room.name or "Auditorium" in room.name else random.randint(0, 1)
            
            active = random.randint(0, total)
            
            device = DeviceModel(
                room_id=room.id,
                device_type=device_type,
                total_count=total,
                active_count=active,
                status="online" if active > 0 else "offline",
                power_consumption=calculate_power_consumption(device_type, active),
                last_maintenance=datetime.now() - timedelta(days=random.randint(1, 90))
            )
            db.add(device)
    
    db.commit()
    print("Seeded devices for all rooms")

def calculate_power_consumption(device_type: str, active_count: int) -> float:
    """Calculate power consumption based on device type and count"""
    power_ratings = {
        "lights": 0.06,    # 60W per light
        "fans": 0.075,     # 75W per fan  
        "projector": 0.3,  # 300W per projector
        "ac": 1.5          # 1500W per AC
    }
    return round(power_ratings.get(device_type, 0) * active_count, 2)

def seed_energy_data(db: Session):
    """Seed energy consumption data"""
    print("Seeding energy data...")
    
    rooms = db.query(RoomModel).all()
    
    # Generate hourly data for the last 24 hours
    for i in range(24):
        timestamp = datetime.now() - timedelta(hours=i)
        
        for room in rooms:
            # Calculate realistic consumption based on time of day
            hour = timestamp.hour
            base_consumption = 2.0
            
            if 8 <= hour <= 18:  # Business hours
                consumption = base_consumption * random.uniform(1.5, 2.5)
            elif 19 <= hour <= 22:  # Evening
                consumption = base_consumption * random.uniform(0.8, 1.2)
            else:  # Night
                consumption = base_consumption * random.uniform(0.3, 0.6)
            
            cost = consumption * 4.0  # ₹4 per kWh
            efficiency = random.uniform(75, 95)
            
            energy_record = EnergyDataModel(
                room_id=room.id,
                timestamp=timestamp,
                consumption=round(consumption, 2),
                cost=round(cost, 2),
                efficiency=round(efficiency, 1),
                peak_demand=round(consumption * random.uniform(1.1, 1.3), 2)
            )
            db.add(energy_record)
    
    db.commit()
    print("Seeded energy data for last 24 hours")

def seed_alerts(db: Session):
    """Seed alert data"""
    print("Seeding alerts...")
    
    alerts_data = [
        {
            "type": "warning",
            "message": "High energy consumption detected in Room 101",
            "room_id": "room-101",
            "severity": "medium",
            "status": "active",
            "created_at": datetime.now() - timedelta(minutes=30)
        },
        {
            "type": "info", 
            "message": "Scheduled maintenance completed for Lab 201",
            "room_id": "lab-201",
            "severity": "low",
            "status": "resolved",
            "created_at": datetime.now() - timedelta(hours=2)
        },
        {
            "type": "success",
            "message": "Energy optimization applied successfully",
            "room_id": "room-102", 
            "severity": "low",
            "status": "resolved",
            "created_at": datetime.now() - timedelta(hours=4)
        },
        {
            "type": "warning",
            "message": "Temperature threshold exceeded in Lab 202",
            "room_id": "lab-202",
            "severity": "high", 
            "status": "active",
            "created_at": datetime.now() - timedelta(minutes=15)
        },
        {
            "type": "error",
            "message": "AC system malfunction in Main Auditorium",
            "room_id": "auditorium",
            "severity": "high",
            "status": "active", 
            "created_at": datetime.now() - timedelta(minutes=45)
        }
    ]
    
    for alert_data in alerts_data:
        alert = AlertModel(**alert_data)
        db.add(alert)
    
    db.commit()
    print(f"Seeded {len(alerts_data)} alerts")

def main():
    """Main seeding function"""
    print("Initializing database...")
    init_db()
    
    print("Starting database seeding...")
    db = next(get_db())
    
    try:
        # Clear existing data (optional)
        choice = input("Clear existing data? (y/n): ").lower().strip()
        if choice == 'y':
            print("Clearing existing data...")
            db.query(AlertModel).delete()
            db.query(EnergyDataModel).delete() 
            db.query(DeviceModel).delete()
            db.query(RoomModel).delete()
            db.commit()
            print("Existing data cleared")
        
        # Seed data
        seed_rooms(db)
        seed_devices(db)
        seed_energy_data(db)
        seed_alerts(db)
        
        print("\n✅ Database seeding completed successfully!")
        print("\nData summary:")
        print(f"- Rooms: {db.query(RoomModel).count()}")
        print(f"- Devices: {db.query(DeviceModel).count()}")
        print(f"- Energy Records: {db.query(EnergyDataModel).count()}")
        print(f"- Alerts: {db.query(AlertModel).count()}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()