// NotificationService.ts
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// Get user notifications
export const getUserNotifications = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/notifications`);
    return response.data;
  } catch (error) {
    console.error('Error getting user notifications:', error);
    throw error;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await axios.put(`${apiUrl}/api/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await axios.put(`${apiUrl}/api/notifications/read-all`);
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (preferences: any) => {
  try {
    const response = await axios.put(`${apiUrl}/api/notifications/preferences`, preferences);
    return response.data;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};