import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Add request interceptor for debugging
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Dashboard API endpoints
export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary'),
  getRooms: () => api.get('/api/dashboard/rooms'),
  getEnergy: () => api.get('/api/dashboard/energy'),
  getAlerts: () => api.get('/api/dashboard/alerts'),
};

// Real-time Monitoring API endpoints
export const monitoringAPI = {
  getRooms: () => api.get('/api/monitoring/rooms'),
  getEnergy: () => api.get('/api/monitoring/energy'),
  getRoomDetails: (roomId) => api.get(`/api/monitoring/room/${roomId}`),
  getSystemStatus: () => api.get('/api/monitoring/system-status'),
};

// Occupancy Detection API endpoints
export const occupancyAPI = {
  getCameras: () => api.get('/api/occupancy/cameras'),
  getCameraDetails: (cameraId) => api.get(`/api/occupancy/camera/${cameraId}`),
  getAnalytics: () => api.get('/api/occupancy/analytics'),
  getAlerts: () => api.get('/api/occupancy/alerts'),
  calibrateCamera: (cameraId) => api.post(`/api/occupancy/camera/${cameraId}/calibrate`),
};

// Zone Control API endpoints
export const zoneAPI = {
  getAllZones: () => api.get('/api/zone-control/'),
  getRoomZones: (roomId) => api.get(`/api/zone-control/${roomId}`),
  updateDevice: (roomId, zoneId, deviceType, deviceState) => 
    api.put(`/api/zone-control/${roomId}/${zoneId}/${deviceType}`, deviceState),
  createSchedule: (roomId, scheduleData) => 
    api.post(`/api/zone-control/${roomId}/schedule`, scheduleData),
  getRoomSchedule: (roomId) => api.get(`/api/zone-control/${roomId}/schedule`),
  optimizeRoom: (roomId) => api.post(`/api/zone-control/${roomId}/optimize`),
  getAutomationAlerts: () => api.get('/api/zone-control/automation/alerts'),
  syncDeviceStates: (states) => api.post('/api/zone-control/sync-states', states),
  getCurrentStates: () => api.get('/api/zone-control/current-states'),
};

// Energy Analytics API endpoints
export const analyticsAPI = {
  getOverview: (period = 'daily') => api.get(`/api/analytics/overview?period=${period}`),
  getConsumption: () => api.get('/api/analytics/consumption'),
  getTrends: () => api.get('/api/analytics/trends'),
  getSavings: () => api.get('/api/analytics/savings'),
  getReports: (reportType = 'summary', startDate = null, endDate = null) => {
    const params = new URLSearchParams({ report_type: reportType });
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    return api.get(`/api/analytics/reports?${params}`);
  },
  getAlerts: () => api.get('/api/analytics/alerts'),
};

// Device Control API endpoints
export const deviceAPI = {
  getAllDevices: () => api.get('/api/devices/'),
  getRoomDevices: (roomId) => api.get(`/api/devices/room/${roomId}`),
  controlDevice: (controlRequest) => api.put('/api/devices/control', controlRequest),
  bulkControl: (bulkRequest) => api.post('/api/devices/bulk-control', bulkRequest),
  getEnergyConsumption: () => api.get('/api/devices/energy-consumption'),
  getStatusOverview: () => api.get('/api/devices/status-overview'),
  getAlerts: () => api.get('/api/devices/alerts'),
};

// Smart Detection API endpoints
export const smartDetectionAPI = {
  runDetection: () => api.post('/api/smart-detection/detect'),
  getSystemStatus: () => api.get('/api/smart-detection/status'),
  getRelayStatus: () => api.get('/api/smart-detection/relay-status'),
  manualRelayControl: (pin, action) => api.post(`/api/smart-detection/manual-control/${pin}/${action}`),
  emergencyStop: () => api.post('/api/smart-detection/emergency-stop'),
  getAnalytics: () => api.get('/api/smart-detection/analytics'),
  getAlerts: () => api.get('/api/smart-detection/alerts'),
  getPreviewUrl: () => `${API_BASE_URL}/api/smart-detection/preview`,
  getUIUrl: () => `${API_BASE_URL}/api/smart-detection/ui`,
};

// WebSocket connection for real-time updates
export const createWebSocketConnection = (onMessage, onError = null) => {
  const ws = new WebSocket(`ws://localhost:8000/api/monitoring/realtime`);
  
  ws.onopen = () => {
    console.log('WebSocket connected');
  };
  
  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  };
  
  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
    if (onError) onError(error);
  };
  
  ws.onclose = () => {
    console.log('WebSocket disconnected');
  };
  
  return ws;
};

// Utility function to check API health
export const checkAPIHealth = async () => {
  try {
    const response = await api.get('/health');
    return response.data;
  } catch (error) {
    throw new Error('Backend API is not accessible');
  }
};

// Utility function to get API status
export const getAPIStatus = async () => {
  try {
    const response = await api.get('/api/status');
    return response.data;
  } catch (error) {
    throw new Error('Could not fetch API status');
  }
};

export default api;