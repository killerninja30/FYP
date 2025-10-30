#!/usr/bin/env python3
"""
Test script for Smart Detection API
"""

import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_api_endpoints():
    """Test all smart detection API endpoints"""
    print("🚀 Testing Smart Detection API Endpoints\n")
    
    # Test 1: Health Check
    print("1. Testing Health Check...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"   ✅ Health Check: {response.status_code} - {response.json()}")
    except Exception as e:
        print(f"   ❌ Health Check Failed: {e}")
    
    # Test 2: System Status
    print("\n2. Testing System Status...")
    try:
        response = requests.get(f"{BASE_URL}/api/smart-detection/status")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ System Status: {response.status_code}")
            print(f"      Camera Available: {data['camera_available']}")
            print(f"      AI Model Loaded: {data['ai_model_loaded']}")
            print(f"      Hardware Status: {data['hardware_status']}")
        else:
            print(f"   ❌ System Status Failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ System Status Failed: {e}")
    
    # Test 3: Relay Status
    print("\n3. Testing Relay Status...")
    try:
        response = requests.get(f"{BASE_URL}/api/smart-detection/relay-status")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Relay Status: {response.status_code}")
            for relay in data['relays']:
                print(f"      Pin {relay['pin']}: {relay['status']} - {', '.join(relay['appliances'])}")
        else:
            print(f"   ❌ Relay Status Failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Relay Status Failed: {e}")
    
    # Test 4: Analytics
    print("\n4. Testing Analytics...")
    try:
        response = requests.get(f"{BASE_URL}/api/smart-detection/analytics")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Analytics: {response.status_code}")
            print(f"      Daily Detections: {data['daily_detections']}")
            print(f"      Energy Saved: {data['energy_saved']}")
            print(f"      Cost Saved: {data['cost_saved']}")
        else:
            print(f"   ❌ Analytics Failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Analytics Failed: {e}")
    
    # Test 5: Smart Detection Run
    print("\n5. Testing Smart Detection...")
    try:
        print("   🔄 Running detection (this takes ~5 seconds)...")
        response = requests.post(f"{BASE_URL}/api/smart-detection/detect")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Detection Complete: {response.status_code}")
            print(f"      Human Detected: {data['human_detected']}")
            print(f"      Detection Rate: {data['detection_rate']:.1f}%")
            print(f"      Occupied Zones: {data['occupied_zones']}")
            print(f"      Commands Executed: {len(data['commands'])}")
        else:
            print(f"   ❌ Detection Failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Detection Failed: {e}")
    
    # Test 6: Manual Relay Control
    print("\n6. Testing Manual Relay Control...")
    try:
        # Turn on GPIO pin 2
        response = requests.post(f"{BASE_URL}/api/smart-detection/manual-control/2/on")
        if response.status_code == 200:
            print(f"   ✅ Manual Control ON: {response.json()['message']}")
        
        time.sleep(1)
        
        # Turn off GPIO pin 2
        response = requests.post(f"{BASE_URL}/api/smart-detection/manual-control/2/off")
        if response.status_code == 200:
            print(f"   ✅ Manual Control OFF: {response.json()['message']}")
    except Exception as e:
        print(f"   ❌ Manual Control Failed: {e}")
    
    # Test 7: Emergency Stop
    print("\n7. Testing Emergency Stop...")
    try:
        response = requests.post(f"{BASE_URL}/api/smart-detection/emergency-stop")
        if response.status_code == 200:
            print(f"   ✅ Emergency Stop: {response.json()['message']}")
        else:
            print(f"   ❌ Emergency Stop Failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Emergency Stop Failed: {e}")
    
    # Test 8: Alerts
    print("\n8. Testing Alerts...")
    try:
        response = requests.get(f"{BASE_URL}/api/smart-detection/alerts")
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Alerts: {response.status_code}")
            for alert in data:
                print(f"      {alert['type'].upper()}: {alert['message']} ({alert['time']})")
        else:
            print(f"   ❌ Alerts Failed: {response.status_code}")
    except Exception as e:
        print(f"   ❌ Alerts Failed: {e}")
    
    print("\n🎉 API Testing Complete!")
    print(f"\n💡 You can also visit:")
    print(f"   - API Documentation: {BASE_URL}/docs")
    print(f"   - Smart Detection UI: {BASE_URL}/api/smart-detection/ui")
    print(f"   - Camera Preview: {BASE_URL}/api/smart-detection/preview")

if __name__ == "__main__":
    test_api_endpoints()