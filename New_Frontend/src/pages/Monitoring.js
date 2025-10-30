import React, { useState, useEffect } from 'react';
import MetricCard from '../components/UI/MetricCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ApiService from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './Monitoring.css';

const Monitoring = () => {
  const [loading, setLoading] = useState(true);
  const [rooms, setRooms] = useState([]);
  const [energyData, setEnergyData] = useState(null);
  const [systemStatus, setSystemStatus] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomDetails, setRoomDetails] = useState(null);
  const [isRealTime, setIsRealTime] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchMonitoringData();
    const interval = setInterval(() => {
      if (isRealTime) {
        fetchMonitoringData();
        setLastUpdate(new Date());
      }
    }, 5000); // Update every 5 seconds when real-time is enabled

    return () => clearInterval(interval);
  }, [isRealTime]);

  const fetchMonitoringData = async () => {
    try {
      const [roomsRes, energyRes, statusRes] = await Promise.all([
        ApiService.getMonitoringRooms(),
        ApiService.getRealtimeEnergy(),
        ApiService.getSystemStatus()
      ]);

      setRooms(roomsRes);
      setEnergyData(energyRes);
      setSystemStatus(statusRes);
    } catch (error) {
      console.error('Monitoring error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoomDetails = async (roomId) => {
    try {
      const details = await ApiService.getRoomDetails(roomId);
      setRoomDetails(details);
    } catch (error) {
      console.error('Room details error:', error);
    }
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    fetchRoomDetails(room.id);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'empty': return '#64748b';
      case 'maintenance': return '#f59e0b';
      default: return '#64748b';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="large" text="Loading monitoring data..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Real-time Monitoring</h1>
          <p className="page-subtitle">Live system monitoring and analytics</p>
        </div>
        <div className="monitoring-controls">
          <label className="realtime-toggle">
            <input
              type="checkbox"
              checked={isRealTime}
              onChange={(e) => setIsRealTime(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            Real-time Updates
          </label>
          <div className="last-update">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* System Status Cards */}
      {systemStatus && (
        <div className="grid grid-4 mb-4">
          <MetricCard
            title="System Status"
            value={systemStatus.overall_status}
            icon="🔄"
            color={systemStatus.overall_status === 'operational' ? 'success' : 'danger'}
          />
          <MetricCard
            title="Active Devices"
            value={`${systemStatus.active_devices}/${systemStatus.total_devices}`}
            icon="🔌"
            color="primary"
            trend="up"
            trendValue={`${systemStatus.device_efficiency}%`}
          />
          <MetricCard
            title="Network Status"
            value={systemStatus.network_status}
            icon="🌐"
            color={systemStatus.network_status === 'connected' ? 'success' : 'danger'}
          />
          <MetricCard
            title="Last Sync"
            value={systemStatus.last_sync}
            icon="🔄"
            color="info"
          />
        </div>
      )}

      {/* Current Energy Metrics */}
      {energyData && (
        <div className="grid grid-3 mb-4">
          <MetricCard
            title="Current Consumption"
            value={energyData.current_consumption}
            unit="kW"
            icon="⚡"
            color="warning"
            size="large"
          />
          <MetricCard
            title="Current Cost"
            value={`₹${energyData.current_cost}`}
            icon="💰"
            color="danger"
            size="large"
          />
          <MetricCard
            title="Efficiency"
            value={energyData.efficiency}
            unit="%"
            icon="📊"
            color="success"
            size="large"
            trend="up"
            trendValue="5%"
          />
        </div>
      )}

      <div className="grid grid-2 mb-4">
        {/* Real-time Energy Chart */}
        <div className="card">
          <h3 className="card-title">
            ⚡ Energy Consumption (Last 12 Hours)
            {isRealTime && <span className="live-indicator">🔴 LIVE</span>}
          </h3>
          <div className="chart-container">
            {energyData?.time_series ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={energyData.time_series}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#64748b"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: 'none',
                      borderRadius: '8px',
                      color: 'white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#f59e0b" 
                    strokeWidth={3}
                    dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#f59e0b', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                <p>No energy data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Room Selection */}
        <div className="card">
          <h3 className="card-title">🏢 Room Monitoring</h3>
          <div className="room-monitoring">
            <div className="room-grid">
              {rooms.map((room) => (
                <div
                  key={room.id}
                  className={`room-card ${selectedRoom?.id === room.id ? 'selected' : ''}`}
                  onClick={() => handleRoomSelect(room)}
                >
                  <div className="room-header">
                    <span className="room-name">{room.name}</span>
                    <span 
                      className="room-status-dot"
                      style={{ backgroundColor: getStatusColor(room.status) }}
                    ></span>
                  </div>
                  <div className="room-metrics">
                    <div className="metric">
                      <span className="metric-label">Occupancy</span>
                      <span className="metric-value">{room.occupancy}/{room.max_capacity}</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Power</span>
                      <span className="metric-value">{room.power_consumption}kW</span>
                    </div>
                    <div className="metric">
                      <span className="metric-label">Temp</span>
                      <span className="metric-value">{room.temperature}°C</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Room Details */}
      {selectedRoom && roomDetails && (
        <div className="card mb-4">
          <h3 className="card-title">🔍 {selectedRoom.name} - Detailed View</h3>
          <div className="room-details">
            <div className="grid grid-3 mb-3">
              <div className="detail-card">
                <h4>Zone Information</h4>
                <div className="zone-list">
                  {selectedRoom.zones.map((zone) => (
                    <div key={zone.id} className="zone-item">
                      <div className="zone-header">
                        <span className="zone-name">{zone.name}</span>
                        <span className="zone-occupancy">{zone.occupancy}/{zone.max_capacity}</span>
                      </div>
                      <div className="zone-devices">
                        {Object.entries(zone.devices).map(([device, count]) => (
                          <span key={device} className="device-tag">
                            {device}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="detail-card">
                <h4>Device Status</h4>
                <div className="device-status">
                  <div className="device-row">
                    <span>💡 Lights</span>
                    <span>{selectedRoom.devices.lights.active}/{selectedRoom.devices.lights.total}</span>
                  </div>
                  <div className="device-row">
                    <span>🌀 Fans</span>
                    <span>{selectedRoom.devices.fans.active}/{selectedRoom.devices.fans.total}</span>
                  </div>
                  <div className="device-row">
                    <span>📽️ Projector</span>
                    <span>{selectedRoom.devices.projector.active}/{selectedRoom.devices.projector.total}</span>
                  </div>
                  <div className="device-row">
                    <span>❄️ AC</span>
                    <span>{selectedRoom.devices.ac.active}/{selectedRoom.devices.ac.total}</span>
                  </div>
                </div>
              </div>

              <div className="detail-card">
                <h4>Zone Energy</h4>
                <div className="zone-energy">
                  {roomDetails.zone_energy && Object.entries(roomDetails.zone_energy).map(([zoneId, data]) => (
                    <div key={zoneId} className="energy-row">
                      <span className="zone-name">{zoneId}</span>
                      <div className="energy-values">
                        <span>{data.consumption}kW</span>
                        <span className="efficiency">{data.efficiency}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Monitoring;