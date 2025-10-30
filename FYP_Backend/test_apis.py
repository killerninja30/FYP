#!/usr/bin/env python3
"""
Quick API test script to verify endpoints are working with database data
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_api_endpoint(endpoint, method="GET", data=None):
    """Test a single API endpoint"""
    url = f"{BASE_URL}{endpoint}"
    try:
        if method == "GET":
            response = requests.get(url, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=data, timeout=5)
        
        print(f"\n{'='*60}")
        print(f"🔗 {method} {endpoint}")
        print(f"📊 Status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Success!")
            
            # Show preview of response data
            if isinstance(result, dict):
                if "alerts" in result and isinstance(result["alerts"], list):
                    print(f"📄 Data: {len(result['alerts'])} alerts")
                elif isinstance(result, dict) and len(result) < 10:
                    print(f"📄 Data: {json.dumps(result, indent=2)[:200]}...")
                else:
                    print(f"📄 Data keys: {list(result.keys())}")
            elif isinstance(result, list):
                print(f"📄 Data: {len(result)} items")
                if result and isinstance(result[0], dict):
                    print(f"📄 Sample keys: {list(result[0].keys())}")
            
        else:
            print(f"❌ Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"\n{'='*60}")
        print(f"🔗 {method} {endpoint}")
        print(f"❌ Connection Error: {e}")

def main():
    """Test main API endpoints"""
    print("🚀 Testing IoT Energy Management API with Database Data")
    print("=" * 80)
    
    # Health check
    test_api_endpoint("/health")
    
    # Dashboard APIs
    test_api_endpoint("/api/dashboard/summary")
    test_api_endpoint("/api/dashboard/rooms")
    test_api_endpoint("/api/dashboard/energy")
    test_api_endpoint("/api/dashboard/alerts")
    
    # Monitoring APIs
    test_api_endpoint("/api/monitoring/rooms")
    test_api_endpoint("/api/monitoring/energy")
    test_api_endpoint("/api/monitoring/room/room-101")
    test_api_endpoint("/api/monitoring/system-status")
    
    # Occupancy APIs
    test_api_endpoint("/api/occupancy/cameras")
    test_api_endpoint("/api/occupancy/analytics")
    test_api_endpoint("/api/occupancy/alerts")
    
    # Zone Control APIs
    test_api_endpoint("/api/zone-control/")
    test_api_endpoint("/api/zone-control/room-101")
    
    # Energy Analytics APIs
    test_api_endpoint("/api/energy-analytics/overview?period=daily")
    test_api_endpoint("/api/energy-analytics/consumption")
    test_api_endpoint("/api/energy-analytics/trends")
    test_api_endpoint("/api/energy-analytics/savings")
    
    # Device Control APIs
    test_api_endpoint("/api/device-control/")
    test_api_endpoint("/api/device-control/room/room-101")
    test_api_endpoint("/api/device-control/energy-consumption")
    test_api_endpoint("/api/device-control/status-overview")
    
    # Test a POST endpoint
    device_control_data = {
        "room_id": "room-101",
        "zone_id": "zone-101-1", 
        "device_type": "lights",
        "action": "turn_on",
        "brightness": 75
    }
    test_api_endpoint("/api/device-control/control", "PUT", device_control_data)
    
    print(f"\n{'='*80}")
    print("✅ API Testing Complete!")
    print("📋 Import the Postman collection for detailed testing:")
    print("   📁 File: IoT_Energy_Management_Postman_Collection.json")
    print("🌐 Swagger UI: http://localhost:8000/docs")
    print("📊 ReDoc: http://localhost:8000/redoc")

if __name__ == "__main__":
    main()