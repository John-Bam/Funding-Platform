import axios from 'axios';

// Base API URL with fallback - matches the pattern in AuthContext.tsx
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

/**
 * Get dashboard statistics based on user role
 */
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/dashboard/stats`);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

/**
 * Get funding data for charts
 */
export const getFundingData = async (period?: string) => {
  try {
    const response = await axios.get(`${apiUrl}/api/dashboard/funding-data`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching funding data:', error);
    throw error;
  }
};

/**
 * Get project status distribution data
 */
export const getProjectStatusData = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/dashboard/project-status`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project status data:', error);
    throw error;
  }
};

/**
 * Get milestone data for charts
 */
export const getMilestoneData = async (period?: string) => {
  try {
    const response = await axios.get(`${apiUrl}/api/dashboard/milestone-data`, {
      params: { period }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching milestone data:', error);
    throw error;
  }
};

/**
 * Get recent projects
 */
export const getRecentProjects = async (limit: number = 5) => {
  try {
    const response = await axios.get(`${apiUrl}/api/dashboard/recent-projects`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent projects:', error);
    throw error;
  }
};

/**
 * Get upcoming milestones
 */
export const getUpcomingMilestones = async (limit: number = 5) => {
  try {
    const response = await axios.get(`${apiUrl}/api/dashboard/upcoming-milestones`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming milestones:', error);
    throw error;
  }
};

/**
 * Get recent messages
 */
export const getRecentMessages = async (limit: number = 5) => {
  try {
    const response = await axios.get(`${apiUrl}/api/dashboard/recent-messages`, {
      params: { limit }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    throw error;
  }
};

/**
 * Send a message reply
 */
export const sendMessageReply = async (messageId: string, content: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/messages/${messageId}/reply`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message reply:', error);
    throw error;
  }
};

export default {
  getDashboardStats,
  getFundingData,
  getProjectStatusData,
  getMilestoneData,
  getRecentProjects,
  getUpcomingMilestones,
  getRecentMessages,
  sendMessageReply
};