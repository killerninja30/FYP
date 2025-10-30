#!/usr/bin/env python3
"""
Database seeding script for IoT Energy Management System
Populates the database with realistic sample data
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.database.database import get_db, init_db, RoomDB, ZoneDB, DeviceDB, EnergyReadingDB, AlertDB
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

def seed_rooms(db: Session):
    """Seed rooms data"""
    print("Seeding rooms...")
    
    rooms_data = [
        {
            "id": "room-101",
            "name": "Room 101",
            "status": "active",
            "occupancy": 35,
            "max_capacity": 40,
            "temperature": 22.1,
            "power_consumption": 1.3
        },
        {
            "id": "room-102", 
            "name": "Room 102",
            "status": "active",
            "occupancy": 28,
            "max_capacity": 35,
            "temperature": 23.5,
            "power_consumption": 0.9
        },
        {
            "id": "lab-201",
            "name": "Computer Lab 201",
            "status": "active",
            "occupancy": 42,
            "max_capacity": 50,
            "temperature": 21.8,
            "power_consumption": 2.1
        },
        {
            "id": "lab-202",
            "name": "Research Lab 202",
            "status": "maintenance",
            "occupancy": 0,
            "max_capacity": 25,
            "temperature": 20.5,
            "power_consumption": 0.2
        },
        {
            "id": "auditorium",
            "name": "Main Auditorium",
            "status": "active",
            "occupancy": 125,
            "max_capacity": 200,
            "temperature": 24.2,
            "power_consumption": 4.5
        }
    ]
    
    for room_data in rooms_data:
        existing_room = db.query(RoomDB).filter(RoomDB.id == room_data["id"]).first()
        if not existing_room:
            room = RoomDB(**room_data)
            db.add(room)
    
    db.commit()
    print(f"Seeded {len(rooms_data)} rooms")

def seed_zones(db: Session):
    """Seed zone data"""
    print("Seeding zones...")
    
    zones_data = [
        # Room 101 zones
        {"id": "zone-101-1", "room_id": "room-101", "name": "Front Section", "occupancy": 12, "max_capacity": 15, "devices_config": {"lights": 3, "fans": 2, "projector": 0, "ac": 1}},
        {"id": "zone-101-2", "room_id": "room-101", "name": "Middle Section", "occupancy": 8, "max_capacity": 12, "devices_config": {"lights": 3, "fans": 2, "projector": 1, "ac": 1}},
        {"id": "zone-101-3", "room_id": "room-101", "name": "Back Section", "occupancy": 15, "max_capacity": 13, "devices_config": {"lights": 2, "fans": 1, "projector": 0, "ac": 0}},
        
        # Room 102 zones
        {"id": "zone-102-1", "room_id": "room-102", "name": "Left Section", "occupancy": 14, "max_capacity": 18, "devices_config": {"lights": 4, "fans": 2, "projector": 1, "ac": 1}},
        {"id": "zone-102-2", "room_id": "room-102", "name": "Right Section", "occupancy": 14, "max_capacity": 17, "devices_config": {"lights": 3, "fans": 2, "projector": 0, "ac": 1}},
        
        # Lab 201 zones
        {"id": "zone-201-1", "room_id": "lab-201", "name": "Workstation Area", "occupancy": 25, "max_capacity": 30, "devices_config": {"lights": 6, "fans": 3, "projector": 1, "ac": 2}},
        {"id": "zone-201-2", "room_id": "lab-201", "name": "Server Area", "occupancy": 5, "max_capacity": 10, "devices_config": {"lights": 2, "fans": 4, "projector": 0, "ac": 1}},
        {"id": "zone-201-3", "room_id": "lab-201", "name": "Discussion Area", "occupancy": 12, "max_capacity": 10, "devices_config": {"lights": 3, "fans": 1, "projector": 1, "ac": 1}},
        
        # Lab 202 zones
        {"id": "zone-202-1", "room_id": "lab-202", "name": "Research Zone", "occupancy": 0, "max_capacity": 15, "devices_config": {"lights": 4, "fans": 2, "projector": 1, "ac": 1}},
        {"id": "zone-202-2", "room_id": "lab-202", "name": "Equipment Zone", "occupancy": 0, "max_capacity": 10, "devices_config": {"lights": 2, "fans": 1, "projector": 0, "ac": 1}},
        
        # Auditorium zones
        {"id": "zone-aud-1", "room_id": "auditorium", "name": "Stage Area", "occupancy": 15, "max_capacity": 30, "devices_config": {"lights": 8, "fans": 2, "projector": 2, "ac": 2}},
        {"id": "zone-aud-2", "room_id": "auditorium", "name": "Seating Area", "occupancy": 110, "max_capacity": 170, "devices_config": {"lights": 12, "fans": 6, "projector": 0, "ac": 4}}
    ]
    
    for zone_data in zones_data:
        existing_zone = db.query(ZoneDB).filter(ZoneDB.id == zone_data["id"]).first()
        if not existing_zone:
            zone = ZoneDB(**zone_data)
            db.add(zone)
    
    db.commit()
    print(f"Seeded {len(zones_data)} zones")

def seed_devices(db: Session):
    """Seed individual device data"""
    print("Seeding devices...")
    
    zones = db.query(ZoneDB).all()
    device_id_counter = 1
    
    for zone in zones:
        if zone.devices_config:
            for device_type, count in zone.devices_config.items():
                for i in range(count):
                    device = DeviceDB(
                        id=f"device-{device_id_counter:04d}",
                        room_id=zone.room_id,
                        zone_id=zone.id,
                        device_type=device_type,
                        status=random.choice([True, False]) if zone.room_id != "lab-202" else False,  # Lab 202 is in maintenance
                        brightness=random.randint(50, 100) if device_type == "lights" else None,
                        speed=random.randint(30, 80) if device_type == "fans" else None,
                        temperature=random.randint(20, 25) if device_type == "ac" else None,
                        schedule_enabled=True
                    )
                    db.add(device)
                    device_id_counter += 1
    
    db.commit()
    print(f"Seeded {device_id_counter - 1} devices")

def seed_energy_data(db: Session):
    """Seed energy consumption data for the last 24 hours"""
    print("Seeding energy data...")
    
    rooms = db.query(RoomDB).all()
    
    # Generate hourly data for the last 24 hours
    for i in range(24):
        timestamp = datetime.now() - timedelta(hours=i)
        
        for room in rooms:
            # Calculate realistic consumption based on time of day and room status
            hour = timestamp.hour
            base_consumption = room.power_consumption or 1.0
            
            if room.status == "maintenance":
                consumption = base_consumption * 0.1  # Minimal consumption
            elif 8 <= hour <= 18:  # Business hours
                consumption = base_consumption * random.uniform(1.2, 1.8)
            elif 19 <= hour <= 22:  # Evening
                consumption = base_consumption * random.uniform(0.6, 1.0)
            else:  # Night
                consumption = base_consumption * random.uniform(0.2, 0.4)
            
            cost = consumption * 4.0  # ₹4 per kWh
            efficiency = random.uniform(75, 95) if room.status == "active" else random.uniform(60, 75)
            
            energy_record = EnergyReadingDB(
                room_id=room.id,
                timestamp=timestamp,
                consumption=round(consumption, 2),
                cost=round(cost, 2),
                efficiency=round(efficiency, 1)
            )
            db.add(energy_record)
    
    db.commit()
    print("Seeded energy data for last 24 hours")

def seed_alerts(db: Session):
    """Seed alert data"""
    print("Seeding alerts...")
    
    alerts_data = [
        {
            "alert_type": "warning",
            "message": "High energy consumption detected in Room 101",
            "room_id": "room-101",
            "timestamp": datetime.now() - timedelta(minutes=30),
            "is_read": False
        },
        {
            "alert_type": "info", 
            "message": "Scheduled maintenance completed for Lab 201",
            "room_id": "lab-201",
            "timestamp": datetime.now() - timedelta(hours=2),
            "is_read": True
        },
        {
            "alert_type": "success",
            "message": "Energy optimization applied successfully",
            "room_id": "room-102", 
            "timestamp": datetime.now() - timedelta(hours=4),
            "is_read": True
        },
        {
            "alert_type": "warning",
            "message": "Temperature threshold exceeded in Lab 202",
            "room_id": "lab-202",
            "timestamp": datetime.now() - timedelta(minutes=15),
            "is_read": False
        },
        {
            "alert_type": "error",
            "message": "AC system malfunction in Main Auditorium",
            "room_id": "auditorium",
            "timestamp": datetime.now() - timedelta(minutes=45),
            "is_read": False
        },
        {
            "alert_type": "info",
            "message": "Weekly energy report generated",
            "room_id": None,
            "timestamp": datetime.now() - timedelta(days=1),
            "is_read": True
        },
        {
            "alert_type": "success",
            "message": "Monthly savings target achieved: ₹2,450",
            "room_id": None,
            "timestamp": datetime.now() - timedelta(days=2),
            "is_read": False
        }
    ]
    
    for alert_data in alerts_data:
        alert = AlertDB(**alert_data)
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
            db.query(AlertDB).delete()
            db.query(EnergyReadingDB).delete() 
            db.query(DeviceDB).delete()
            db.query(ZoneDB).delete()
            db.query(RoomDB).delete()
            db.commit()
            print("Existing data cleared")
        
        # Seed data in correct order (due to foreign key constraints)
        seed_rooms(db)
        seed_zones(db)
        seed_devices(db)
        seed_energy_data(db)
        seed_alerts(db)
        
        print("\n✅ Database seeding completed successfully!")
        print("\nData summary:")
        print(f"- Rooms: {db.query(RoomDB).count()}")
        print(f"- Zones: {db.query(ZoneDB).count()}")
        print(f"- Devices: {db.query(DeviceDB).count()}")
        print(f"- Energy Records: {db.query(EnergyReadingDB).count()}")
        print(f"- Alerts: {db.query(AlertDB).count()}")
        
    except Exception as e:
        print(f"❌ Error during seeding: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    main()