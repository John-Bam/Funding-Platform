// client/src/types/types.ts

export interface User {
  id?: string;
  user_id?: string;
  email: string;
  full_name: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  role: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  fullDescription?: string;
  impactStatement?: string;
  category: string;
  status: string;
  fundingGoal: number;
  currentFunding?: number;
  geoFocus?: string;
  sdgAlignment?: string[];
  durationMonths?: number;
  submittedDate: string;
  innovatorId?: string;
  innovator?: string;
  investorsCount?: number;
  minimumInvestment?: number;
  documents?: string[];
  teamMembers?: TeamMember[];
  updates?: ProjectUpdate[];
}

export interface TeamMember {
  name: string;
  role: string;
  bio?: string;
}

export interface ProjectUpdate {
  title: string;
  content: string;
  date: string;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  startDate?: string;
  targetCompletionDate: string;
  status: string;
  fundingRequired: number;
  projectId: string;
  project?: string;
}

export interface Investment {
  id: string;
  amount: number;
  investmentDate: string;
  projectId: string;
  project?: string;
  projectStatus?: string;
  projectFundingGoal?: number;
  projectCurrentFunding?: number;
  projectCategory?: string;
}

export interface Wallet {
  walletId: string;
  balance: number;
}

export interface Transaction {
  id: string;
  type: string;
  status: string;
  amount: number;
  notes?: string;
  date: string;
  paymentMethod?: string;
  proofOfPayment?: string;
  projectId?: string;
  project?: string;
}

export interface Message {
  id: string;
  from: string;
  fromId: string;
  subject: string;
  content: string;
  received: string;
  read: boolean;
  priority?: string;
}

export interface Notification {
  id: string;
  message: string;
  read: boolean;
  timestamp: string;
  type?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface InvestorProfile {
  investor_id: string;
  preferred_sdg?: string[];
  preferred_geo?: string[];
  investment_min?: number;
  investment_max?: number;
  investments: number;
  totalInvested: number;
  activeSyndicates: number;
}

export interface DashboardStats {
  // Innovator stats
  totalFunding?: number;
  activeProjects?: number;
  totalProjects?: number;
  completedMilestones?: number;
  
  // Investor stats
  totalInvested?: number;
  projectsInvested?: number;
  avgReturn?: number;
  
  // Admin stats
  totalUsers?: number;
  pendingApprovals?: number;
  escrowFunds?: number;
}