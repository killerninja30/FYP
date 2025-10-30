import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import ApiService from '../services/api';
import './Occupancy.css';

const Occupancy = () => {
  const [loading, setLoading] = useState(true);
  const [cameraFeeds, setCameraFeeds] = useState([]);
  const [hourlyOccupancy, setHourlyOccupancy] = useState([]);
  const [zoneUtilization, setZoneUtilization] = useState([]);

  useEffect(() => {
    fetchOccupancyData();
  }, []);

  const fetchOccupancyData = async () => {
    try {
      const [feedsRes, hourlyRes, zoneRes] = await Promise.all([
        ApiService.getCameraFeeds(),
        ApiService.getHourlyOccupancy(),
        ApiService.getZoneUtilization()
      ]);

      setCameraFeeds(Array.isArray(feedsRes) ? feedsRes : []);
      setHourlyOccupancy(Array.isArray(hourlyRes) ? hourlyRes : []);
      setZoneUtilization(Array.isArray(zoneRes) ? zoneRes : []);
    } catch (error) {
      console.error('Occupancy error:', error);
      // Set empty arrays as fallback
      setCameraFeeds([]);
      setHourlyOccupancy([]);
      setZoneUtilization([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <LoadingSpinner size="large" text="Loading occupancy data..." />
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Occupancy Monitoring</h1>
        <p className="page-subtitle">People detection and occupancy analytics</p>
      </div>

      <div className="grid grid-2 mb-4">
        <div className="card">
          <h3 className="card-title">📹 Camera Feeds</h3>
          <div className="camera-grid">
            {cameraFeeds && cameraFeeds.length > 0 ? cameraFeeds.map((feed) => (
              <div key={feed.id} className="camera-card">
                <div className="camera-header">
                  <span className="camera-name">{feed.name}</span>
                  <span className={`camera-status ${feed.status}`}>{feed.status}</span>
                </div>
                <div className="camera-info">
                  <p>Detected People: <strong>{feed.detected_people}</strong></p>
                  <p>Confidence: <strong>{feed.confidence}%</strong></p>
                  <p>Last Update: <span>{feed.last_update}</span></p>
                </div>
              </div>
            )) : (
              <div className="no-data">
                <p>No camera feeds available</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">👥 Zone Utilization</h3>
          <div className="zone-utilization">
            {zoneUtilization && zoneUtilization.length > 0 ? zoneUtilization.map((zone, index) => (
              <div key={index} className="zone-item">
                <div className="zone-info">
                  <span className="zone-name">{zone.name || `Zone ${index + 1}`}</span>
                  <span className="zone-percentage">{zone.utilization || 0}%</span>
                </div>
                <div className="zone-bar">
                  <div 
                    className="zone-fill" 
                    style={{ width: `${zone.utilization || 0}%` }}
                  ></div>
                </div>
              </div>
            )) : (
              <div className="no-data">
                <p>No zone utilization data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="card-title">📊 Hourly Occupancy Pattern</h3>
        <div className="hourly-pattern">
          {hourlyOccupancy && hourlyOccupancy.length > 0 ? hourlyOccupancy.map((hour, index) => (
            <div key={index} className="hour-item">
              <div className="hour-time">{hour.time || `${index}:00`}</div>
              <div className="hour-count">{hour.count || 0} people</div>
            </div>
          )) : (
            <div className="no-data">
              <p>No hourly occupancy data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Occupancy;