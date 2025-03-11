// client/src/services/api.ts
import axios, { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { 
  User, 
  Project, 
  Milestone, 
  Transaction, 
  Message, 
  ApiResponse, 
  Wallet, 
  Investment,
  InvestorProfile,
  DashboardStats
} from '../types/types';

// Create an axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to attach the auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Authentication services
export const authService = {
  login: async (email: string, password: string): Promise<ApiResponse<{token: string, user: User}>> => {
    const response = await api.post<ApiResponse<{token: string, user: User}>>('/auth/login', { email, password });
    return response.data;
  },
  register: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.post<ApiResponse<User>>('/auth/register', userData);
    return response.data;
  },
  logout: async (): Promise<ApiResponse<{success: boolean}>> => {
    localStorage.removeItem('token');
    return { success: true, data: { success: true } };
  },
  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
};

// User services
export const userService = {
  getUserProfile: async (): Promise<ApiResponse<User>> => {
    const response = await api.get<ApiResponse<User>>('/users/profile');
    return response.data;
  },
  updateUserProfile: async (userData: Partial<User>): Promise<ApiResponse<User>> => {
    const response = await api.put<ApiResponse<User>>('/users/profile', userData);
    return response.data;
  },
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<{success: boolean}>> => {
    const response = await api.post<ApiResponse<{success: boolean}>>('/users/change-password', {
      currentPassword,
      newPassword,
    });
    return response.data;
  },
  getUserStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/users/stats');
    return response.data;
  },
  getAdminStats: async (): Promise<ApiResponse<DashboardStats>> => {
    const response = await api.get<ApiResponse<DashboardStats>>('/admin/stats');
    return response.data;
  },
  getPlatformActivityData: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/admin/platform-activity');
    return response.data;
  },
};

// Project services
export const projectService = {
  getProjects: async (filters?: Record<string, any>): Promise<ApiResponse<Project[]>> => {
    const response = await api.get<ApiResponse<Project[]>>('/projects', { params: filters });
    return response.data;
  },
  getProjectById: async (projectId: string): Promise<ApiResponse<Project>> => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${projectId}`);
    return response.data;
  },
  createProject: async (projectData: Partial<Project>): Promise<ApiResponse<Project>> => {
    const response = await api.post<ApiResponse<Project>>('/projects', projectData);
    return response.data;
  },
  updateProject: async (projectId: string, projectData: Partial<Project>): Promise<ApiResponse<Project>> => {
    const response = await api.put<ApiResponse<Project>>(`/projects/${projectId}`, projectData);
    return response.data;
  },
  getProjectMilestones: async (projectId: string): Promise<ApiResponse<Milestone[]>> => {
    const response = await api.get<ApiResponse<Milestone[]>>(`/projects/${projectId}/milestones`);
    return response.data;
  },
  submitMilestone: async (projectId: string, milestoneId: string, verificationData: any): Promise<ApiResponse<Milestone>> => {
    const response = await api.post<ApiResponse<Milestone>>(`/projects/${projectId}/milestones/${milestoneId}/verify`, verificationData);
    return response.data;
  },
};

// Investor services
export const investorService = {
  getInvestorProfile: async (): Promise<ApiResponse<InvestorProfile>> => {
    const response = await api.get<ApiResponse<InvestorProfile>>('/investors/profile');
    return response.data;
  },
  getInvestments: async (): Promise<ApiResponse<Investment[]>> => {
    const response = await api.get<ApiResponse<Investment[]>>('/investors/investments');
    return response.data;
  },
  investInProject: async (projectId: string, amount: number): Promise<ApiResponse<Investment>> => {
    const response = await api.post<ApiResponse<Investment>>(`/investors/invest`, { projectId, amount });
    return response.data;
  },
  getSyndicates: async (): Promise<ApiResponse<any[]>> => {
    const response = await api.get<ApiResponse<any[]>>('/investors/syndicates');
    return response.data;
  },
};

// Wallet services
export const walletService = {
  getWalletBalance: async (): Promise<ApiResponse<Wallet>> => {
    const response = await api.get<ApiResponse<Wallet>>('/wallet/balance');
    return response.data;
  },
  getTransactions: async (): Promise<ApiResponse<Transaction[]>> => {
    const response = await api.get<ApiResponse<Transaction[]>>('/wallet/transactions');
    return response.data;
  },
  createDeposit: async (amount: number, paymentMethod: string): Promise<ApiResponse<Transaction>> => {
    const response = await api.post<ApiResponse<Transaction>>('/wallet/deposit', { amount, paymentMethod });
    return response.data;
  },
  uploadProofOfPayment: async (transactionId: string, file: File): Promise<ApiResponse<Transaction>> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await api.post<ApiResponse<Transaction>>(`/wallet/transactions/${transactionId}/proof`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
  getTransactionStats: async (): Promise<ApiResponse<{
    stats: any;
    recentActivity: Transaction[];
    monthlyData: any[];
  }>> => {
    const response = await api.get<ApiResponse<{
      stats: any;
      recentActivity: Transaction[];
      monthlyData: any[];
    }>>('/wallet/stats');
    return response.data;
  },
};

// Message services
export const messageService = {
  getMessages: async (): Promise<ApiResponse<Message[]>> => {
    const response = await api.get<ApiResponse<Message[]>>('/messages');
    return response.data;
  },
  sendMessage: async (recipientId: string, subject: string, content: string): Promise<ApiResponse<Message>> => {
    const response = await api.post<ApiResponse<Message>>('/messages', { recipientId, subject, content });
    return response.data;
  },
  markAsRead: async (messageId: string): Promise<ApiResponse<{success: boolean}>> => {
    const response = await api.put<ApiResponse<{success: boolean}>>(`/messages/${messageId}/read`);
    return response.data;
  },
};

// Notification services
export const notificationService = {
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    const response = await api.get<ApiResponse<Notification[]>>('/notifications');
    return response.data;
  },
  markAsRead: async (notificationId: string): Promise<ApiResponse<{success: boolean}>> => {
    const response = await api.put<ApiResponse<{success: boolean}>>(`/notifications/${notificationId}/read`);
    return response.data;
  },
};

export default api;