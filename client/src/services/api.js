import axios from 'axios';

const API_BASE_URL = '/api';

export const fetchLogs = async (timeRange = '24h') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logs`, {
      params: { timeRange }
    });
    return response.data.logs || [];
  } catch (error) {
    console.error('Error fetching logs:', error);
    return [];
  }
};

export const fetchStats = async (timeRange = '24h') => {
  try {
    const response = await axios.get(`${API_BASE_URL}/logs/stats`, {
      params: { timeRange }
    });
    return response.data.stats || {
      totalHits: 0,
      successRate: 0,
      failedRequests: 0,
      avgResponseTime: 0
    };
  } catch (error) {
    console.error('Error fetching stats:', error);
    return {
      totalHits: 0,
      successRate: 0,
      failedRequests: 0,
      avgResponseTime: 0
    };
  }
};

export const fetchAlerts = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/alerts`);
    return response.data.alerts || [];
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return [];
  }
};
