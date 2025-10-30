import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Users, 
  Eye, 
  Activity,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Zap,
  Settings,
  Power,
  StopCircle,
  Play
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { smartDetectionAPI } from '../services/api';
import './OccupancyDetection.css';

const OccupancyDetection = () => {
  const [selectedRoom, setSelectedRoom] = useState('room-101');
  const [smartDetectionData, setSmartDetectionData] = useState(null);
  const [relayStatus, setRelayStatus] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState([]);

  // Fetch smart detection system status
  useEffect(() => {
    fetchSystemStatus();
    fetchRelayStatus();
    fetchAnalytics();
    fetchAlerts();
  }, []);

  const fetchSystemStatus = async () => {
    try {
      const response = await smartDetectionAPI.getSystemStatus();
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const fetchRelayStatus = async () => {
    try {
      const response = await smartDetectionAPI.getRelayStatus();
      setRelayStatus(response.data.relays);
    } catch (error) {
      console.error('Error fetching relay status:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await smartDetectionAPI.getAnalytics();
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await smartDetectionAPI.getAlerts();
      setAlerts(response.data);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const runDetection = async () => {
    setLoading(true);
    setIsDetecting(true);
    try {
      const response = await smartDetectionAPI.runDetection();
      setSmartDetectionData(response.data);
      // Refresh relay status after detection
      await fetchRelayStatus();
      await fetchAnalytics();
    } catch (error) {
      console.error('Error running detection:', error);
      alert('Error running detection: ' + error.message);
    } finally {
      setLoading(false);
      setIsDetecting(false);
    }
  };

  const emergencyStop = async () => {
    try {
      await smartDetectionAPI.emergencyStop();
      await fetchRelayStatus();
      alert('Emergency stop activated - all relays turned off');
    } catch (error) {
      console.error('Error in emergency stop:', error);
      alert('Error in emergency stop: ' + error.message);
    }
  };

  const controlRelay = async (pin, action) => {
    try {
      await smartDetectionAPI.manualRelayControl(pin, action);
      await fetchRelayStatus();
    } catch (error) {
      console.error('Error controlling relay:', error);
      alert('Error controlling relay: ' + error.message);
    }
  };

  const cameraFeeds = [
    {
      id: 'cam-101',
      roomId: 'room-101',
      name: 'Room 101 - Front View',
      status: 'active',
      detectedPeople: 25,
      confidence: 94,
      lastUpdate: '2 sec ago',
      zones: [
        { id: 'zone-1', name: 'Front Section', occupancy: 12, maxCapacity: 15 },
        { id: 'zone-2', name: 'Middle Section', occupancy: 8, maxCapacity: 15 },
        { id: 'zone-3', name: 'Back Section', occupancy: 5, maxCapacity: 10 }
      ]
    },
    {
      id: 'cam-102',
      roomId: 'room-102',
      name: 'Room 102 - Main View',
      status: 'active',
      detectedPeople: 0,
      confidence: 98,
      lastUpdate: '1 sec ago',
      zones: [
        { id: 'zone-1', name: 'Front Section', occupancy: 0, maxCapacity: 12 },
        { id: 'zone-2', name: 'Middle Section', occupancy: 0, maxCapacity: 12 },
        { id: 'zone-3', name: 'Back Section', occupancy: 0, maxCapacity: 11 }
      ]
    },
    {
      id: 'cam-103',
      roomId: 'room-103',
      name: 'Room 103 - Wide View',
      status: 'active',
      detectedPeople: 18,
      confidence: 91,
      lastUpdate: '3 sec ago',
      zones: [
        { id: 'zone-1', name: 'Left Section', occupancy: 7, maxCapacity: 10 },
        { id: 'zone-2', name: 'Center Section', occupancy: 8, maxCapacity: 12 },
        { id: 'zone-3', name: 'Right Section', occupancy: 3, maxCapacity: 8 }
      ]
    },
    {
      id: 'cam-201',
      roomId: 'lab-201',
      name: 'Lab 201 - Overview',
      status: 'active',
      detectedPeople: 12,
      confidence: 96,
      lastUpdate: '1 sec ago',
      zones: [
        { id: 'zone-1', name: 'Workstation Area', occupancy: 8, maxCapacity: 12 },
        { id: 'zone-2', name: 'Discussion Area', occupancy: 4, maxCapacity: 8 },
        { id: 'zone-3', name: 'Equipment Area', occupancy: 0, maxCapacity: 5 }
      ]
    }
  ];

  const hourlyOccupancyData = [
    { hour: '8:00', room101: 0, room102: 0, room103: 0, lab201: 0 },
    { hour: '9:00', room101: 35, room102: 0, room103: 25, lab201: 15 },
    { hour: '10:00', room101: 40, room102: 30, room103: 28, lab201: 20 },
    { hour: '11:00', room101: 38, room102: 28, room103: 30, lab201: 18 },
    { hour: '12:00', room101: 20, room102: 15, room103: 12, lab201: 8 },
    { hour: '13:00', room101: 25, room102: 0, room103: 18, lab201: 12 },
    { hour: '14:00', room101: 25, room102: 0, room103: 18, lab201: 12 },
    { hour: '15:00', room101: 32, room102: 25, room103: 22, lab201: 10 },
    { hour: '16:00', room101: 28, room102: 20, room103: 15, lab201: 8 },
    { hour: '17:00', room101: 15, room102: 8, room103: 5, lab201: 3 },
    { hour: '18:00', room101: 0, room102: 0, room103: 0, lab201: 0 }
  ];

  const zoneUtilizationData = [
    { zone: 'Front Sections', utilization: 78, rooms: 4 },
    { zone: 'Middle Sections', utilization: 65, rooms: 4 },
    { zone: 'Back Sections', utilization: 52, rooms: 4 },
    { zone: 'Workstation Areas', utilization: 85, rooms: 1 },
    { zone: 'Discussion Areas', utilization: 45, rooms: 1 }
  ];

  const selectedCamera = cameraFeeds.find(cam => cam.roomId === selectedRoom);

  const SmartDetectionCard = ({ title, value, subtitle, icon: Icon, color, status, onClick }) => (
    <div className={`occupancy-status-card smart-detection ${status || ''}`} onClick={onClick}>
      <div className="status-icon" style={{ backgroundColor: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className="status-content">
        <h3>{value}</h3>
        <p className="status-title">{title}</p>
        {subtitle && <span className="status-subtitle">{subtitle}</span>}
      </div>
    </div>
  );

  const RelayControlCard = ({ relay, onControl }) => (
    <div className="relay-control-card">
      <div className="relay-header">
        <h4>GPIO Pin {relay.pin}</h4>
        <span className={`status-badge ${relay.status.toLowerCase()}`}>
          {relay.status}
        </span>
      </div>
      <div className="relay-appliances">
        {relay.appliances.map((appliance, index) => (
          <span key={index} className="appliance-tag">{appliance}</span>
        ))}
      </div>
      <div className="relay-controls">
        <button 
          className="btn-relay on" 
          onClick={() => onControl(relay.pin, 'on')}
          disabled={relay.status === 'ON'}
        >
          <Power size={16} /> ON
        </button>
        <button 
          className="btn-relay off" 
          onClick={() => onControl(relay.pin, 'off')}
          disabled={relay.status === 'OFF'}
        >
          <StopCircle size={16} /> OFF
        </button>
      </div>
    </div>
  );

  const DetectionResultCard = ({ data }) => {
    if (!data) return null;
    
    return (
      <div className="detection-result-card">
        <h3>Latest Detection Results</h3>
        <div className="detection-stats">
          <div className="stat">
            <span className="label">Humans Detected:</span>
            <span className={`value ${data.human_detected ? 'positive' : 'negative'}`}>
              {data.human_detected ? 'YES' : 'NO'}
            </span>
          </div>
          <div className="stat">
            <span className="label">Detection Rate:</span>
            <span className="value">{data.detection_rate.toFixed(1)}%</span>
          </div>
          <div className="stat">
            <span className="label">Occupied Zones:</span>
            <span className="value">{data.occupied_zones.length}</span>
          </div>
          <div className="stat">
            <span className="label">Processed Frames:</span>
            <span className="value">{data.processed_frames}</span>
          </div>
        </div>
        
        {data.occupied_zones.length > 0 && (
          <div className="occupied-zones">
            <h4>Occupied Zones:</h4>
            {data.occupied_zones.map((zone, index) => (
              <span key={index} className="zone-badge">
                Row {zone[0]}, Col {zone[1]}
              </span>
            ))}
          </div>
        )}
        
        <div className="device-commands">
          <h4>Device Commands:</h4>
          {data.commands.map((command, index) => (
            <div key={index} className="command-item">
              <span className="zone">Zone ({command.zone[0]}, {command.zone[1]}):</span>
              <span className={`status ${command.status.toLowerCase()}`}>{command.status}</span>
              <div className="appliances">
                {command.appliances.map((appliance, i) => (
                  <span key={i} className="appliance">{appliance}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const StatusCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
    <div className="occupancy-status-card">
      <div className="status-icon" style={{ backgroundColor: color }}>
        <Icon size={24} color="white" />
      </div>
      <div className="status-content">
        <div className="status-header">
          <h3>{value}</h3>
          {trend && (
            <span className={`trend ${trend > 0 ? 'positive' : 'negative'}`}>
              <TrendingUp size={16} />
              {trend > 0 ? '+' : ''}{trend}%
            </span>
          )}
        </div>
        <p className="status-title">{title}</p>
        {subtitle && <span className="status-subtitle">{subtitle}</span>}
      </div>
    </div>
  );

  const CameraFeedCard = ({ camera, isSelected, onClick }) => (
    <div 
      className={`camera-feed-card ${isSelected ? 'selected' : ''} ${camera.status}`}
      onClick={() => onClick(camera.roomId)}
    >
      <div className="camera-header">
        <div className="camera-info">
          <h4>{camera.name}</h4>
          <div className="camera-stats">
            <span className={`status-indicator ${camera.status}`}>
              {camera.status === 'active' ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
              {camera.status}
            </span>
            <span className="confidence">
              Confidence: {camera.confidence}%
            </span>
          </div>
        </div>
        <div className="detection-count">
          <Users size={20} />
          <span>{camera.detectedPeople}</span>
        </div>
      </div>
      
      <div className="camera-preview">
        <div className="video-placeholder">
          <Camera size={32} />
          <p>Camera Feed</p>
        </div>
        <div className="last-update">
          <Clock size={12} />
          {camera.lastUpdate}
        </div>
      </div>

      <div className="zone-occupancy">
        <h5>Zone Occupancy</h5>
        <div className="zones-list">
          {camera.zones.map(zone => (
            <div key={zone.id} className="zone-item">
              <span className="zone-name">{zone.name}</span>
              <span className="zone-count">
                {zone.occupancy}/{zone.maxCapacity}
              </span>
              <div className="zone-bar">
                <div 
                  className="zone-fill"
                  style={{ width: `${(zone.occupancy / zone.maxCapacity) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="occupancy-detection">
      <div className="occupancy-header">
        <h1>Smart Human Detection & Device Control</h1>
        <p>AI-powered occupancy monitoring with automatic relay control using YOLO detection</p>
      </div>

      {/* Smart Detection Controls */}
      <div className="smart-detection-controls">
        <button 
          className={`btn-detection ${isDetecting ? 'detecting' : ''}`}
          onClick={runDetection}
          disabled={loading}
        >
          <Play size={20} />
          {loading ? 'Detecting...' : 'Start Smart Detection'}
        </button>
        <button 
          className="btn-emergency"
          onClick={emergencyStop}
        >
          <StopCircle size={20} />
          Emergency Stop
        </button>
        {systemStatus && (
          <div className="system-status">
            <span className={`status-indicator ${systemStatus.hardware_status}`}>
              {systemStatus.hardware_status === 'operational' ? (
                <CheckCircle size={16} />
              ) : (
                <AlertTriangle size={16} />
              )}
              {systemStatus.hardware_status}
            </span>
          </div>
        )}
      </div>

      {/* Smart Detection Status Overview */}
      <div className="status-overview">
        <SmartDetectionCard
          title="Camera Status"
          value={systemStatus?.camera_available ? "Active" : "Inactive"}
          subtitle="Detection capability"
          icon={Camera}
          color={systemStatus?.camera_available ? "#10b981" : "#ef4444"}
          status={systemStatus?.camera_available ? "active" : "inactive"}
        />
        <SmartDetectionCard
          title="AI Model"
          value={systemStatus?.ai_model_loaded ? "Loaded" : "Not Loaded"}
          subtitle="YOLO detection ready"
          icon={Eye}
          color={systemStatus?.ai_model_loaded ? "#10b981" : "#ef4444"}
          status={systemStatus?.ai_model_loaded ? "active" : "inactive"}
        />
        <SmartDetectionCard
          title="Energy Saved Today"
          value={analytics?.energy_saved || "0 kWh"}
          subtitle={analytics?.cost_saved || "$0.00"}
          icon={Zap}
          color="#f59e0b"
        />
        <SmartDetectionCard
          title="Detection Rate"
          value={analytics?.average_detection_rate ? `${analytics.average_detection_rate}%` : "N/A"}
          subtitle="Average accuracy"
          icon={Activity}
          color="#8b5cf6"
        />
      </div>

      <div className="occupancy-content">
        {/* Live Camera Preview */}
        <div className="camera-preview-section">
          <h2>Live Camera Feed with Grid Overlay</h2>
          <div className="camera-preview-container">
            <img 
              src={smartDetectionAPI.getPreviewUrl()} 
              alt="Live Camera Feed"
              className="camera-preview"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className="preview-info">
              <p>Real-time detection with 3x3 grid overlay</p>
              <p>Columns control different relay groups</p>
            </div>
          </div>
        </div>

        {/* Relay Control Section */}
        <div className="relay-control-section">
          <h2>Relay Control Panel</h2>
          <div className="relay-grid">
            {relayStatus.map(relay => (
              <RelayControlCard
                key={relay.pin}
                relay={relay}
                onControl={controlRelay}
              />
            ))}
          </div>
        </div>

        {/* Detection Results */}
        {smartDetectionData && (
          <DetectionResultCard data={smartDetectionData} />
        )}

        {/* Analytics Charts */}
        {analytics && (
          <div className="analytics-row">
            <div className="chart-section">
              <h2>Zone Utilization Analysis</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.zone_utilization}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="zone" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="utilization" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="chart-section">
              <h2>Hourly Detection Pattern</h2>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.hourly_pattern}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="detections" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* Regular Camera Feeds Section */}
        <div className="camera-section">
          <h2>Traditional Camera Feeds</h2>
          <div className="camera-grid">
            {cameraFeeds.map(camera => (
              <CameraFeedCard
                key={camera.id}
                camera={camera}
                isSelected={camera.roomId === selectedRoom}
                onClick={setSelectedRoom}
              />
            ))}
          </div>
        </div>

        <div className="analytics-row">
          {/* Hourly Occupancy Chart */}
          <div className="chart-section">
            <h2>Hourly Occupancy Patterns</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyOccupancyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="room101" stroke="#3b82f6" strokeWidth={2} name="Room 101" />
                  <Line type="monotone" dataKey="room102" stroke="#10b981" strokeWidth={2} name="Room 102" />
                  <Line type="monotone" dataKey="room103" stroke="#f59e0b" strokeWidth={2} name="Room 103" />
                  <Line type="monotone" dataKey="lab201" stroke="#8b5cf6" strokeWidth={2} name="Lab 201" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Zone Utilization */}
          <div className="chart-section">
            <h2>Traditional Zone Utilization</h2>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={zoneUtilizationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="zone" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="utilization" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Selected Room Details */}
        {selectedCamera && (
          <div className="room-details">
            <h2>Detailed View: {selectedCamera.name}</h2>
            <div className="room-details-content">
              <div className="detection-info">
                <div className="detection-metric">
                  <h3>{selectedCamera.detectedPeople}</h3>
                  <p>People Detected</p>
                </div>
                <div className="detection-metric">
                  <h3>{selectedCamera.confidence}%</h3>
                  <p>Confidence Level</p>
                </div>
                <div className="detection-metric">
                  <h3>{selectedCamera.zones.length}</h3>
                  <p>Monitored Zones</p>
                </div>
              </div>
              
              <div className="zones-detailed">
                <h4>Zone-wise Distribution</h4>
                {selectedCamera.zones.map(zone => (
                  <div key={zone.id} className="zone-detail-item">
                    <div className="zone-info">
                      <h5>{zone.name}</h5>
                      <span className="occupancy-ratio">
                        {zone.occupancy}/{zone.maxCapacity} people
                      </span>
                    </div>
                    <div className="zone-progress">
                      <div className="progress-bar">
                        <div 
                          className="progress-fill"
                          style={{ 
                            width: `${(zone.occupancy / zone.maxCapacity) * 100}%`,
                            backgroundColor: zone.occupancy > zone.maxCapacity * 0.8 ? '#ef4444' : 
                                           zone.occupancy > zone.maxCapacity * 0.6 ? '#f59e0b' : '#10b981'
                          }}
                        ></div>
                      </div>
                      <span className="percentage">
                        {Math.round((zone.occupancy / zone.maxCapacity) * 100)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alerts Section */}
        {alerts.length > 0 && (
          <div className="alerts-section">
            <h2>Smart Detection Alerts</h2>
            <div className="alerts-list">
              {alerts.map(alert => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <div className="alert-icon">
                    {alert.type === 'success' && <CheckCircle size={20} />}
                    {alert.type === 'warning' && <AlertTriangle size={20} />}
                    {alert.type === 'info' && <Eye size={20} />}
                  </div>
                  <div className="alert-content">
                    <p>{alert.message}</p>
                    <span className="alert-time">{alert.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OccupancyDetection;
