import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import Monitoring from './pages/Monitoring';
import Occupancy from './pages/Occupancy';
import ZoneControl from './pages/ZoneControl';
import EnergyAnalytics from './pages/EnergyAnalytics';
import DeviceControl from './pages/DeviceControl';
import SmartDetection from './pages/SmartDetection';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="app-content">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/monitoring" element={<Monitoring />} />
              <Route path="/occupancy" element={<Occupancy />} />
              <Route path="/zone-control" element={<ZoneControl />} />
              <Route path="/energy-analytics" element={<EnergyAnalytics />} />
              <Route path="/device-control" element={<DeviceControl />} />
              <Route path="/smart-detection" element={<SmartDetection />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;