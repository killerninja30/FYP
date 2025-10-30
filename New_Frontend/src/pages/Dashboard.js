import React, { useState, useEffect } from 'react';
import MetricCard from '../components/UI/MetricCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ApiService from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [energyData, setEnergyData] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const [summaryRes, roomsRes, energyRes, alertsRes] = await Promise.all([
        ApiService.getDashboardSummary(),
        ApiService.getDashboardRooms(),
        ApiService.getDashboardEnergy(),
        ApiService.getDashboardAlerts()
      ]);

      setSummary(summaryRes);
      setRooms(roomsRes);
      setEnergyData(energyRes);
      setAlerts(alertsRes.alerts || []);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'empty': return '#64748b';
      case 'maintenance': return '#f59e0b';
      default: return '#64748b';
    }
  };

  const getAlertColor = (type) => {
    switch (type) {
      case 'error': return '#ef4444';
      case 'warning': return '#f59e0b';
      case 'success': return '#10b981';
      default: return '#3b82f6';
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="large" text="Loading dashboard..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p className="page-subtitle">System overview and key metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-4 mb-4">
        <MetricCard
          title="Total Rooms"
          value={summary?.total_rooms || 0}
          icon="🏢"
          color="primary"
        />
        <MetricCard
          title="Active Rooms"
          value={summary?.active_rooms || 0}
          icon="✅"
          color="success"
          trend="up"
          trendValue={`${Math.round((summary?.active_rooms / summary?.total_rooms) * 100) || 0}%`}
        />
        <MetricCard
          title="Total Occupancy"
          value={summary?.total_occupancy || 0}
          icon="👥"
          color="info"
        />
        <MetricCard
          title="Power Consumption"
          value={summary?.total_power_consumption || 0}
          unit="kW"
          icon="⚡"
          color="warning"
        />
      </div>

      <div className="grid grid-4 mb-4">
        <MetricCard
          title="System Efficiency"
          value={summary?.efficiency || 0}
          unit="%"
          icon="📊"
          color="purple"
          trend="up"
          trendValue="12%"
        />
        <MetricCard
          title="Daily Cost"
          value={`₹${summary?.daily_cost_estimate || 0}`}
          icon="💰"
          color="danger"
        />
        <MetricCard
          title="Energy Saved"
          value={energyData?.savings || 0}
          unit="kWh"
          icon="🌱"
          color="success"
          trend="up"
          trendValue="8%"
        />
        <MetricCard
          title="System Status"
          value={summary?.status === 'operational' ? 'Online' : 'Offline'}
          icon="🔄"
          color={summary?.status === 'operational' ? 'success' : 'danger'}
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-2 mb-4">
        {/* Energy Consumption Chart */}
        <div className="card">
          <h3 className="card-title">Energy Consumption (24h)</h3>
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
                      color: '#white'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="consumption" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
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

        {/* Room Status Pie Chart */}
        <div className="card">
          <h3 className="card-title">Room Status Distribution</h3>
          <div className="chart-container">
            {rooms.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Active', value: rooms.filter(r => r.status === 'active').length, color: '#10b981' },
                      { name: 'Empty', value: rooms.filter(r => r.status === 'empty').length, color: '#64748b' },
                      { name: 'Maintenance', value: rooms.filter(r => r.status === 'maintenance').length, color: '#f59e0b' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[
                      { name: 'Active', value: rooms.filter(r => r.status === 'active').length, color: '#10b981' },
                      { name: 'Empty', value: rooms.filter(r => r.status === 'empty').length, color: '#64748b' },
                      { name: 'Maintenance', value: rooms.filter(r => r.status === 'maintenance').length, color: '#f59e0b' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                <p>No room data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Room Overview */}
      <div className="grid grid-2 mb-4">
        <div className="card">
          <h3 className="card-title">Room Overview</h3>
          <div className="room-list">
            {rooms.slice(0, 6).map((room) => (
              <div key={room.id} className="room-item">
                <div className="room-info">
                  <div className="room-header">
                    <span className="room-name">{room.name}</span>
                    <span 
                      className="room-status"
                      style={{ backgroundColor: getStatusColor(room.status) }}
                    >
                      {room.status}
                    </span>
                  </div>
                  <div className="room-metrics">
                    <span className="room-metric">
                      👥 {room.occupancy}/{room.max_capacity}
                    </span>
                    <span className="room-metric">
                      🌡️ {room.temperature}°C
                    </span>
                    <span className="room-metric">
                      ⚡ {room.power_consumption}kW
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="card">
          <h3 className="card-title">Recent Alerts</h3>
          <div className="alert-list">
            {alerts.length > 0 ? alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className="alert-item">
                <div 
                  className="alert-indicator"
                  style={{ backgroundColor: getAlertColor(alert.type) }}
                ></div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-time">{alert.time}</span>
                </div>
              </div>
            )) : (
              <div className="no-data">
                <p>No recent alerts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Power Consumption by Room */}
      <div className="card mb-4">
        <h3 className="card-title">Power Consumption by Room</h3>
        <div className="chart-container">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={rooms.slice(0, 8)}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="name" 
                stroke="#64748b"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
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
              <Bar 
                dataKey="power_consumption" 
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;