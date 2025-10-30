import React, { useState, useEffect } from 'react';
import { 
  FaUsers, 
  FaBolt, 
  FaDollarSign, 
  FaArrowDown,
  FaLightbulb,
  FaFan,
  FaTv,
  FaSnowflake
} from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { dashboardAPI, checkAPIHealth } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  // State for API data
  const [dashboardData, setDashboardData] = useState({
    summary: null,
    rooms: [],
    energy: null,
    alerts: [],
    loading: true,
    error: null
  });

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setDashboardData(prev => ({ ...prev, loading: true, error: null }));
        
        // Check API health first
        await checkAPIHealth();
        
        // Fetch all dashboard data
        const [summaryRes, roomsRes, energyRes, alertsRes] = await Promise.all([
          dashboardAPI.getSummary(),
          dashboardAPI.getRooms(),
          dashboardAPI.getEnergy(),
          dashboardAPI.getAlerts(),
        ]);

        setDashboardData({
          summary: summaryRes.data,
          rooms: roomsRes.data,
          energy: energyRes.data,
          alerts: alertsRes.data.alerts,
          loading: false,
          error: null
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setDashboardData(prev => ({
          ...prev,
          loading: false,
          error: 'Failed to load dashboard data. Please ensure the backend server is running.'
        }));
      }
    };

    fetchDashboardData();
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  // Helper function to calculate device usage data
  const calculateDeviceUsage = (rooms) => {
    if (!rooms || rooms.length === 0) return [];
    
    let totalLights = 0, totalFans = 0, totalProjectors = 0, totalAC = 0;
    
    rooms.forEach(room => {
      totalLights += room.devices?.lights?.active || 0;
      totalFans += room.devices?.fans?.active || 0;
      totalProjectors += room.devices?.projector?.active || 0;
      totalAC += room.devices?.ac?.active || 0;
    });
    
    const total = totalLights + totalFans + totalProjectors + totalAC;
    if (total === 0) return [];
    
    return [
      { name: 'Lights', value: Math.round((totalLights / total) * 100), color: '#3b82f6' },
      { name: 'Fans', value: Math.round((totalFans / total) * 100), color: '#10b981' },
      { name: 'Projectors', value: Math.round((totalProjectors / total) * 100), color: '#f59e0b' },
      { name: 'AC Units', value: Math.round((totalAC / total) * 100), color: '#ef4444' }
    ];
  };

  // Show loading state
  if (dashboardData.loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Energy Management Dashboard</h1>
          <p>Loading dashboard data...</p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Fetching real-time data from backend...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (dashboardData.error) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Energy Management Dashboard</h1>
          <p>Error loading dashboard</p>
        </div>
        <div className="error-container">
          <div className="error-message">
            <h3>⚠️ Backend Connection Error</h3>
            <p>{dashboardData.error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        </div>
      </div>
    );
  }

  const { summary, rooms, energy, alerts } = dashboardData;
  const deviceUsageData = calculateDeviceUsage(rooms);
  const energyTimeSeries = energy?.time_series?.slice(-8) || []; // Last 8 data points for chart

  const MetricCard = ({ title, value, icon: Icon, color, trend, subtitle }) => (
    <div className="metric-card">
      <div className="metric-header">
        <div className="metric-icon" style={{ backgroundColor: color }}>
          <Icon size={24} color="white" />
        </div>
        <div className="metric-trend">
          <FaArrowDown size={16} color={trend > 0 ? '#10b981' : '#ef4444'} />
          <span style={{ color: trend > 0 ? '#10b981' : '#ef4444' }}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
      </div>
      <div className="metric-content">
        <h3 className="metric-value">{value}</h3>
        <p className="metric-title">{title}</p>
        {subtitle && <p className="metric-subtitle">{subtitle}</p>}
      </div>
    </div>
  );

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Energy Management Dashboard</h1>
        <p>Real-time monitoring and control of classroom energy consumption</p>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard
          title="Active Occupancy"
          value={`${summary?.total_occupancy || 0} People`}
          icon={FaUsers}
          color="#3b82f6"
          trend={-12}
          subtitle={`Across ${summary?.active_rooms || 0} classrooms`}
        />
        <MetricCard
          title="Current Power Usage"
          value={`${summary?.total_power_consumption || 0} kW`}
          icon={FaBolt}
          color="#10b981"
          trend={-18}
          subtitle="Real-time consumption"
        />
        <MetricCard
          title="Daily Cost Estimate"
          value={`₹${summary?.daily_cost_estimate || 0}`}
          icon={FaDollarSign}
          color="#f59e0b"
          trend={25}
          subtitle="Based on current usage"
        />
        <MetricCard
          title="Energy Efficiency"
          value={`${summary?.efficiency || 0}%`}
          icon={FaArrowDown}
          color="#8b5cf6"
          trend={8}
          subtitle="Optimization level"
        />
      </div>

      <div className="dashboard-content">
        {/* Energy Consumption Chart */}
        <div className="chart-section">
          <div className="section-header">
            <h2>Energy Consumption Trend</h2>
            <select className="time-selector">
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={energyTimeSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="consumption" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="dashboard-row">
          {/* Device Usage Distribution */}
          <div className="chart-section half">
            <h2>Device Usage Distribution</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={deviceUsageData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {deviceUsageData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Classroom Status */}
          <div className="classroom-status half">
            <h2>Classroom Status</h2>
            <div className="status-list">
              {rooms.filter(room => room.id.startsWith('room-')).map((room) => (
                <div key={room.id} className={`status-item ${room.status}`}>
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p>{room.occupancy} people</p>
                  </div>
                  <div className="device-status">
                    <div className="device-item">
                      <FaLightbulb size={16} />
                      <span>{room.devices?.lights?.active || 0}</span>
                    </div>
                    <div className="device-item">
                      <FaFan size={16} />
                      <span>{room.devices?.fans?.active || 0}</span>
                    </div>
                    <div className="device-item">
                      <FaTv size={16} />
                      <span>{room.devices?.projector?.active || 0}</span>
                    </div>
                    <div className="device-item">
                      <FaSnowflake size={16} />
                      <span>{room.devices?.ac?.active || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lab Status Section */}
        <div className="dashboard-row">
          <div className="lab-status full">
            <h2>Lab Status</h2>
            <div className="status-list">
              {rooms.filter(room => room.id.startsWith('lab-')).map((room) => (
                <div key={room.id} className={`status-item ${room.status}`}>
                  <div className="room-info">
                    <h3>{room.name}</h3>
                    <p>{room.occupancy} people</p>
                  </div>
                  <div className="device-status">
                    <div className="device-item">
                      <FaLightbulb size={16} />
                      <span>{room.devices?.lights?.active || 0}/{room.devices?.lights?.total || 0}</span>
                    </div>
                    <div className="device-item">
                      <FaFan size={16} />
                      <span>{room.devices?.fans?.active || 0}/{room.devices?.fans?.total || 0}</span>
                    </div>
                    <div className="device-item">
                      <FaTv size={16} />
                      <span>{room.devices?.projector?.active || 0}/{room.devices?.projector?.total || 0}</span>
                    </div>
                    <div className="device-item">
                      <FaSnowflake size={16} />
                      <span>{room.devices?.ac?.active || 0}/{room.devices?.ac?.total || 0}</span>
                    </div>
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

export default Dashboard;
