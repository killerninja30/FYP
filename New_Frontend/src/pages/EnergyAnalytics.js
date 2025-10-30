import React, { useState, useEffect } from 'react';
import MetricCard from '../components/UI/MetricCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ApiService from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

const EnergyAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [deviceBreakdown, setDeviceBreakdown] = useState([]);
  const [roomComparison, setRoomComparison] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      setError(null);
      const [weeklyRes, monthlyRes, deviceRes, roomRes] = await Promise.all([
        ApiService.getWeeklyEnergyData(),
        ApiService.getMonthlyEnergyData(),
        ApiService.getDeviceBreakdown(),
        ApiService.getRoomComparison()
      ]);

      setWeeklyData(Array.isArray(weeklyRes) ? weeklyRes : []);
      setMonthlyData(Array.isArray(monthlyRes) ? monthlyRes : []);
      setDeviceBreakdown(Array.isArray(deviceRes) ? deviceRes : []);
      setRoomComparison(Array.isArray(roomRes) ? roomRes : []);
    } catch (error) {
      console.error('Analytics error:', error);
      setError('Failed to fetch analytics data');
      
      // Set empty arrays as fallback
      setWeeklyData([]);
      setMonthlyData([]);
      setDeviceBreakdown([]);
      setRoomComparison([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="large" text="Loading analytics..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-container">
          <h2>⚠️ Error</h2>
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchAnalyticsData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Energy Analytics</h1>
        <p className="page-subtitle">Detailed energy consumption insights</p>
      </div>

      <div className="grid grid-4 mb-4">
        <MetricCard
          title="Weekly Consumption"
          value="254.8"
          unit="kWh"
          icon="📊"
          color="primary"
          trend="up"
          trendValue="12%"
        />
        <MetricCard
          title="Cost Savings"
          value="₹1,240"
          icon="💰"
          color="success"
          trend="up"
          trendValue="8%"
        />
        <MetricCard
          title="Efficiency"
          value="87.5"
          unit="%"
          icon="⚡"
          color="warning"
        />
        <MetricCard
          title="Carbon Footprint"
          value="180.2"
          unit="kg CO₂"
          icon="🌱"
          color="info"
          trend="down"
          trendValue="5%"
        />
      </div>

      <div className="grid grid-2 mb-4">
        <div className="card">
          <h3 className="card-title">📈 Weekly Energy Trend</h3>
          <div className="chart-container">
            {weeklyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
                  <YAxis stroke="#64748b" fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={3} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                <p>No weekly data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">🔌 Device Energy Breakdown</h3>
          <div className="chart-container">
            {deviceBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deviceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deviceBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                <p>No device breakdown data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">🏢 Room Energy Comparison</h3>
        <div className="chart-container">
          {roomComparison.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roomComparison}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="room" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} />
                <Tooltip />
                <Bar dataKey="consumption" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="chart-placeholder">
              <p>No room comparison data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnergyAnalytics;