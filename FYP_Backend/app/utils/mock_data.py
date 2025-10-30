import random
import json
from datetime import datetime, timedelta
from typing import List, Dict
from app.models.schemas import (
    Room, Zone, DeviceInfo, DeviceControl, DeviceState, 
    EnergyData, CameraFeed, Alert, TimeSeriesData
)
from app.utils.state_manager import state_manager

class MockDataGenerator:
    def __init__(self):
        self.rooms_config = {
            'room-101': {'name': 'Room 101', 'max_capacity': 40, 'zones': 3},
            'room-102': {'name': 'Room 102', 'max_capacity': 35, 'zones': 3},
            'room-103': {'name': 'Room 103', 'max_capacity': 30, 'zones': 3},
            'lab-201': {'name': 'Lab 201', 'max_capacity': 25, 'zones': 3}
        }
        
    def generate_device_info(self, device_type: str, is_active: bool) -> DeviceInfo:
        """Generate device info based on type and activity"""
        device_counts = {
            'lights': (6, 8),
            'fans': (3, 4), 
            'projector': (1, 1),
            'ac': (1, 2)
        }
        
        min_count, max_count = device_counts.get(device_type, (1, 1))
        total = random.randint(min_count, max_count)
        active = random.randint(0, total) if is_active else 0
        
        return DeviceInfo(active=active, total=total)
    
    def generate_zones(self, room_id: str, room_occupancy: int) -> List[Zone]:
        """Generate zones for a room"""
        zones = []
        zone_names = {
            'room-101': ['Front Section', 'Middle Section', 'Back Section'],
            'room-102': ['Front Section', 'Middle Section', 'Back Section'],
            'room-103': ['Left Section', 'Center Section', 'Right Section'],
            'lab-201': ['Workstation Area', 'Discussion Area', 'Equipment Area']
        }
        
        room_config = self.rooms_config[room_id]
        zone_list = zone_names[room_id]
        
        # Distribute occupancy across zones
        occupancy_per_zone = []
        remaining_occupancy = room_occupancy
        
        for i in range(len(zone_list)):
            if i == len(zone_list) - 1:
                # Last zone gets remaining occupancy
                occupancy_per_zone.append(remaining_occupancy)
            else:
                # Random distribution with some logic
                max_for_zone = min(remaining_occupancy, room_config['max_capacity'] // len(zone_list) + 5)
                zone_occupancy = random.randint(0, max_for_zone) if remaining_occupancy > 0 else 0
                occupancy_per_zone.append(zone_occupancy)
                remaining_occupancy -= zone_occupancy
        
        for i, name in enumerate(zone_list):
            zone_max_capacity = room_config['max_capacity'] // len(zone_list) + random.randint(-2, 5)
            zone = Zone(
                id=f'zone-{i+1}',
                name=name,
                occupancy=occupancy_per_zone[i],
                max_capacity=zone_max_capacity,
                devices={
                    'lights': random.randint(2, 4),
                    'fans': random.randint(1, 2),
                    'projector': 1 if i == 1 else 0,  # Usually in middle/center
                    'ac': 1 if i < 2 else 0  # Usually in front zones
                }
            )
            zones.append(zone)
        
        return zones
    
    def generate_zones_from_state(self, room_id: str, occupancy_data: Dict, device_counts_data: Dict) -> List[Zone]:
        """Generate zones using state manager data"""
        zones = []
        zone_names = {
            'room-101': ['Front Section', 'Middle Section', 'Back Section'],
            'room-102': ['Front Section', 'Middle Section', 'Back Section'],
            'room-103': ['Left Section', 'Center Section', 'Right Section'],
            'lab-201': ['Workstation Area', 'Discussion Area', 'Equipment Area']
        }
        
        room_config = self.rooms_config[room_id]
        zone_list = zone_names.get(room_id, ['Zone 1', 'Zone 2', 'Zone 3'])
        zone_occupancy_data = occupancy_data.get('zones', {})
        
        for i, name in enumerate(zone_list):
            zone_id = f'zone-{i+1}'
            zone_max_capacity = room_config['max_capacity'] // len(zone_list)
            zone_occupancy = zone_occupancy_data.get(zone_id, 0)
            zone_devices = device_counts_data.get(zone_id, {})
            
            zone = Zone(
                id=zone_id,
                name=name,
                occupancy=zone_occupancy,
                max_capacity=zone_max_capacity,
                devices=zone_devices
            )
            zones.append(zone)
        
        return zones
    
    def generate_room_data(self) -> List[Room]:
        """Generate mock room data using state manager"""
        rooms = []
        
        # Get current states from state manager
        device_states = state_manager.get_device_states()
        room_occupancy = state_manager.get_room_occupancy()
        device_counts = state_manager.get_device_counts()
        room_info = state_manager.get_room_info()
        active_device_counts = state_manager.calculate_active_devices()
        
        for room_id, config in self.rooms_config.items():
            # Get occupancy from state manager
            occupancy_data = room_occupancy.get(room_id, {})
            occupancy = occupancy_data.get('occupancy', 0)
            
            # Status based on occupancy
            status = "active" if occupancy > 0 else "empty"
            
            # Get room info from state manager
            room_data = room_info.get(room_id, {})
            temperature = room_data.get('temperature', 24)
            
            # Power consumption based on active devices
            active_devices = active_device_counts.get(room_id, {}).get('active', {})
            power_consumption = 0
            for device_type, count in active_devices.items():
                # Different power consumption per device type
                device_power = {'lights': 0.1, 'fans': 0.15, 'projector': 0.3, 'ac': 1.5}
                power_consumption += count * device_power.get(device_type, 0.1)
            power_consumption = round(power_consumption, 1)
            
            # Generate zones using state manager data
            zones = self.generate_zones_from_state(room_id, occupancy_data, device_counts.get(room_id, {}))
            
            # Generate device control info from state manager
            device_data = active_device_counts.get(room_id, {})
            devices = DeviceControl(
                lights=DeviceInfo(
                    active=device_data.get('active', {}).get('lights', 0),
                    total=device_data.get('total', {}).get('lights', 0)
                ),
                fans=DeviceInfo(
                    active=device_data.get('active', {}).get('fans', 0),
                    total=device_data.get('total', {}).get('fans', 0)
                ),
                projector=DeviceInfo(
                    active=device_data.get('active', {}).get('projector', 0),
                    total=device_data.get('total', {}).get('projector', 0)
                ),
                ac=DeviceInfo(
                    active=device_data.get('active', {}).get('ac', 0),
                    total=device_data.get('total', {}).get('ac', 0)
                )
            )
            
            room = Room(
                id=room_id,
                name=config['name'],
                status=status,
                occupancy=occupancy,
                max_capacity=config['max_capacity'],
                temperature=temperature,
                power_consumption=power_consumption,
                zones=zones,
                devices=devices
            )
            rooms.append(room)
        
        return rooms
    
    def generate_energy_time_series(self, hours: int = 24) -> List[TimeSeriesData]:
        """Generate energy consumption time series data"""
        data = []
        base_consumption = 50
        
        for i in range(hours):
            hour = (datetime.now() - timedelta(hours=hours-i-1)).strftime('%H:%M')
            
            # Simulate daily pattern (higher during day, lower at night)
            hour_int = int(hour.split(':')[0])
            if 8 <= hour_int <= 18:  # Business hours
                consumption_factor = random.uniform(0.8, 1.2)
            elif 6 <= hour_int < 8 or 18 < hour_int <= 20:  # Transition hours
                consumption_factor = random.uniform(0.4, 0.8)
            else:  # Night hours
                consumption_factor = random.uniform(0.1, 0.4)
            
            consumption = round(base_consumption * consumption_factor + random.uniform(-10, 10), 1)
            cost = round(consumption * 4, 0)  # ₹4 per kWh
            savings = round(consumption * 0.3 * random.uniform(0.8, 1.2), 0)  # 30% savings estimate
            efficiency = round(random.uniform(85, 95), 1)
            
            data.append(TimeSeriesData(
                time=hour,
                consumption=consumption,
                cost=cost,
                savings=savings,
                efficiency=efficiency
            ))
        
        return data
    
    def generate_camera_feeds(self) -> List[CameraFeed]:
        """Generate mock camera feed data"""
        feeds = []
        
        for room_id, config in self.rooms_config.items():
            camera_id = f"cam-{room_id.split('-')[1]}"
            
            # Random detection data
            detected_people = random.randint(0, config['max_capacity']) if random.choice([True, False]) else 0
            confidence = round(random.uniform(88, 98), 1)
            
            # Generate zones for camera
            zones = self.generate_zones(room_id, detected_people)
            
            feed = CameraFeed(
                id=camera_id,
                room_id=room_id,
                name=f"{config['name']} - Camera View",
                status="active",
                detected_people=detected_people,
                confidence=confidence,
                last_update=f"{random.randint(1, 5)} sec ago",
                zones=zones
            )
            feeds.append(feed)
        
        return feeds
    
    def generate_alerts(self, count: int = 5) -> List[Alert]:
        """Generate mock alerts"""
        alert_templates = [
            ("warning", "High energy consumption in {room}"),
            ("info", "Auto-optimization applied to {room}"),
            ("success", "{room} switched to energy-saving mode"),
            ("warning", "Unusual occupancy pattern detected in {room}"),
            ("info", "Scheduled maintenance for {room}"),
            ("success", "Energy efficiency improved by 12% in {room}"),
            ("warning", "AC temperature set too low in {room}"),
            ("info", "New occupancy threshold reached in {room}")
        ]
        
        alerts = []
        rooms = list(self.rooms_config.keys())
        
        for i in range(count):
            alert_type, message_template = random.choice(alert_templates)
            room_id = random.choice(rooms)
            room_name = self.rooms_config[room_id]['name']
            
            alert = Alert(
                id=i + 1,
                type=alert_type,
                message=message_template.format(room=room_name),
                time=f"{random.randint(1, 60)} min ago",
                room_id=room_id
            )
            alerts.append(alert)
        
        return alerts
    
    def generate_device_states(self) -> Dict[str, Dict[str, Dict[str, DeviceState]]]:
        """Generate device states for zone control using state manager"""
        device_states = {}
        current_states = state_manager.get_device_states()
        room_occupancy = state_manager.get_room_occupancy()
        
        for room_id in self.rooms_config.keys():
            device_states[room_id] = {}
            room_states = current_states.get(room_id, {})
            occupancy_data = room_occupancy.get(room_id, {}).get('zones', {})
            
            for zone_num in range(1, 4):  # 3 zones per room
                zone_id = f'zone-{zone_num}'
                zone_states = room_states.get(zone_id, {})
                zone_occupancy = occupancy_data.get(zone_id, 0)
                has_occupancy = zone_occupancy > 0
                
                device_states[room_id][zone_id] = {
                    'lights': DeviceState(
                        status=zone_states.get('lights', False),
                        brightness=random.randint(50, 100) if zone_states.get('lights', False) else 0,
                        schedule=True
                    ),
                    'fans': DeviceState(
                        status=zone_states.get('fans', False),
                        speed=random.randint(40, 80) if zone_states.get('fans', False) else 0,
                        schedule=True
                    ),
                    'projector': DeviceState(
                        status=zone_states.get('projector', False),
                        schedule=False
                    ),
                    'ac': DeviceState(
                        status=zone_states.get('ac', False),
                        temperature=random.randint(22, 26) if zone_states.get('ac', False) else 24,
                        schedule=True
                    )
                }
        
        return device_states

# Global instance
mock_generator = MockDataGenerator()