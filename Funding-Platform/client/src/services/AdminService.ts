// AdminService.ts
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// Approve/reject user registration
export const verifyUser = async (userId: string, approved: boolean, reason?: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/admin/users/${userId}/verify`, {
      approved,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying user:', error);
    throw error;
  }
};

// Approve/reject project
export const verifyProject = async (projectId: string, approved: boolean, reason?: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/admin/projects/${projectId}/verify`, {
      approved,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying project:', error);
    throw error;
  }
};

// Verify milestone completion
export const verifyMilestone = async (milestoneId: string, approved: boolean, reason?: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/admin/milestones/${milestoneId}/verify`, {
      approved,
      reason
    });
    return response.data;
  } catch (error) {
    console.error('Error verifying milestone:', error);
    throw error;
  }
};

// Get pending verifications (users, projects, milestones)
export const getPendingVerifications = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/admin/verifications/pending`);
    return response.data;
  } catch (error) {
    console.error('Error getting pending verifications:', error);
    throw error;
  }
};

// Get state transition history
export const getStateTransitions = async (entityType: string, entityId: string) => {
  try {
    const response = await axios.get(`${apiUrl}/api/admin/transitions`, {
      params: { entityType, entityId }
    });
    return response.data;
  } catch (error) {
    console.error('Error getting state transitions:', error);
    throw error;
  }
};

// Generate administrative reports
export const generateReport = async (reportType: string, dateRange: { start: string, end: string }) => {
  try {
    const response = await axios.get(`${apiUrl}/api/admin/reports/${reportType}`, {
      params: dateRange
    });
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error);
    throw error;
  }
};