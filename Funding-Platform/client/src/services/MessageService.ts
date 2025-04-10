// MessageService.ts
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// Get user messages
export const getUserMessages = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/messages`);
    return response.data;
  } catch (error) {
    console.error('Error getting user messages:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (recipientId: string, subject: string, content: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/messages`, {
      recipientId,
      subject,
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Reply to a message
export const replyToMessage = async (messageId: string, content: string) => {
  try {
    const response = await axios.post(`${apiUrl}/api/messages/${messageId}/reply`, {
      content
    });
    return response.data;
  } catch (error) {
    console.error('Error replying to message:', error);
    throw error;
  }
};

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  try {
    const response = await axios.put(`${apiUrl}/api/messages/${messageId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (messageId: string) => {
  try {
    const response = await axios.delete(`${apiUrl}/api/messages/${messageId}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};