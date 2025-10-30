import React, { useState, useEffect } from 'react';
import MetricCard from '../components/UI/MetricCard';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ApiService from '../services/api';

const SmartDetection = () => {
  const [loading, setLoading] = useState(true);
  const [detectionStatus, setDetectionStatus] = useState(null);
  const [relayStatus, setRelayStatus] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [systemInfo, setSystemInfo] = useState(null);

  useEffect(() => {
    fetchSmartDetectionData();
    const interval = setInterval(fetchSmartDetectionData, 10000); // Update every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchSmartDetectionData = async () => {
    try {
      const [statusRes, relayRes, analyticsRes, systemRes] = await Promise.all([
        ApiService.getDetectionStatus(),
        ApiService.getRelayStatus(),
        ApiService.getDetectionAnalytics(),
        ApiService.getSystemInfo()
      ]);

      setDetectionStatus(statusRes);
      setRelayStatus(Array.isArray(relayRes) ? relayRes : []);
      setAnalytics(analyticsRes);
      setSystemInfo(systemRes);
    } catch (error) {
      console.error('Smart detection error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartDetection = async () => {
    try {
      await ApiService.startDetection();
      fetchSmartDetectionData();
    } catch (error) {
      console.error('Start detection error:', error);
    }
  };

  const handleStopDetection = async () => {
    try {
      await ApiService.stopDetection();
      fetchSmartDetectionData();
    } catch (error) {
      console.error('Stop detection error:', error);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="large" text="Loading smart detection..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Smart Detection</h1>
          <p className="page-subtitle">AI-powered human detection and automation</p>
        </div>
        <div className="detection-controls">
          <button 
            className="btn btn-success"
            onClick={handleStartDetection}
            disabled={detectionStatus?.human_detected}
          >
            🤖 Start Detection
          </button>
          <button 
            className="btn btn-danger"
            onClick={handleStopDetection}
            disabled={!detectionStatus?.human_detected}
          >
            ⏹️ Stop Detection
          </button>
        </div>
      </div>

      {/* System Status */}
      {systemInfo && (
        <div className="grid grid-4 mb-4">
          <MetricCard
            title="Camera Status"
            value={systemInfo.camera_available ? 'Available' : 'Unavailable'}
            icon="📹"
            color={systemInfo.camera_available ? 'success' : 'danger'}
          />
          <MetricCard
            title="AI Model"
            value={systemInfo.ai_model_loaded ? 'Loaded' : 'Not Loaded'}
            icon="🤖"
            color={systemInfo.ai_model_loaded ? 'success' : 'warning'}
          />
          <MetricCard
            title="Relay Pins"
            value={systemInfo.relay_pins_configured ? 'Configured' : 'Not Configured'}
            icon="🔌"
            color={systemInfo.relay_pins_configured ? 'success' : 'danger'}
          />
          <MetricCard
            title="Hardware Status"
            value={systemInfo.hardware_status}
            icon="⚙️"
            color={systemInfo.hardware_status === 'operational' ? 'success' : 'warning'}
          />
        </div>
      )}

      {/* Detection Analytics */}
      {analytics && (
        <div className="grid grid-4 mb-4">
          <MetricCard
            title="Daily Detections"
            value={analytics.daily_detections}
            icon="👥"
            color="primary"
          />
          <MetricCard
            title="Detection Rate"
            value={`${analytics.average_detection_rate}%`}
            icon="📊"
            color="info"
          />
          <MetricCard
            title="Energy Saved"
            value={analytics.energy_saved}
            icon="⚡"
            color="success"
          />
          <MetricCard
            title="Cost Saved"
            value={analytics.cost_saved}
            icon="💰"
            color="warning"
          />
        </div>
      )}

      <div className="grid grid-2 mb-4">
        {/* Detection Status */}
        <div className="card">
          <h3 className="card-title">🤖 Detection Status</h3>
          {detectionStatus ? (
            <div className="detection-info">
              <div className="status-item">
                <span className="status-label">Human Detected:</span>
                <span className={`status-value ${detectionStatus.human_detected ? 'active' : 'inactive'}`}>
                  {detectionStatus.human_detected ? '✅ Yes' : '❌ No'}
                </span>
              </div>
              <div className="status-item">
                <span className="status-label">Occupied Zones:</span>
                <span className="status-value">{detectionStatus.occupied_zones?.length || 0}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Detection Rate:</span>
                <span className="status-value">{detectionStatus.detection_rate}%</span>
              </div>
              <div className="status-item">
                <span className="status-label">Processed Frames:</span>
                <span className="status-value">{detectionStatus.processed_frames}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Frames with Humans:</span>
                <span className="status-value">{detectionStatus.frames_with_humans}</span>
              </div>
            </div>
          ) : (
            <p>No detection data available</p>
          )}
        </div>

        {/* Relay Status */}
        <div className="card">
          <h3 className="card-title">🔌 Relay Status</h3>
          <div className="relay-grid">
            {relayStatus && relayStatus.length > 0 ? relayStatus.map((relay, index) => (
              <div key={index} className="relay-card">
                <div className="relay-header">
                  <span className="relay-pin">Pin {relay.pin}</span>
                  <span className={`relay-status ${relay.status.toLowerCase()}`}>
                    {relay.status}
                  </span>
                </div>
                <div className="relay-appliances">
                  {relay.appliances?.map((appliance, idx) => (
                    <span key={idx} className="appliance-tag">{appliance}</span>
                  ))}
                </div>
              </div>
            )) : (
              <div className="no-data">
                <p>No relay status available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Peak Detection Hours */}
      {analytics?.peak_detection_hours && (
        <div className="card">
          <h3 className="card-title">📈 Peak Detection Hours</h3>
          <div className="peak-hours">
            {analytics?.peak_detection_hours && Array.isArray(analytics.peak_detection_hours) ? 
              analytics.peak_detection_hours.map((hour, index) => (
                <div key={index} className="hour-badge">
                  {hour}
                </div>
              )) : (
                <div className="no-data">
                  <p>No peak detection hours data available</p>
                </div>
              )
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartDetection;