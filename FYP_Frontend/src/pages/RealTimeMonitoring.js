import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  Zap, 
  Users, 
  Thermometer,
  Eye,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './RealTimeMonitoring.css';

const RealTimeMonitoring = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [realtimeData, setRealtimeData] = useState([
    { time: '14:50', power: 2.4, occupancy: 55 },
    { time: '14:51', power: 2.6, occupancy: 58 },
    { time: '14:52', power: 2.3, occupancy: 52 },
    { time: '14:53', power: 2.8, occupancy: 61 },
    { time: '14:54', power: 2.5, occupancy: 55 }
  ]);

  const [alerts] = useState([
    { id: 1, type: 'warning', message: 'High energy consumption in Room 103', time: '2 min ago' },
    { id: 2, type: 'info', message: 'Auto-optimization applied to Lab 201', time: '5 min ago' },
    { id: 3, type: 'success', message: 'Room 102 switched to energy-saving mode', time: '8 min ago' }
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      
      // Simulate real-time data updates
      setRealtimeData(prev => {
        const newTime = new Date().toLocaleTimeString('en-US', { 
          hour12: false, 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        const newEntry = {
          time: newTime,
          power: (2 + Math.random() * 1.5).toFixed(1),
          occupancy: Math.floor(40 + Math.random() * 30)
        };
        
        return [...prev.slice(-4), newEntry];
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const roomsData = [
    {
      id: 'room-101',
      name: 'Room 101',
      status: 'active',
      occupancy: 25,
      maxCapacity: 40,
      temperature: 24,
      powerConsumption: 0.8,
      devices: {
        lights: { active: 6, total: 8 },
        fans: { active: 4, total: 4 },
        projector: { active: 1, total: 1 },
        ac: { active: 1, total: 2 }
      }
    },
    {
      id: 'room-102',
      name: 'Room 102',
      status: 'empty',
      occupancy: 0,
      maxCapacity: 35,
      temperature: 26,
      powerConsumption: 0.0,
      devices: {
        lights: { active: 0, total: 6 },
        fans: { active: 0, total: 3 },
        projector: { active: 0, total: 1 },
        ac: { active: 0, total: 1 }
      }
    },
    {
      id: 'room-103',
      name: 'Room 103',
      status: 'active',
      occupancy: 18,
      maxCapacity: 30,
      temperature: 23,
      powerConsumption: 1.2,
      devices: {
        lights: { active: 4, total: 6 },
        fans: { active: 3, total: 3 },
        projector: { active: 1, total: 1 },
        ac: { active: 2, total: 2 }
      }
    },
    {
      id: 'lab-201',
      name: 'Lab 201',
      status: 'active',
      occupancy: 12,
      maxCapacity: 25,
      temperature: 22,
      powerConsumption: 0.4,
      devices: {
        lights: { active: 8, total: 10 },
        fans: { active: 2, total: 4 },
        projector: { active: 0, total: 1 },
        ac: { active: 1, total: 1 }
      }
    }
  ];

  const MetricCard = ({ title, value, unit, icon: Icon, color, status }) => (
    <div className="realtime-metric-card">
      <div className="metric-icon-container" style={{ backgroundColor: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className="metric-info">
        <h3>{value}<span className="unit">{unit}</span></h3>
        <p>{title}</p>
        {status && <span className={`status-badge ${status}`}>{status}</span>}
      </div>
    </div>
  );

  const RoomCard = ({ room }) => (
    <div className={`room-card ${room.status}`}>
      <div className="room-header">
        <div className="room-title">
          <h3>{room.name}</h3>
          <span className={`occupancy-indicator ${room.status}`}>
            <Eye size={16} />
            {room.occupancy}/{room.maxCapacity}
          </span>
        </div>
        <div className="room-status">
          <span className={`status-dot ${room.status}`}></span>
          {room.status === 'active' ? 'Occupied' : 'Empty'}
        </div>
      </div>
      
      <div className="room-metrics">
        <div className="room-metric">
          <Thermometer size={16} />
          <span>{room.temperature}°C</span>
        </div>
        <div className="room-metric">
          <Zap size={16} />
          <span>{room.powerConsumption} kW</span>
        </div>
      </div>

      <div className="device-grid">
        <div className="device-status">
          <span className="device-label">Lights</span>
          <div className="device-count">
            <span className={room.devices.lights.active > 0 ? 'active' : 'inactive'}>
              {room.devices.lights.active}/{room.devices.lights.total}
            </span>
          </div>
        </div>
        <div className="device-status">
          <span className="device-label">Fans</span>
          <div className="device-count">
            <span className={room.devices.fans.active > 0 ? 'active' : 'inactive'}>
              {room.devices.fans.active}/{room.devices.fans.total}
            </span>
          </div>
        </div>
        <div className="device-status">
          <span className="device-label">Projector</span>
          <div className="device-count">
            <span className={room.devices.projector.active > 0 ? 'active' : 'inactive'}>
              {room.devices.projector.active}/{room.devices.projector.total}
            </span>
          </div>
        </div>
        <div className="device-status">
          <span className="device-label">AC</span>
          <div className="device-count">
            <span className={room.devices.ac.active > 0 ? 'active' : 'inactive'}>
              {room.devices.ac.active}/{room.devices.ac.total}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="realtime-monitoring">
      <div className="monitoring-header">
        <div>
          <h1>Real-Time Monitoring</h1>
          <p>Live updates every 5 seconds • Last updated: {currentTime.toLocaleTimeString()}</p>
        </div>
        <div className="live-indicator">
          <div className="pulse-dot"></div>
          <span>LIVE</span>
        </div>
      </div>

      {/* Real-time Metrics */}
      <div className="realtime-metrics">
        <MetricCard
          title="Total Power Consumption"
          value={realtimeData[realtimeData.length - 1]?.power || '0'}
          unit=" kW"
          icon={Zap}
          color="#3b82f6"
          status="normal"
        />
        <MetricCard
          title="Active Occupancy"
          value={realtimeData[realtimeData.length - 1]?.occupancy || '0'}
          unit=" people"
          icon={Users}
          color="#10b981"
        />
        <MetricCard
          title="Active Rooms"
          value="3"
          unit="/4"
          icon={Activity}
          color="#f59e0b"
        />
        <MetricCard
          title="System Status"
          value="Online"
          unit=""
          icon={CheckCircle}
          color="#10b981"
          status="operational"
        />
      </div>

      <div className="monitoring-content">
        {/* Live Chart */}
        <div className="chart-section">
          <h2>Live Energy Consumption</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={realtimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="power" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  name="Power (kW)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="monitoring-row">
          {/* Room Status Grid */}
          <div className="rooms-section">
            <h2>Room Status Overview</h2>
            <div className="rooms-grid">
              {roomsData.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>

          {/* Alerts Panel */}
          <div className="alerts-section">
            <h2>System Alerts</h2>
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <div className="alert-icon">
                    {alert.type === 'warning' && <AlertCircle size={20} />}
                    {alert.type === 'info' && <Activity size={20} />}
                    {alert.type === 'success' && <CheckCircle size={20} />}
                  </div>
                  <div className="alert-content">
                    <p>{alert.message}</p>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeMonitoring;
