import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Calendar,
  Download,
  Filter
} from 'lucide-react';
import './EnergyAnalytics.css';

const EnergyAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [selectedMetric, setSelectedMetric] = useState('consumption');

  // Mock data for different time ranges
  const weeklyData = [
    { day: 'Mon', consumption: 145, cost: 580, savings: 120, efficiency: 85 },
    { day: 'Tue', consumption: 132, cost: 528, savings: 135, efficiency: 89 },
    { day: 'Wed', consumption: 128, cost: 512, savings: 142, efficiency: 91 },
    { day: 'Thu', consumption: 140, cost: 560, savings: 125, efficiency: 87 },
    { day: 'Fri', consumption: 135, cost: 540, savings: 130, efficiency: 88 },
    { day: 'Sat', consumption: 45, cost: 180, savings: 85, efficiency: 95 },
    { day: 'Sun', consumption: 25, cost: 100, savings: 45, efficiency: 97 }
  ];

  const monthlyData = [
    { period: 'Week 1', consumption: 980, cost: 3920, savings: 840, efficiency: 87 },
    { period: 'Week 2', consumption: 925, cost: 3700, savings: 920, efficiency: 89 },
    { period: 'Week 3', consumption: 945, cost: 3780, savings: 895, efficiency: 88 },
    { period: 'Week 4', consumption: 890, cost: 3560, savings: 965, efficiency: 91 }
  ];

  const deviceBreakdown = [
    { name: 'Lighting', value: 35, cost: 1400, color: '#3b82f6' },
    { name: 'Fans', value: 25, cost: 1000, color: '#10b981' },
    { name: 'Projectors', value: 20, cost: 800, color: '#f59e0b' },
    { name: 'AC Units', value: 15, cost: 600, color: '#ef4444' },
    { name: 'Others', value: 5, cost: 200, color: '#8b5cf6' }
  ];

  const roomComparison = [
    { room: 'Room 101', consumption: 45, efficiency: 87, savings: 340 },
    { room: 'Room 102', consumption: 15, efficiency: 95, savings: 180 },
    { room: 'Room 103', consumption: 38, efficiency: 89, savings: 285 },
    { room: 'Lab 201', consumption: 32, efficiency: 92, savings: 245 }
  ];

  const hourlyPattern = [
    { hour: '6:00', automated: 12, manual: 35 },
    { hour: '7:00', automated: 25, manual: 45 },
    { hour: '8:00', automated: 85, manual: 120 },
    { hour: '9:00', automated: 105, manual: 160 },
    { hour: '10:00', automated: 125, manual: 180 },
    { hour: '11:00', automated: 120, manual: 175 },
    { hour: '12:00', automated: 65, manual: 95 },
    { hour: '13:00', automated: 75, manual: 110 },
    { hour: '14:00', automated: 110, manual: 155 },
    { hour: '15:00', automated: 95, manual: 140 },
    { hour: '16:00', automated: 85, manual: 125 },
    { hour: '17:00', automated: 45, manual: 70 },
    { hour: '18:00', automated: 25, manual: 40 }
  ];

  const getCurrentData = () => {
    return timeRange === 'week' ? weeklyData : monthlyData;
  };

  const MetricCard = ({ title, value, unit, change, icon: Icon, color, subtitle }) => (
    <div className="analytics-metric-card">
      <div className="metric-header">
        <div className="metric-icon" style={{ backgroundColor: color }}>
          <Icon size={20} color="white" />
        </div>
        <div className={`metric-change ${change > 0 ? 'positive' : 'negative'}`}>
          {change > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
          <span>{change > 0 ? '+' : ''}{change}%</span>
        </div>
      </div>
      <div className="metric-content">
        <h3>{value}<span className="metric-unit">{unit}</span></h3>
        <p className="metric-title">{title}</p>
        {subtitle && <span className="metric-subtitle">{subtitle}</span>}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="energy-analytics">
      <div className="analytics-header">
        <div>
          <h1>Energy Usage Analytics</h1>
          <p>Comprehensive insights into energy consumption patterns and optimization</p>
        </div>
        <div className="analytics-controls">
          <select 
            className="time-selector"
            value={timeRange} 
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
          <button className="export-btn">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="analytics-metrics">
        <MetricCard
          title="Total Energy Consumption"
          value="745"
          unit=" kWh"
          change={-15}
          icon={Zap}
          color="#3b82f6"
          subtitle="This week"
        />
        <MetricCard
          title="Energy Cost"
          value="₹2,980"
          unit=""
          change={-18}
          icon={DollarSign}
          color="#10b981"
          subtitle="This week"
        />
        <MetricCard
          title="Cost Savings"
          value="₹737"
          unit=""
          change={25}
          icon={TrendingDown}
          color="#f59e0b"
          subtitle="Vs manual control"
        />
        <MetricCard
          title="System Efficiency"
          value="89.2"
          unit="%"
          change={3}
          icon={TrendingUp}
          color="#8b5cf6"
          subtitle="Optimization level"
        />
      </div>

      <div className="analytics-content">
        {/* Main Consumption Chart */}
        <div className="chart-section full-width">
          <div className="chart-header">
            <h2>Energy Consumption Trends</h2>
            <div className="chart-controls">
              <select 
                value={selectedMetric} 
                onChange={(e) => setSelectedMetric(e.target.value)}
              >
                <option value="consumption">Consumption (kWh)</option>
                <option value="cost">Cost (₹)</option>
                <option value="savings">Savings (₹)</option>
                <option value="efficiency">Efficiency (%)</option>
              </select>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getCurrentData()}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey={timeRange === 'week' ? 'day' : 'period'} />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ fill: '#3b82f6', r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="analytics-row">
          {/* Device Breakdown */}
          <div className="chart-section">
            <h2>Device Energy Distribution</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={120}
                    dataKey="value"
                  >
                    {deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="device-legend">
              {deviceBreakdown.map((device) => (
                <div key={device.name} className="legend-item">
                  <div 
                    className="legend-color" 
                    style={{ backgroundColor: device.color }}
                  ></div>
                  <span className="legend-name">{device.name}</span>
                  <span className="legend-value">{device.value}% (₹{device.cost})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Room Comparison */}
          <div className="chart-section">
            <h2>Room-wise Performance</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={roomComparison}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="room" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consumption" fill="#3b82f6" name="Consumption (kWh)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Automation vs Manual Comparison */}
        <div className="chart-section full-width">
          <h2>Automated vs Manual Control Comparison</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={hourlyPattern}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="automated" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  name="Automated Control"
                />
                <Line 
                  type="monotone" 
                  dataKey="manual" 
                  stroke="#ef4444" 
                  strokeWidth={3}
                  name="Manual Control (Estimated)"
                />
                <Legend />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed Statistics */}
        <div className="stats-section">
          <h2>Detailed Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Peak Usage Hours</h4>
              <p className="stat-value">10:00 AM - 12:00 PM</p>
              <span className="stat-subtitle">Average: 180 kWh</span>
            </div>
            <div className="stat-card">
              <h4>Most Efficient Room</h4>
              <p className="stat-value">Room 102</p>
              <span className="stat-subtitle">95% efficiency rating</span>
            </div>
            <div className="stat-card">
              <h4>Total Devices Monitored</h4>
              <p className="stat-value">47 devices</p>
              <span className="stat-subtitle">Across 4 rooms</span>
            </div>
            <div className="stat-card">
              <h4>Average Daily Savings</h4>
              <p className="stat-value">₹105</p>
              <span className="stat-subtitle">22% cost reduction</span>
            </div>
            <div className="stat-card">
              <h4>Energy Waste Reduced</h4>
              <p className="stat-value">28.4 kWh</p>
              <span className="stat-subtitle">Per day average</span>
            </div>
            <div className="stat-card">
              <h4>Carbon Footprint Reduced</h4>
              <p className="stat-value">18.5 kg CO₂</p>
              <span className="stat-subtitle">Per day equivalent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnergyAnalytics;
