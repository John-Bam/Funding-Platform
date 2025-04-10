// EscrowService.ts
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// Get escrow accounts by project
export const getProjectEscrow = async (projectId: string) => {
  try {
    const response = await axios.get(`${apiUrl}/api/escrow/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting project escrow accounts:', error);
    throw error;
  }
};

// Get escrow accounts by milestone
export const getMilestoneEscrow = async (milestoneId: string) => {
  try {
    const response = await axios.get(`${apiUrl}/api/escrow/milestone/${milestoneId}`);
    return response.data;
  } catch (error) {
    console.error('Error getting milestone escrow account:', error);
    throw error;
  }
};

// Release funds from escrow
export const releaseFunds = async (escrowId: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/escrow/${escrowId}/release`);
    return response.data;
  } catch (error) {
    console.error('Error releasing escrow funds:', error);
    throw error;
  }
};

// Return funds from escrow
export const returnFunds = async (escrowId: string, reason: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/escrow/${escrowId}/return`, { reason });
    return response.data;
  } catch (error) {
    console.error('Error returning escrow funds:', error);
    throw error;
  }
};

// Partially release funds from escrow
export const partialRelease = async (escrowId: string, amount: number) => {
  try {
    const response = await axios.post(`${apiUrl}/api/escrow/${escrowId}/partial-release`, { amount });
    return response.data;
  } catch (error) {
    console.error('Error partially releasing escrow funds:', error);
    throw error;
  }
};

// Create escrow dispute
export const createDispute = async (escrowId: string, reason: string, description: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/escrow/${escrowId}/dispute`, {
      reason,
      description
    });
    return response.data;
  } catch (error) {
    console.error('Error creating escrow dispute:', error);
    throw error;
  }
};

// Resolve escrow dispute
export const resolveDispute = async (disputeId: string, resolution: string, action: string, amount?: number) => {
  try {
    const response = await axios.post(`${apiUrl}/api/escrow/disputes/${disputeId}/resolve`, {
      resolution,
      action,
      amount
    });
    return response.data;
  } catch (error) {
    console.error('Error resolving escrow dispute:', error);
    throw error;
  }
};