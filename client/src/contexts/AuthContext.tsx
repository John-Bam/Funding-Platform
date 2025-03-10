import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Define the User type from your system
type User = {
  user_id: string;
  email: string;
  full_name: string;
  role: 'Admin' | 'Innovator' | 'Investor' | 'EscrowManager';
  status: 'PendingApproval' | 'Verified' | 'Rejected' | 'Suspended';
};

// Define the context value type
type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  error: string | null;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  error: null,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Auth Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      
      // Get the token from localStorage
      const token = localStorage.getItem('token');
      
      if (token) {
        try {
          // Set the token in axios defaults
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          // Fetch user data
          const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users/me`);
          
          if (response.data) {
            setUser(response.data);
          }
        } catch (err) {
          // If there's an error, log the user out
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
        }
      }
      
      setIsLoading(false);
    };
    
    checkAuth();
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setError(null);
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, {
        email,
        password,
      });
      
      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      
      // Set the token in axios defaults
      axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
      
      // Set the user
      setUser(response.data.user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during login');
      throw err;
    }
  };

  // Register function
  const register = async (userData: any) => {
    setError(null);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, userData);
      // Note: We don't automatically log the user in after registration because they need to be approved
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred during registration');
      throw err;
    }
  };

  // Logout function
  const logout = () => {
    // Remove the token from localStorage
    localStorage.removeItem('token');
    
    // Remove the token from axios defaults
    delete axios.defaults.headers.common['Authorization'];
    
    // Clear the user
    setUser(null);
  };

  // The context value
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    error,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};