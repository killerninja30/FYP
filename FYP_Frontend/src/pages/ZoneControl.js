import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Lightbulb, 
  Fan, 
  Monitor, 
  Thermometer,
  Power,
  Settings,
  Users,
  Zap,
  ToggleLeft,
  ToggleRight
} from 'lucide-react';
import { zoneAPI } from '../services/api';
import './ZoneControl.css';

const ZoneControl = () => {
  const [selectedRoom, setSelectedRoom] = useState('room-101');
  const [deviceStates, setDeviceStates] = useState({});
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load initial states from backend on component mount
  useEffect(() => {
    const loadInitialStates = async () => {
      try {
        setLoading(true);
        const response = await zoneAPI.getCurrentStates();
        const data = response.data;
        
        setDeviceStates(data.device_states || {});
        console.log('Loaded device states from backend:', data.device_states);
      } catch (error) {
        console.error('Error loading device states:', error);
        // Fallback to default states if backend is unavailable
        setDeviceStates({
          'room-101': {
            'zone-1': { lights: true, fans: true, projector: true, ac: false },
            'zone-2': { lights: true, fans: true, projector: false, ac: false },
            'zone-3': { lights: false, fans: false, projector: false, ac: false }
          },
          'room-102': {
            'zone-1': { lights: false, fans: false, projector: false, ac: false },
            'zone-2': { lights: false, fans: false, projector: false, ac: false },
            'zone-3': { lights: false, fans: false, projector: false, ac: false }
          },
          'room-103': {
            'zone-1': { lights: true, fans: true, projector: false, ac: true },
            'zone-2': { lights: true, fans: true, projector: true, ac: true },
            'zone-3': { lights: false, fans: true, projector: false, ac: false }
          },
          'lab-201': {
            'zone-1': { lights: true, fans: false, projector: false, ac: true },
            'zone-2': { lights: true, fans: true, projector: false, ac: false },
            'zone-3': { lights: false, fans: false, projector: false, ac: false }
          }
        });
      } finally {
        setLoading(false);
      }
    };

    loadInitialStates();
  }, []);

  // Sync states with backend whenever deviceStates changes
  useEffect(() => {
    const syncWithBackend = async () => {
      if (Object.keys(deviceStates).length === 0 || loading) return;
      
      try {
        setSyncing(true);
        await zoneAPI.syncDeviceStates(deviceStates);
        console.log('Synced device states with backend');
      } catch (error) {
        console.error('Error syncing device states:', error);
      } finally {
        setSyncing(false);
      }
    };

    // Debounce the sync operation to avoid too many API calls
    const timeoutId = setTimeout(syncWithBackend, 500);
    return () => clearTimeout(timeoutId);
  }, [deviceStates, loading]);

  const roomsData = {
    'room-101': {
      name: 'Room 101',
      occupancy: 25,
      maxCapacity: 40,
      temperature: 24,
      zones: [
        { 
          id: 'zone-1', 
          name: 'Front Section', 
          occupancy: 12, 
          maxCapacity: 15,
          devices: { lights: 3, fans: 2, projector: 1, ac: 1 }
        },
        { 
          id: 'zone-2', 
          name: 'Middle Section', 
          occupancy: 8, 
          maxCapacity: 15,
          devices: { lights: 3, fans: 2, projector: 0, ac: 1 }
        },
        { 
          id: 'zone-3', 
          name: 'Back Section', 
          occupancy: 5, 
          maxCapacity: 10,
          devices: { lights: 2, fans: 1, projector: 0, ac: 0 }
        }
      ]
    },
    'room-102': {
      name: 'Room 102',
      occupancy: 0,
      maxCapacity: 35,
      temperature: 26,
      zones: [
        { 
          id: 'zone-1', 
          name: 'Front Section', 
          occupancy: 0, 
          maxCapacity: 12,
          devices: { lights: 2, fans: 1, projector: 1, ac: 1 }
        },
        { 
          id: 'zone-2', 
          name: 'Middle Section', 
          occupancy: 0, 
          maxCapacity: 12,
          devices: { lights: 2, fans: 1, projector: 0, ac: 0 }
        },
        { 
          id: 'zone-3', 
          name: 'Back Section', 
          occupancy: 0, 
          maxCapacity: 11,
          devices: { lights: 2, fans: 1, projector: 0, ac: 0 }
        }
      ]
    },
    'room-103': {
      name: 'Room 103',
      occupancy: 18,
      maxCapacity: 30,
      temperature: 23,
      zones: [
        { 
          id: 'zone-1', 
          name: 'Left Section', 
          occupancy: 7, 
          maxCapacity: 10,
          devices: { lights: 2, fans: 1, projector: 0, ac: 1 }
        },
        { 
          id: 'zone-2', 
          name: 'Center Section', 
          occupancy: 8, 
          maxCapacity: 12,
          devices: { lights: 3, fans: 2, projector: 1, ac: 1 }
        },
        { 
          id: 'zone-3', 
          name: 'Right Section', 
          occupancy: 3, 
          maxCapacity: 8,
          devices: { lights: 2, fans: 1, projector: 0, ac: 0 }
        }
      ]
    },
    'lab-201': {
      name: 'Lab 201',
      occupancy: 12,
      maxCapacity: 25,
      temperature: 22,
      zones: [
        { 
          id: 'zone-1', 
          name: 'Workstation Area', 
          occupancy: 8, 
          maxCapacity: 12,
          devices: { lights: 4, fans: 0, projector: 0, ac: 1 }
        },
        { 
          id: 'zone-2', 
          name: 'Discussion Area', 
          occupancy: 4, 
          maxCapacity: 8,
          devices: { lights: 3, fans: 2, projector: 0, ac: 0 }
        },
        { 
          id: 'zone-3', 
          name: 'Equipment Area', 
          occupancy: 0, 
          maxCapacity: 5,
          devices: { lights: 2, fans: 0, projector: 0, ac: 0 }
        }
      ]
    }
  };

  const deviceIcons = {
    lights: Lightbulb,
    fans: Fan,
    projector: Monitor,
    ac: Thermometer
  };

  const deviceColors = {
    lights: '#f59e0b',
    fans: '#3b82f6',
    projector: '#8b5cf6',
    ac: '#ef4444'
  };

  const toggleDevice = async (roomId, zoneId, deviceType) => {
    // Update local state immediately for responsive UI
    const newState = !deviceStates[roomId]?.[zoneId]?.[deviceType];
    
    setDeviceStates(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [zoneId]: {
          ...prev[roomId][zoneId],
          [deviceType]: newState
        }
      }
    }));

    // Update backend asynchronously
    try {
      const deviceState = {
        status: newState,
        brightness: deviceType === 'lights' && newState ? 80 : 0,
        speed: deviceType === 'fans' && newState ? 60 : 0,
        temperature: deviceType === 'ac' && newState ? 24 : 22,
        schedule: true
      };
      
      await zoneAPI.updateDevice(roomId, zoneId, deviceType, deviceState);
      console.log(`Updated ${deviceType} in ${zoneId} of ${roomId} to ${newState}`);
    } catch (error) {
      console.error('Error updating device:', error);
      // Revert local state if backend update fails
      setDeviceStates(prev => ({
        ...prev,
        [roomId]: {
          ...prev[roomId],
          [zoneId]: {
            ...prev[roomId][zoneId],
            [deviceType]: !newState
          }
        }
      }));
    }
  };

  const toggleAllZoneDevices = async (roomId, zoneId, state) => {
    // Update local state immediately
    setDeviceStates(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [zoneId]: {
          lights: state,
          fans: state,
          projector: state,
          ac: state
        }
      }
    }));

    // Update backend for each device type
    const deviceTypes = ['lights', 'fans', 'projector', 'ac'];
    
    try {
      const updatePromises = deviceTypes.map(deviceType => {
        const deviceState = {
          status: state,
          brightness: deviceType === 'lights' && state ? 80 : 0,
          speed: deviceType === 'fans' && state ? 60 : 0,
          temperature: deviceType === 'ac' && state ? 24 : 22,
          schedule: true
        };
        
        return zoneAPI.updateDevice(roomId, zoneId, deviceType, deviceState);
      });

      await Promise.all(updatePromises);
      console.log(`Updated all devices in ${zoneId} of ${roomId} to ${state}`);
    } catch (error) {
      console.error('Error updating zone devices:', error);
      // Revert if any update fails
      setDeviceStates(prev => ({
        ...prev,
        [roomId]: {
          ...prev[roomId],
          [zoneId]: {
            lights: !state,
            fans: !state,
            projector: !state,
            ac: !state
          }
        }
      }));
    }
  };

  const currentRoom = roomsData[selectedRoom];

  const DeviceControl = ({ roomId, zoneId, deviceType, deviceCount, isActive, onToggle }) => {
    const Icon = deviceIcons[deviceType];
    const color = deviceColors[deviceType];
    
    return (
      <div className={`device-control ${isActive ? 'active' : 'inactive'}`}>
        <div className="device-info">
          <div className="device-icon" style={{ backgroundColor: isActive ? color : '#9ca3af' }}>
            <Icon size={16} color="white" />
          </div>
          <div className="device-details">
            <span className="device-name">{deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}</span>
            <span className="device-count">{deviceCount} units</span>
          </div>
        </div>
        <button
          className={`toggle-button ${isActive ? 'on' : 'off'}`}
          onClick={onToggle}
        >
          {isActive ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
        </button>
      </div>
    );
  };

  const ZoneCard = ({ roomId, zone, deviceState }) => {
    const occupancyPercentage = (zone.occupancy / zone.maxCapacity) * 100;
    const activeDevices = Object.values(deviceState).filter(Boolean).length;
    const totalDevices = Object.keys(deviceState).length;

    return (
      <div className={`zone-card ${zone.occupancy > 0 ? 'occupied' : 'empty'}`}>
        <div className="zone-header">
          <div className="zone-info">
            <h3>{zone.name}</h3>
            <div className="zone-stats">
              <span className="occupancy">
                <Users size={14} />
                {zone.occupancy}/{zone.maxCapacity}
              </span>
              <span className="device-status">
                <Power size={14} />
                {activeDevices}/{totalDevices} active
              </span>
            </div>
          </div>
          <div className="zone-controls">
            <button
              className="zone-button all-on"
              onClick={() => toggleAllZoneDevices(roomId, zone.id, true)}
              disabled={zone.occupancy === 0}
            >
              All On
            </button>
            <button
              className="zone-button all-off"
              onClick={() => toggleAllZoneDevices(roomId, zone.id, false)}
            >
              All Off
            </button>
          </div>
        </div>

        <div className="occupancy-bar">
          <div className="occupancy-label">Occupancy</div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ 
                width: `${occupancyPercentage}%`,
                backgroundColor: occupancyPercentage > 80 ? '#ef4444' : 
                               occupancyPercentage > 60 ? '#f59e0b' : '#10b981'
              }}
            ></div>
          </div>
          <span className="occupancy-percentage">{Math.round(occupancyPercentage)}%</span>
        </div>

        <div className="devices-grid">
          {Object.entries(zone.devices).map(([deviceType, deviceCount]) => (
            <DeviceControl
              key={deviceType}
              roomId={roomId}
              zoneId={zone.id}
              deviceType={deviceType}
              deviceCount={deviceCount}
              isActive={deviceState[deviceType]}
              onToggle={() => toggleDevice(roomId, zone.id, deviceType)}
            />
          ))}
        </div>
      </div>
    );
  };

  const RoomSelector = ({ rooms, selectedRoom, onRoomChange }) => (
    <div className="room-selector">
      <h2>Select Classroom</h2>
      <div className="room-tabs">
        {Object.entries(rooms).map(([roomId, room]) => (
          <button
            key={roomId}
            className={`room-tab ${roomId === selectedRoom ? 'active' : ''}`}
            onClick={() => onRoomChange(roomId)}
          >
            <MapPin size={16} />
            <span>{room.name}</span>
            <div className="room-tab-stats">
              <span className="tab-occupancy">{room.occupancy} people</span>
              <span className="tab-temp">{room.temperature}°C</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  // Show loading state
  if (loading) {
    return (
      <div className="zone-control">
        <div className="zone-header">
          <h1>Zone-Based Device Control</h1>
          <p>Loading zone data...</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Fetching device states from backend...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="zone-control">
      <div className="zone-header">
        <h1>Zone-Based Device Control</h1>
        <p>Targeted energy management based on occupancy zones</p>
        {syncing && <div className="sync-indicator">🔄 Syncing with backend...</div>}
      </div>

      <RoomSelector
        rooms={roomsData}
        selectedRoom={selectedRoom}
        onRoomChange={setSelectedRoom}
      />

      {currentRoom && (
        <div className="room-overview">
          <div className="room-info-card">
            <h2>{currentRoom.name} - Zone Control</h2>
            <div className="room-metrics">
              <div className="metric">
                <Users size={20} />
                <div>
                  <span className="metric-value">{currentRoom.occupancy}</span>
                  <span className="metric-label">People Present</span>
                </div>
              </div>
              <div className="metric">
                <Thermometer size={20} />
                <div>
                  <span className="metric-value">{currentRoom.temperature}°C</span>
                  <span className="metric-label">Temperature</span>
                </div>
              </div>
              <div className="metric">
                <Zap size={20} />
                <div>
                  <span className="metric-value">
                    {Object.values(deviceStates[selectedRoom] || {}).reduce((acc, zone) => 
                      acc + Object.values(zone).filter(Boolean).length, 0
                    )}
                  </span>
                  <span className="metric-label">Active Devices</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="zones-container">
        <h2>Zone Management</h2>
        <div className="zones-grid">
          {currentRoom?.zones.map(zone => (
            <ZoneCard
              key={zone.id}
              roomId={selectedRoom}
              zone={zone}
              deviceState={deviceStates[selectedRoom]?.[zone.id] || {}}
            />
          ))}
        </div>
      </div>

      <div className="automation-panel">
        <h2>Automation Settings</h2>
        <div className="automation-options">
          <div className="automation-option">
            <div className="option-info">
              <h4>Auto-Off When Empty</h4>
              <p>Automatically turn off devices when no occupancy is detected</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="automation-option">
            <div className="option-info">
              <h4>Zone-Based Lighting</h4>
              <p>Control lights based on individual zone occupancy</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="automation-option">
            <div className="option-info">
              <h4>Smart Cooling</h4>
              <p>Adjust AC settings based on occupancy density</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
          <div className="automation-option">
            <div className="option-info">
              <h4>Energy Optimization</h4>
              <p>Apply ML-based optimization for maximum efficiency</p>
            </div>
            <label className="switch">
              <input type="checkbox" defaultChecked />
              <span className="slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoneControl;
