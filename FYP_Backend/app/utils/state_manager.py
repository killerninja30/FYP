from typing import Dict, Any
from datetime import datetime
import threading

class StateManager:
    """
    Singleton class to manage shared state across the application
    This ensures consistent data between different endpoints
    """
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(StateManager, cls).__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._device_states = {
                'room-101': {
                    'zone-1': {'lights': True, 'fans': True, 'projector': True, 'ac': False},
                    'zone-2': {'lights': True, 'fans': True, 'projector': False, 'ac': False},
                    'zone-3': {'lights': False, 'fans': False, 'projector': False, 'ac': False}
                },
                'room-102': {
                    'zone-1': {'lights': False, 'fans': False, 'projector': False, 'ac': False},
                    'zone-2': {'lights': False, 'fans': False, 'projector': False, 'ac': False},
                    'zone-3': {'lights': False, 'fans': False, 'projector': False, 'ac': False}
                },
                'room-103': {
                    'zone-1': {'lights': True, 'fans': True, 'projector': False, 'ac': True},
                    'zone-2': {'lights': True, 'fans': True, 'projector': True, 'ac': True},
                    'zone-3': {'lights': False, 'fans': True, 'projector': False, 'ac': False}
                },
                'lab-201': {
                    'zone-1': {'lights': True, 'fans': False, 'projector': False, 'ac': True},
                    'zone-2': {'lights': True, 'fans': True, 'projector': False, 'ac': False},
                    'zone-3': {'lights': False, 'fans': False, 'projector': False, 'ac': False}
                }
            }
            
            self._room_occupancy = {
                'room-101': {'occupancy': 25, 'zones': {'zone-1': 12, 'zone-2': 8, 'zone-3': 5}},
                'room-102': {'occupancy': 0, 'zones': {'zone-1': 0, 'zone-2': 0, 'zone-3': 0}},
                'room-103': {'occupancy': 18, 'zones': {'zone-1': 7, 'zone-2': 8, 'zone-3': 3}},
                'lab-201': {'occupancy': 12, 'zones': {'zone-1': 8, 'zone-2': 4, 'zone-3': 0}}
            }
            
            self._device_counts = {
                'room-101': {
                    'zone-1': {'lights': 3, 'fans': 2, 'projector': 1, 'ac': 1},
                    'zone-2': {'lights': 3, 'fans': 2, 'projector': 0, 'ac': 1},
                    'zone-3': {'lights': 2, 'fans': 1, 'projector': 0, 'ac': 0}
                },
                'room-102': {
                    'zone-1': {'lights': 2, 'fans': 1, 'projector': 1, 'ac': 1},
                    'zone-2': {'lights': 2, 'fans': 1, 'projector': 0, 'ac': 0},
                    'zone-3': {'lights': 2, 'fans': 1, 'projector': 0, 'ac': 0}
                },
                'room-103': {
                    'zone-1': {'lights': 2, 'fans': 1, 'projector': 0, 'ac': 1},
                    'zone-2': {'lights': 3, 'fans': 2, 'projector': 1, 'ac': 1},
                    'zone-3': {'lights': 2, 'fans': 1, 'projector': 0, 'ac': 0}
                },
                'lab-201': {
                    'zone-1': {'lights': 4, 'fans': 0, 'projector': 0, 'ac': 1},
                    'zone-2': {'lights': 3, 'fans': 2, 'projector': 0, 'ac': 0},
                    'zone-3': {'lights': 2, 'fans': 0, 'projector': 0, 'ac': 0}
                }
            }
            
            self._room_info = {
                'room-101': {'name': 'Room 101', 'max_capacity': 40, 'temperature': 24},
                'room-102': {'name': 'Room 102', 'max_capacity': 35, 'temperature': 26},
                'room-103': {'name': 'Room 103', 'max_capacity': 30, 'temperature': 23},
                'lab-201': {'name': 'Lab 201', 'max_capacity': 25, 'temperature': 22}
            }
            
            self._last_updated = datetime.now()
            self._initialized = True
    
    def get_device_states(self) -> Dict[str, Dict[str, Dict[str, bool]]]:
        """Get current device states"""
        return self._device_states.copy()
    
    def update_device_state(self, room_id: str, zone_id: str, device_type: str, state: bool) -> bool:
        """Update a specific device state"""
        try:
            if room_id in self._device_states:
                if zone_id in self._device_states[room_id]:
                    if device_type in self._device_states[room_id][zone_id]:
                        self._device_states[room_id][zone_id][device_type] = state
                        self._last_updated = datetime.now()
                        return True
            return False
        except Exception:
            return False
    
    def get_room_occupancy(self, room_id: str = None) -> Dict[str, Any]:
        """Get occupancy data for a room or all rooms"""
        if room_id:
            return self._room_occupancy.get(room_id, {})
        return self._room_occupancy.copy()
    
    def get_device_counts(self, room_id: str = None) -> Dict[str, Any]:
        """Get device counts for a room or all rooms"""
        if room_id:
            return self._device_counts.get(room_id, {})
        return self._device_counts.copy()
    
    def get_room_info(self, room_id: str = None) -> Dict[str, Any]:
        """Get room information"""
        if room_id:
            return self._room_info.get(room_id, {})
        return self._room_info.copy()
    
    def calculate_active_devices(self, room_id: str = None) -> Dict[str, Dict[str, int]]:
        """Calculate active device counts per room"""
        result = {}
        rooms_to_process = [room_id] if room_id else self._device_states.keys()
        
        for r_id in rooms_to_process:
            if r_id not in self._device_states:
                continue
                
            active_devices = {'lights': 0, 'fans': 0, 'projector': 0, 'ac': 0}
            total_devices = {'lights': 0, 'fans': 0, 'projector': 0, 'ac': 0}
            
            for zone_id, zone_devices in self._device_states[r_id].items():
                for device_type, is_active in zone_devices.items():
                    if device_type in active_devices:
                        device_count = self._device_counts.get(r_id, {}).get(zone_id, {}).get(device_type, 0)
                        total_devices[device_type] += device_count
                        if is_active:
                            active_devices[device_type] += device_count
            
            result[r_id] = {
                'active': active_devices,
                'total': total_devices
            }
        
        if room_id:
            return result.get(room_id, {})
        return result
    
    def get_last_updated(self) -> datetime:
        """Get last update timestamp"""
        return self._last_updated
    
    def reset_state(self):
        """Reset all states to default (for testing purposes)"""
        self.__init__()

# Global instance
state_manager = StateManager()