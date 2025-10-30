# IoT Energy Management System - Integration Guide

## 🎯 Current Status
Your FastAPI backend is now **fully operational** with all API endpoints working correctly!

### ✅ Completed Backend Components:
- **FastAPI Server**: Running on `http://localhost:8000`
- **API Documentation**: Available at `http://localhost:8000/docs`
- **All Routers**: Dashboard, Monitoring, Occupancy, Zone Control, Energy Analytics, Device Control
- **Mock Data**: Realistic IoT sensor data for testing
- **Database Models**: SQLAlchemy models for data persistence
- **CORS Configuration**: Ready for frontend communication

## 🚀 API Endpoints Available

### Dashboard APIs
- `GET /api/dashboard/summary` - Key metrics and overview
- `GET /api/dashboard/rooms` - All rooms data
- `GET /api/dashboard/energy` - Energy consumption overview
- `GET /api/dashboard/alerts` - Recent system alerts

### Real-Time Monitoring APIs
- `GET /api/monitoring/rooms` - Live room monitoring data
- `GET /api/monitoring/energy` - Real-time energy consumption
- `GET /api/monitoring/room/{room_id}` - Detailed room monitoring
- `GET /api/monitoring/system-status` - Overall system status
- `WebSocket /api/monitoring/realtime` - Live data stream

### Occupancy Detection APIs
- `GET /api/occupancy/cameras` - All camera feeds with AI detection
- `GET /api/occupancy/camera/{camera_id}` - Detailed camera data
- `GET /api/occupancy/analytics` - Occupancy patterns and analytics
- `GET /api/occupancy/alerts` - Occupancy-related alerts
- `POST /api/occupancy/camera/{camera_id}/calibrate` - Trigger calibration

### Zone Control APIs
- `GET /api/zones/` - All zones with device states
- `GET /api/zones/{room_id}` - Room-specific zone data
- `PUT /api/zones/{room_id}/{zone_id}/{device_type}` - Update device state
- `POST /api/zones/{room_id}/schedule` - Create automation schedule
- `GET /api/zones/{room_id}/schedule` - Get room schedule
- `POST /api/zones/{room_id}/optimize` - Trigger energy optimization

### Energy Analytics APIs
- `GET /api/analytics/overview?period=daily` - Energy overview (hourly/daily/weekly/monthly)
- `GET /api/analytics/consumption` - Detailed consumption breakdown
- `GET /api/analytics/trends` - Energy trends and patterns
- `GET /api/analytics/savings` - Savings analysis and recommendations
- `GET /api/analytics/reports?report_type=summary` - Generate reports

### Device Control APIs
- `GET /api/devices/` - All devices across system
- `GET /api/devices/room/{room_id}` - Room-specific devices
- `PUT /api/devices/control` - Control individual device
- `POST /api/devices/bulk-control` - Control multiple devices
- `GET /api/devices/energy-consumption` - Device energy breakdown
- `GET /api/devices/status-overview` - Device status overview

## 🔗 Next Steps: Frontend Integration

### 1. Install Axios for API Calls
```bash
cd "d:\Collage_Codes\Sem-6\final year project\basic-frontend-simple"
npm install axios
```

### 2. Create API Service File
Create `src/services/api.js`:
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const dashboardAPI = {
  getSummary: () => api.get('/api/dashboard/summary'),
  getRooms: () => api.get('/api/dashboard/rooms'),
  getEnergy: () => api.get('/api/dashboard/energy'),
  getAlerts: () => api.get('/api/dashboard/alerts'),
};

export const monitoringAPI = {
  getRooms: () => api.get('/api/monitoring/rooms'),
  getEnergy: () => api.get('/api/monitoring/energy'),
  getRoomDetails: (roomId) => api.get(`/api/monitoring/room/${roomId}`),
  getSystemStatus: () => api.get('/api/monitoring/system-status'),
};

export const occupancyAPI = {
  getCameras: () => api.get('/api/occupancy/cameras'),
  getCameraDetails: (cameraId) => api.get(`/api/occupancy/camera/${cameraId}`),
  getAnalytics: () => api.get('/api/occupancy/analytics'),
  getAlerts: () => api.get('/api/occupancy/alerts'),
  calibrateCamera: (cameraId) => api.post(`/api/occupancy/camera/${cameraId}/calibrate`),
};

export const zoneAPI = {
  getAllZones: () => api.get('/api/zones/'),
  getRoomZones: (roomId) => api.get(`/api/zones/${roomId}`),
  updateDevice: (roomId, zoneId, deviceType, deviceState) => 
    api.put(`/api/zones/${roomId}/${zoneId}/${deviceType}`, deviceState),
  createSchedule: (roomId, scheduleData) => 
    api.post(`/api/zones/${roomId}/schedule`, scheduleData),
  getRoomSchedule: (roomId) => api.get(`/api/zones/${roomId}/schedule`),
  optimizeRoom: (roomId) => api.post(`/api/zones/${roomId}/optimize`),
};

export const analyticsAPI = {
  getOverview: (period = 'daily') => api.get(`/api/analytics/overview?period=${period}`),
  getConsumption: () => api.get('/api/analytics/consumption'),
  getTrends: () => api.get('/api/analytics/trends'),
  getSavings: () => api.get('/api/analytics/savings'),
  getReports: (reportType = 'summary') => api.get(`/api/analytics/reports?report_type=${reportType}`),
};

export const deviceAPI = {
  getAllDevices: () => api.get('/api/devices/'),
  getRoomDevices: (roomId) => api.get(`/api/devices/room/${roomId}`),
  controlDevice: (controlRequest) => api.put('/api/devices/control', controlRequest),
  bulkControl: (bulkRequest) => api.post('/api/devices/bulk-control', bulkRequest),
  getEnergyConsumption: () => api.get('/api/devices/energy-consumption'),
  getStatusOverview: () => api.get('/api/devices/status-overview'),
};

export default api;
```

### 3. Update Frontend Components

Replace mock data in your components:

**Dashboard.js** - Replace mock data with:
```javascript
import { dashboardAPI } from '../services/api';

// In useEffect:
const fetchDashboardData = async () => {
  try {
    const [summary, rooms, energy, alerts] = await Promise.all([
      dashboardAPI.getSummary(),
      dashboardAPI.getRooms(),
      dashboardAPI.getEnergy(),
      dashboardAPI.getAlerts(),
    ]);
    
    setDashboardData({
      summary: summary.data,
      rooms: rooms.data,
      energy: energy.data,
      alerts: alerts.data.alerts,
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
  }
};
```

**RealTimeMonitoring.js** - Add API integration:
```javascript
import { monitoringAPI } from '../services/api';

// For real-time updates, also add WebSocket:
const connectWebSocket = () => {
  const ws = new WebSocket('ws://localhost:8000/api/monitoring/realtime');
  
  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type === 'realtime_update') {
      setRealTimeData(data);
    }
  };
  
  return ws;
};
```

### 4. WebSocket Integration for Real-Time Updates

The backend provides WebSocket support at `/api/monitoring/realtime` for live data updates every 5 seconds.

### 5. Testing Integration

1. **Start Backend**: `python main.py` (in iot-energy-backend folder)
2. **Start Frontend**: `npm start` (in basic-frontend-simple folder)
3. **Verify**: Check that frontend loads data from backend APIs

## 🔧 Development Workflow

### Backend Development:
```bash
cd "d:\Collage_Codes\Sem-6\final year project\iot-energy-backend"
python main.py  # Starts server with auto-reload
```

### Frontend Development:
```bash
cd "d:\Collage_Codes\Sem-6\final year project\basic-frontend-simple"
npm start  # Starts React dev server
```

### API Testing:
- **Swagger UI**: `http://localhost:8000/docs`
- **Health Check**: `http://localhost:8000/health`
- **API Status**: `http://localhost:8000/api/status`

## 📊 Data Flow

1. **Frontend** makes HTTP requests to backend APIs
2. **Backend** generates realistic mock data using MockDataGenerator
3. **Real-time updates** via WebSocket for monitoring dashboard
4. **CORS enabled** for seamless frontend-backend communication

## 🎉 Success Metrics

Your integration is successful when:
- ✅ Frontend loads real data from backend APIs
- ✅ All dashboard cards show dynamic data
- ✅ Real-time monitoring updates automatically
- ✅ Device controls send commands to backend
- ✅ Energy analytics display server-generated charts
- ✅ No CORS errors in browser console

## 🚨 Common Issues & Solutions

**CORS Errors**: Backend is configured for `http://localhost:3000`
**API Not Found**: Ensure backend server is running on port 8000
**WebSocket Issues**: Check that both frontend and backend support WebSocket connections

## 📈 Performance Notes

- Mock data generation is optimized for development
- WebSocket updates every 5 seconds (configurable)
- API responses include proper caching headers
- Database models ready for production data integration

---

**Your IoT Energy Management System backend is now ready for full-stack integration!** 🚀