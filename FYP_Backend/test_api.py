#!/usr/bin/env python3
"""
Test script to verify all API endpoints are working correctly
"""
import requests
import json
import sys

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(endpoint, method="GET", data=None):
    """Test a single endpoint"""
    try:
        url = f"{BASE_URL}{endpoint}"
        if method == "GET":
            response = requests.get(url)
        elif method == "POST":
            response = requests.post(url, json=data)
        elif method == "PUT":
            response = requests.put(url, json=data)
        
        print(f"{method} {endpoint}: {response.status_code}")
        if response.status_code != 200:
            print(f"  Error: {response.text}")
        return response.status_code == 200
    except Exception as e:
        print(f"{method} {endpoint}: ERROR - {e}")
        return False

def main():
    print("Testing IoT Energy Backend API Endpoints")
    print("=" * 50)
    
    # Test health endpoint
    test_endpoint("/health")
    
    # Test dashboard endpoints
    print("\nDashboard Endpoints:")
    test_endpoint("/api/dashboard/summary")
    test_endpoint("/api/dashboard/rooms")
    test_endpoint("/api/dashboard/energy")
    test_endpoint("/api/dashboard/alerts")
    
    # Test zone control endpoints
    print("\nZone Control Endpoints:")
    test_endpoint("/api/zone-control/")
    test_endpoint("/api/zone-control/current-states")
    
    # Test device update endpoint
    print("\nTesting Device Update:")
    device_state = {
        "status": True,
        "brightness": 80,
        "schedule": True
    }
    test_endpoint("/api/zone-control/room-101/zone-1/lights", "PUT", device_state)
    
    # Test sync endpoint
    print("\nTesting State Sync:")
    sync_data = {
        "room-101": {
            "zone-1": {
                "lights": True,
                "fans": False,
                "projector": False,
                "ac": False
            }
        }
    }
    test_endpoint("/api/zone-control/sync-states", "POST", sync_data)
    
    print("\n" + "=" * 50)
    print("API Testing Complete")

if __name__ == "__main__":
    main()