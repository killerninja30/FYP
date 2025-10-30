import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ApiService from '../services/api';
import './ZoneControl.css';

const ZoneControl = () => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState({});
  const [deviceStates, setDeviceStates] = useState({});

  useEffect(() => {
    fetchZoneData();
  }, []);

  const fetchZoneData = async () => {
    try {
      const [roomsRes, devicesRes] = await Promise.all([
        ApiService.getZoneRooms(),
        ApiService.getDeviceStates()
      ]);

      setRooms(roomsRes);
      setDeviceStates(devicesRes);
    } catch (error) {
      console.error('Zone control error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeviceToggle = async (roomId, zoneId, deviceType, currentState) => {
    try {
      const newState = { ...currentState, status: !currentState.status };
      await ApiService.updateDeviceState(roomId, zoneId, deviceType, newState);
      
      // Update local state
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
    } catch (error) {
      console.error('Device toggle error:', error);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="large" text="Loading zone control..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Zone Control</h1>
        <p className="page-subtitle">Manage devices across different zones</p>
      </div>

      <div className="zone-control-grid">
        {Object.entries(rooms).map(([roomId, room]) => (
          <div key={roomId} className="room-control-card">
            <div className="room-header">
              <h3>{room.name}</h3>
              <span className={`room-status ${room.status}`}>{room.status}</span>
            </div>
            
            <div className="zones-container">
              {room.zones?.map((zone) => (
                <div key={zone.id} className="zone-card">
                  <div className="zone-header">
                    <h4>{zone.name}</h4>
                    <span className="occupancy">👥 {zone.occupancy}/{zone.max_capacity}</span>
                  </div>
                  
                  <div className="device-controls">
                    {['lights', 'fans', 'projector', 'ac'].map((deviceType) => {
                      const deviceState = deviceStates[roomId]?.[zone.id]?.[deviceType];
                      if (!deviceState) return null;
                      
                      return (
                        <div key={deviceType} className="device-control">
                          <div className="device-info">
                            <span className="device-icon">
                              {deviceType === 'lights' && '💡'}
                              {deviceType === 'fans' && '🌀'}
                              {deviceType === 'projector' && '📽️'}
                              {deviceType === 'ac' && '❄️'}
                            </span>
                            <span className="device-name">{deviceType}</span>
                          </div>
                          
                          <label className="device-toggle">
                            <input
                              type="checkbox"
                              checked={deviceState.status}
                              onChange={() => handleDeviceToggle(roomId, zone.id, deviceType, deviceState)}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ZoneControl;