// UserService.ts
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

// Get current user profile
export const getUserProfile = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/users/profile`);
    return response.data;
  } catch (error) {
    console.error('Error getting user profile:', error);
    throw error;
  }
};

// Update user profile
export const updateUserProfile = async (profileData: any) => {
  try {
    const response = await axios.put(`${apiUrl}/api/users/profile`, profileData);
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// Change user password
export const changePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await axios.put(`${apiUrl}/api/users/password`, {
      currentPassword,
      newPassword
    });
    return response.data;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};

// Get user statistics based on role
export const getUserStats = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/users/stats`);
    return response.data;
  } catch (error) {
    console.error('Error getting user stats:', error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (image: File) => {
  try {
    const formData = new FormData();
    formData.append('image', image);
    
    const response = await axios.post(`${apiUrl}/api/users/profile/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading profile image:', error);
    throw error;
  }
};