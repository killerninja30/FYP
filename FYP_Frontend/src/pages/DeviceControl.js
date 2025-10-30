import React, { useState } from 'react';
import { 
  Zap, 
  Lightbulb, 
  Fan, 
  Monitor, 
  Thermometer,
  Power,
  ToggleLeft,
  ToggleRight,
  Settings,
  Timer,
  Sliders
} from 'lucide-react';
import './DeviceControl.css';

const DeviceControl = () => {
  const [devices, setDevices] = useState({
    'room-101': {
      lights: { status: true, brightness: 80, schedule: true },
      fans: { status: true, speed: 60, schedule: true },
      projector: { status: true, schedule: false },
      ac: { status: false, temperature: 24, schedule: true }
    },
    'room-102': {
      lights: { status: false, brightness: 0, schedule: true },
      fans: { status: false, speed: 0, schedule: true },
      projector: { status: false, schedule: false },
      ac: { status: false, temperature: 26, schedule: true }
    },
    'room-103': {
      lights: { status: true, brightness: 70, schedule: true },
      fans: { status: true, speed: 80, schedule: true },
      projector: { status: true, schedule: false },
      ac: { status: true, temperature: 23, schedule: true }
    },
    'lab-201': {
      lights: { status: true, brightness: 90, schedule: true },
      fans: { status: false, speed: 0, schedule: true },
      projector: { status: false, schedule: false },
      ac: { status: true, temperature: 22, schedule: true }
    }
  });

  const [selectedRoom, setSelectedRoom] = useState('room-101');

  const toggleDevice = (roomId, deviceType) => {
    setDevices(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [deviceType]: {
          ...prev[roomId][deviceType],
          status: !prev[roomId][deviceType].status
        }
      }
    }));
  };

  const updateDeviceSetting = (roomId, deviceType, setting, value) => {
    setDevices(prev => ({
      ...prev,
      [roomId]: {
        ...prev[roomId],
        [deviceType]: {
          ...prev[roomId][deviceType],
          [setting]: value
        }
      }
    }));
  };

  const rooms = {
    'room-101': 'Room 101',
    'room-102': 'Room 102', 
    'room-103': 'Room 103',
    'lab-201': 'Lab 201'
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

  const DeviceCard = ({ roomId, deviceType, device, deviceName }) => {
    const Icon = deviceIcons[deviceType];
    const color = deviceColors[deviceType];

    return (
      <div className={`device-card ${device.status ? 'active' : 'inactive'}`}>
        <div className="device-header">
          <div className="device-icon" style={{ backgroundColor: device.status ? color : '#9ca3af' }}>
            <Icon size={24} color="white" />
          </div>
          <div className="device-info">
            <h3>{deviceName}</h3>
            <span className={`status ${device.status ? 'on' : 'off'}`}>
              {device.status ? 'ON' : 'OFF'}
            </span>
          </div>
          <button 
            className={`toggle-btn ${device.status ? 'on' : 'off'}`}
            onClick={() => toggleDevice(roomId, deviceType)}
          >
            {device.status ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
          </button>
        </div>

        {device.status && (
          <div className="device-controls">
            {deviceType === 'lights' && (
              <div className="control-group">
                <label>Brightness</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={device.brightness}
                    onChange={(e) => updateDeviceSetting(roomId, deviceType, 'brightness', e.target.value)}
                    className="slider"
                  />
                  <span className="slider-value">{device.brightness}%</span>
                </div>
              </div>
            )}

            {deviceType === 'fans' && (
              <div className="control-group">
                <label>Speed</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="10"
                    max="100"
                    value={device.speed}
                    onChange={(e) => updateDeviceSetting(roomId, deviceType, 'speed', e.target.value)}
                    className="slider"
                  />
                  <span className="slider-value">{device.speed}%</span>
                </div>
              </div>
            )}

            {deviceType === 'ac' && (
              <div className="control-group">
                <label>Temperature</label>
                <div className="slider-container">
                  <input
                    type="range"
                    min="18"
                    max="30"
                    value={device.temperature}
                    onChange={(e) => updateDeviceSetting(roomId, deviceType, 'temperature', e.target.value)}
                    className="slider"
                  />
                  <span className="slider-value">{device.temperature}°C</span>
                </div>
              </div>
            )}

            <div className="control-group">
              <div className="schedule-control">
                <Timer size={16} />
                <span>Auto Schedule</span>
                <label className="switch">
                  <input 
                    type="checkbox" 
                    checked={device.schedule}
                    onChange={(e) => updateDeviceSetting(roomId, deviceType, 'schedule', e.target.checked)}
                  />
                  <span className="switch-slider"></span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const QuickActions = () => (
    <div className="quick-actions">
      <h2>Quick Actions</h2>
      <div className="actions-grid">
        <button className="action-btn emergency" onClick={() => {
          setDevices(prev => {
            const newDevices = { ...prev };
            Object.keys(newDevices).forEach(roomId => {
              Object.keys(newDevices[roomId]).forEach(deviceType => {
                newDevices[roomId][deviceType].status = false;
              });
            });
            return newDevices;
          });
        }}>
          <Power size={20} />
          <span>Emergency Off</span>
        </button>

        <button className="action-btn energy-save">
          <Zap size={20} />
          <span>Energy Save Mode</span>
        </button>

        <button className="action-btn auto-optimize">
          <Settings size={20} />
          <span>Auto Optimize</span>
        </button>

        <button className="action-btn schedule">
          <Timer size={20} />
          <span>Set Schedule</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="device-control">
      <div className="device-header-section">
        <h1>Device Control Center</h1>
        <p>Manual override and device management</p>
      </div>

      <div className="room-selector-tabs">
        {Object.entries(rooms).map(([roomId, roomName]) => (
          <button
            key={roomId}
            className={`room-tab ${selectedRoom === roomId ? 'active' : ''}`}
            onClick={() => setSelectedRoom(roomId)}
          >
            {roomName}
          </button>
        ))}
      </div>

      <div className="devices-grid">
        {Object.entries(devices[selectedRoom] || {}).map(([deviceType, device]) => (
          <DeviceCard
            key={deviceType}
            roomId={selectedRoom}
            deviceType={deviceType}
            device={device}
            deviceName={deviceType.charAt(0).toUpperCase() + deviceType.slice(1)}
          />
        ))}
      </div>

      <QuickActions />

      <div className="device-status-summary">
        <h2>System Overview</h2>
        <div className="summary-grid">
          {Object.entries(rooms).map(([roomId, roomName]) => {
            const roomDevices = devices[roomId];
            const activeDevices = Object.values(roomDevices).filter(device => device.status).length;
            const totalDevices = Object.keys(roomDevices).length;

            return (
              <div key={roomId} className="summary-card">
                <h4>{roomName}</h4>
                <div className="summary-stats">
                  <span className="active-count">{activeDevices}/{totalDevices}</span>
                  <span className="status-label">Active Devices</span>
                </div>
                <div className="device-indicators">
                  {Object.entries(roomDevices).map(([deviceType, device]) => {
                    const Icon = deviceIcons[deviceType];
                    return (
                      <div key={deviceType} className={`device-indicator ${device.status ? 'active' : 'inactive'}`}>
                        <Icon size={14} />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeviceControl;
