import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import RealTimeMonitoring from './pages/RealTimeMonitoring';
import OccupancyDetection from './pages/OccupancyDetection';
import ZoneControl from './pages/ZoneControl';
import EnergyAnalytics from './pages/EnergyAnalytics';
import DeviceControl from './pages/DeviceControl';
import './App.css';

// Placeholder components for remaining pages

const MobileApp = () => (
  <div className="page-placeholder">
    <h1>Mobile Control</h1>
    <p>Mobile app integration and remote control features</p>
  </div>
);

const CameraFeeds = () => (
  <div className="page-placeholder">
    <h1>Camera Feeds</h1>
    <p>Live camera feeds from ESP32-CAM modules</p>
  </div>
);

const ManualOverride = () => (
  <div className="page-placeholder">
    <h1>Manual Override</h1>
    <p>Emergency controls and manual system management</p>
  </div>
);

const Settings = () => (
  <div className="page-placeholder">
    <h1>Settings</h1>
    <p>System configuration and preferences</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="monitoring" element={<RealTimeMonitoring />} />
            <Route path="occupancy" element={<OccupancyDetection />} />
            <Route path="zone-control" element={<ZoneControl />} />
            <Route path="energy-analytics" element={<EnergyAnalytics />} />
            <Route path="device-control" element={<DeviceControl />} />
            <Route path="mobile-app" element={<MobileApp />} />
            <Route path="camera-feeds" element={<CameraFeeds />} />
            <Route path="manual-override" element={<ManualOverride />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;
