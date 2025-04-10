// InvestmentService.ts
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// Get user investments
export const getUserInvestments = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/investments/user`);
    return response.data;
  } catch (error) {
    console.error('Error getting user investments:', error);
    throw error;
  }
};

// Get project investments
export const getProjectInvestments = async (projectId: string) => {
  try {
    const response = await axios.get(`${apiUrl}/api/investments/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting project investments:', error);
    throw error;
  }
};

// Make an investment
export const makeInvestment = async (projectId: string, amount: number, note?: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/investments`, {
      projectId,
      amount,
      note
    });
    return response.data;
  } catch (error) {
    console.error('Error making investment:', error);
    throw error;
  }
};

// Run investment simulation
export const simulateInvestment = async (projectId: string, amount: number) => {
  try {
    const response = await axios.post(`${apiUrl}/api/investments/simulate`, {
      projectId,
      amount
    });
    return response.data;
  } catch (error) {
    console.error('Error simulating investment:', error);
    throw error;
  }
};

// Create investor syndicate
export const createSyndicate = async (projectId: string, syndicateData: any) => {
  try {
    const response = await axios.post(`${apiUrl}/api/syndicates`, {
      projectId,
      ...syndicateData
    });
    return response.data;
  } catch (error) {
    console.error('Error creating syndicate:', error);
    throw error;
  }
};

// Join syndicate
export const joinSyndicate = async (syndicateId: string, amount: number) => {
  try {
    const response = await axios.post(`${apiUrl}/api/syndicates/${syndicateId}/join`, {
      amount
    });
    return response.data;
  } catch (error) {
    console.error('Error joining syndicate:', error);
    throw error;
  }
};