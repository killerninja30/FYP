import requests
import json

print("Testing device state synchronization...")

# Update a device state
device_state = {'status': False, 'brightness': 0, 'schedule': True}
response = requests.put('http://127.0.0.1:8000/api/zone-control/room-101/zone-1/lights', json=device_state)
print('Device update response:', response.status_code)

# Check dashboard rooms
response = requests.get('http://127.0.0.1:8000/api/dashboard/rooms')
rooms = response.json()
room_101 = next((r for r in rooms if r['id'] == 'room-101'), None)
if room_101:
    print('Room 101 active lights:', room_101['devices']['lights']['active'])
    print('Room 101 total lights:', room_101['devices']['lights']['total'])
    print('Room 101 occupancy:', room_101['occupancy'])
    print('Room 101 power consumption:', room_101['power_consumption'])
else:
    print('Room 101 not found')

# Turn the light back on
device_state = {'status': True, 'brightness': 80, 'schedule': True}
response = requests.put('http://127.0.0.1:8000/api/zone-control/room-101/zone-1/lights', json=device_state)
print('\nTurning light back on, response:', response.status_code)

# Check dashboard again
response = requests.get('http://127.0.0.1:8000/api/dashboard/rooms')
rooms = response.json()
room_101 = next((r for r in rooms if r['id'] == 'room-101'), None)
if room_101:
    print('Room 101 active lights after turning on:', room_101['devices']['lights']['active'])
    print('Room 101 power consumption after turning on:', room_101['power_consumption'])