import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ApiService from '../services/api';

const DeviceControl = () => {
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState({});
  const [rooms, setRooms] = useState({});

  useEffect(() => {
    fetchDeviceData();
  }, []);

  const fetchDeviceData = async () => {
    try {
      const devicesRes = await ApiService.getAllDevices();
      setDevices(devicesRes.devices || {});
      setRooms(devicesRes.rooms || {});
    } catch (error) {
      console.error('Device control error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceControl = async (roomId, deviceType, action) => {
    try {
      await ApiService.controlDevice(roomId, deviceType, action);
      // Refresh data after control action
      fetchDeviceData();
    } catch (error) {
      console.error('Device control error:', error);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="large" text="Loading device control..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Device Control</h1>
        <p className="page-subtitle">Control all devices across rooms</p>
      </div>

      <div className="grid grid-2">
        {Object.entries(rooms).map(([roomId, roomName]) => (
          <div key={roomId} className="card">
            <h3 className="card-title">🏢 {roomName}</h3>
            <div className="device-grid">
              {devices[roomId] && Object.entries(devices[roomId]).map(([deviceType, deviceState]) => (
                <div key={deviceType} className="device-card">
                  <div className="device-header">
                    <span className="device-icon">
                      {deviceType === 'lights' && '💡'}
                      {deviceType === 'fans' && '🌀'}
                      {deviceType === 'projector' && '📽️'}
                      {deviceType === 'ac' && '❄️'}
                    </span>
                    <span className="device-name">{deviceType}</span>
                    <span className={`device-status ${deviceState.status ? 'on' : 'off'}`}>
                      {deviceState.status ? 'ON' : 'OFF'}
                    </span>
                  </div>
                  
                  <div className="device-controls">
                    <button 
                      className="btn btn-success"
                      onClick={() => handleDeviceControl(roomId, deviceType, 'on')}
                      disabled={deviceState.status}
                    >
                      Turn ON
                    </button>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleDeviceControl(roomId, deviceType, 'off')}
                      disabled={!deviceState.status}
                    >
                      Turn OFF
                    </button>
                  </div>
                  
                  {deviceState.brightness !== undefined && (
                    <div className="device-setting">
                      <label>Brightness: {deviceState.brightness}%</label>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={deviceState.brightness}
                        readOnly
                      />
                    </div>
                  )}
                  
                  {deviceState.speed !== undefined && (
                    <div className="device-setting">
                      <label>Speed: {deviceState.speed}</label>
                    </div>
                  )}
                  
                  {deviceState.temperature !== undefined && (
                    <div className="device-setting">
                      <label>Temperature: {deviceState.temperature}°C</label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeviceControl;