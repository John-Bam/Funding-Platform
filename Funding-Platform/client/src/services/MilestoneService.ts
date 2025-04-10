import axios from 'axios';

// Base API URL with fallback - matches the pattern in AuthContext.tsx
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

/**
 * Interface for milestone data that matches the existing structure in CreateProject.tsx
 */
export interface MilestoneData {
  title: string;
  description: string;
  expected_completion_date: string;
  funding_percentage: number;
  verification_method: string;
  status?: string;
  actual_completion_date?: string;
  milestone_id?: string;
}

/**
 * Fetch all milestones for a project
 */
export const getMilestones = async (projectId: string) => {
  try {
    const response = await axios.get(`${apiUrl}/api/projects/${projectId}/milestones`);
    return response.data;
  } catch (error) {
    console.error('Error fetching milestones:', error);
    throw error;
  }
};

/**
 * Update project milestones
 */
export const updateMilestones = async (projectId: string, milestones: MilestoneData[]) => {
  try {
    const response = await axios.put(`${apiUrl}/api/projects/${projectId}/milestones`, { milestones });
    return response.data;
  } catch (error) {
    console.error('Error updating milestones:', error);
    throw error;
  }
};

/**
 * Mark a milestone as completed with supporting documents
 */
export const completeMilestone = async (
  projectId: string, 
  milestoneId: string, 
  completionData: { notes: string },
  documents?: File[]
) => {
  try {
    const formData = new FormData();
    formData.append('notes', completionData.notes);
    
    if (documents && documents.length > 0) {
      documents.forEach(file => {
        formData.append('documents', file);
      });
    }
    
    const response = await axios.post(
      `${apiUrl}/api/projects/${projectId}/milestones/${milestoneId}/complete`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error completing milestone:', error);
    throw error;
  }
};

/**
 * Submit milestone for verification
 */
export const submitForVerification = async (projectId: string, milestoneId: string) => {
  try {
    const response = await axios.post(
      `${apiUrl}/api/projects/${projectId}/milestones/${milestoneId}/verify`
    );
    return response.data;
  } catch (error) {
    console.error('Error submitting milestone for verification:', error);
    throw error;
  }
};

/**
 * Get milestone documents
 */
export const getMilestoneDocuments = async (projectId: string, milestoneId: string) => {
  try {
    const response = await axios.get(
      `${apiUrl}/api/projects/${projectId}/milestones/${milestoneId}/documents`
    );
    return response.data;
  } catch (error) {
    console.error('Error getting milestone documents:', error);
    throw error;
  }
};

export default {
  getMilestones,
  updateMilestones,
  completeMilestone,
  submitForVerification,
  getMilestoneDocuments
};