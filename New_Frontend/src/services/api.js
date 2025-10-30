const API_BASE_URL = 'http://localhost:8000/api';

class ApiService {
  // Dashboard APIs
  async getDashboardSummary() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/summary`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard summary:', error);
      throw error;
    }
  }

  async getDashboardRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/rooms`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard rooms:', error);
      throw error;
    }
  }

  async getDashboardEnergy() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/energy`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard energy:', error);
      throw error;
    }
  }

  async getDashboardAlerts() {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/alerts`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching dashboard alerts:', error);
      throw error;
    }
  }

  // Monitoring APIs
  async getMonitoringRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/rooms`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching monitoring rooms:', error);
      throw error;
    }
  }

  async getRealtimeEnergy() {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/energy`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching realtime energy:', error);
      throw error;
    }
  }

  async getRoomDetails(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/room/${roomId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching room details:', error);
      throw error;
    }
  }

  async getSystemStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/monitoring/system-status`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching system status:', error);
      throw error;
    }
  }

  // Occupancy APIs
  async getCameraFeeds() {
    try {
      const response = await fetch(`${API_BASE_URL}/occupancy/cameras`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching camera feeds:', error);
      throw error;
    }
  }

  async getHourlyOccupancy() {
    try {
      const response = await fetch(`${API_BASE_URL}/occupancy/hourly`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching hourly occupancy:', error);
      throw error;
    }
  }

  async getZoneUtilization() {
    try {
      const response = await fetch(`${API_BASE_URL}/occupancy/zone-utilization`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching zone utilization:', error);
      throw error;
    }
  }

  // Zone Control APIs
  async getZoneRooms() {
    try {
      const response = await fetch(`${API_BASE_URL}/zone-control/rooms`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching zone rooms:', error);
      throw error;
    }
  }

  async getDeviceStates() {
    try {
      const response = await fetch(`${API_BASE_URL}/zone-control/devices`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching device states:', error);
      throw error;
    }
  }

  async updateDeviceState(roomId, zoneId, deviceType, state) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/zone-control/rooms/${roomId}/zones/${zoneId}/devices/${deviceType}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(state),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error updating device state:', error);
      throw error;
    }
  }

  // Energy Analytics APIs
  async getWeeklyEnergyData() {
    try {
      const response = await fetch(`${API_BASE_URL}/energy-analytics/weekly`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching weekly energy data:', error);
      throw error;
    }
  }

  async getMonthlyEnergyData() {
    try {
      const response = await fetch(`${API_BASE_URL}/energy-analytics/monthly`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching monthly energy data:', error);
      throw error;
    }
  }

  async getDeviceBreakdown() {
    try {
      const response = await fetch(`${API_BASE_URL}/energy-analytics/device-breakdown`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching device breakdown:', error);
      throw error;
    }
  }

  async getRoomComparison() {
    try {
      const response = await fetch(`${API_BASE_URL}/energy-analytics/room-comparison`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching room comparison:', error);
      throw error;
    }
  }

  async getHourlyPattern() {
    try {
      const response = await fetch(`${API_BASE_URL}/energy-analytics/hourly-pattern`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching hourly pattern:', error);
      throw error;
    }
  }

  // Device Control APIs
  async getAllDevices() {
    try {
      const response = await fetch(`${API_BASE_URL}/device-control/devices`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching all devices:', error);
      throw error;
    }
  }

  async getRoomDevices(roomId) {
    try {
      const response = await fetch(`${API_BASE_URL}/device-control/room/${roomId}`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching room devices:', error);
      throw error;
    }
  }

  async controlDevice(roomId, deviceType, action) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/device-control/room/${roomId}/device/${deviceType}/${action}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error controlling device:', error);
      throw error;
    }
  }

  async setDeviceSchedule(roomId, deviceType, schedule) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/device-control/room/${roomId}/device/${deviceType}/schedule`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(schedule),
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error setting device schedule:', error);
      throw error;
    }
  }

  // Smart Detection APIs
  async getDetectionStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-detection/status`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching detection status:', error);
      throw error;
    }
  }

  async startDetection() {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-detection/start`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error starting detection:', error);
      throw error;
    }
  }

  async stopDetection() {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-detection/stop`, {
        method: 'POST',
      });
      return await response.json();
    } catch (error) {
      console.error('Error stopping detection:', error);
      throw error;
    }
  }

  async getRelayStatus() {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-detection/relay/status`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching relay status:', error);
      throw error;
    }
  }

  async getDetectionAnalytics() {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-detection/analytics`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching detection analytics:', error);
      throw error;
    }
  }

  async getSystemInfo() {
    try {
      const response = await fetch(`${API_BASE_URL}/smart-detection/system`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching system info:', error);
      throw error;
    }
  }

  // WebSocket connection for real-time monitoring
  connectWebSocket(onMessage) {
    const ws = new WebSocket('ws://localhost:8000/api/monitoring/realtime');
    
    ws.onopen = () => {
      console.log('WebSocket connected');
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };
    
    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    ws.onclose = () => {
      console.log('WebSocket disconnected');
    };
    
    return ws;
  }
}

export default new ApiService();