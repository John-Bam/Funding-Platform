import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  useTheme,
  styled,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Badge,
  LinearProgress,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  InputAdornment,
} from '@mui/material';
import {
  Person,
  Business,
  AttachMoney,
  More,
  CheckCircle,
  Cancel,
  MoreVert,
  Assignment,
  Visibility,
  Receipt,
  Message,
  Dashboard,
  BarChart,
  Settings,
  Refresh,
  Download,
  Search,
  FilterList,
  AccountBalanceWallet,
  NotificationsActive,
  SupervisorAccount,
  People,
  CalendarToday,
  Add,
  Edit,
  Delete,
  Flag,
  Warning,
  Info,
  Security,
  VpnKey,
  SendTimeExtension,
  History,
  Assessment,
} from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import TransactionVerificationPanel from '../components/admin/TransactionVerificationPanel';

// Styled components
const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    right: -3,
    top: 3,
    border: `2px solid ${theme.palette.background.paper}`,
    padding: '0 4px',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ pt: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

// User interface
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  registeredDate: string;
  documents: string[];
  status?: string;
}

// Project interface
interface Project {
  id: string;
  title: string;
  innovator: string;
  submittedDate: string;
  category: string;
  fundingGoal: number;
  status?: string;
}

// Milestone interface
interface Milestone {
  id: string;
  project: string;
  innovator: string;
  description: string;
  submittedDate: string;
  fundingRequired: number;
  status?: string;
}

// Escrow interface
interface Escrow {
  id: string;
  project: string;
  milestone: string;
  amount: number;
  requestDate: string;
  status?: string;
}

// Message interface
interface Message {
  id: string;
  from: string;
  fromId: string;
  subject: string;
  content: string;
  received: string;
  priority: 'low' | 'medium' | 'high';
  replied?: boolean;
}

// System health interface
interface SystemHealth {
  status: 'healthy' | 'warning' | 'error';
  uptime: string;
  databaseConnections: number;
  activeUsers: number;
  cpuUsage: number;
  memoryUsage: number;
  lastBackup: string;
}
// Sample data for the admin panel
const pendingUsers: User[] = [
    {
      id: 'user_001',
      name: 'Emma Johnson',
      email: 'emma@example.com',
      role: 'Innovator',
      registeredDate: '2025-03-01',
      documents: ['id_proof.pdf', 'address_proof.pdf'],
    },
    {
      id: 'user_002',
      name: 'Michael Brown',
      email: 'michael@example.com',
      role: 'Investor',
      registeredDate: '2025-03-05',
      documents: ['id_proof.pdf', 'investment_history.pdf'],
    },
    {
      id: 'user_003',
      name: 'Sophia Williams',
      email: 'sophia@example.com',
      role: 'Innovator',
      registeredDate: '2025-03-08',
      documents: ['id_proof.pdf', 'project_history.pdf'],
    },
    {
      id: 'user_004',
      name: 'James Wilson',
      email: 'james@example.com',
      role: 'Investor',
      registeredDate: '2025-03-09',
      documents: ['id_proof.pdf', 'financial_statement.pdf', 'passport.pdf'],
    },
    {
      id: 'user_005',
      name: 'Olivia Taylor',
      email: 'olivia@example.com',
      role: 'Innovator',
      registeredDate: '2025-03-10',
      documents: ['id_proof.pdf', 'business_plan.pdf'],
    },
  ];
  
  const pendingProjects: Project[] = [
    {
      id: 'proj_001',
      title: 'Smart Agriculture System',
      innovator: 'John Doe',
      submittedDate: '2025-03-02',
      category: 'AgriTech',
      fundingGoal: 50000,
    },
    {
      id: 'proj_002',
      title: 'Clean Water Initiative',
      innovator: 'Sarah Johnson',
      submittedDate: '2025-03-07',
      category: 'CleanTech',
      fundingGoal: 75000,
    },
    {
      id: 'proj_003',
      title: 'Solar Micro-Grids',
      innovator: 'Michael Chen',
      submittedDate: '2025-03-08',
      category: 'Energy',
      fundingGoal: 120000,
    },
    {
      id: 'proj_004',
      title: 'Healthcare AI Diagnostics',
      innovator: 'Emily Rodriguez',
      submittedDate: '2025-03-10',
      category: 'HealthTech',
      fundingGoal: 200000,
    },
  ];
  
  const pendingMilestones: Milestone[] = [
    {
      id: 'mile_001',
      project: 'Smart Agriculture System',
      innovator: 'John Doe',
      description: 'Develop prototype',
      submittedDate: '2025-03-09',
      fundingRequired: 10000,
    },
    {
      id: 'mile_002',
      project: 'Clean Water Initiative',
      innovator: 'Sarah Johnson',
      description: 'Field testing phase',
      submittedDate: '2025-03-10',
      fundingRequired: 15000,
    },
    {
      id: 'mile_003',
      project: 'Solar Micro-Grids',
      innovator: 'Michael Chen',
      description: 'First production batch',
      submittedDate: '2025-03-10',
      fundingRequired: 30000,
    },
    {
      id: 'mile_004',
      project: 'Healthcare AI Diagnostics',
      innovator: 'Emily Rodriguez',
      description: 'Algorithm validation with clinical data',
      submittedDate: '2025-03-12',
      fundingRequired: 45000,
    },
  ];
  
  const pendingEscrow: Escrow[] = [
    {
      id: 'escrow_001',
      project: 'Smart Agriculture System',
      milestone: 'Develop prototype',
      amount: 10000,
      requestDate: '2025-03-09',
    },
    {
      id: 'escrow_002',
      project: 'Clean Water Initiative',
      milestone: 'Field testing phase',
      amount: 15000,
      requestDate: '2025-03-10',
    },
    {
      id: 'escrow_003',
      project: 'Solar Micro-Grids',
      milestone: 'First production batch',
      amount: 30000,
      requestDate: '2025-03-10',
    },
  ];
  
  // Mock messages that need admin attention
  const pendingMessages: Message[] = [
    {
      id: 'msg_001',
      from: 'John Doe',
      fromId: 'user_005',
      subject: 'Question about milestone verification',
      content: 'I submitted my milestone proof but haven\'t heard back for over a week. Can you please check the status?',
      received: '2025-03-08',
      priority: 'high',
    },
    {
      id: 'msg_002',
      from: 'Michael Brown',
      fromId: 'user_003',
      subject: 'Issue with payment verification',
      content: 'My bank transfer was completed 3 days ago but my wallet still shows as pending. Reference number: BTR-82930.',
      received: '2025-03-09',
      priority: 'medium',
    },
    {
      id: 'msg_003',
      from: 'Emily Chen',
      fromId: 'user_004',
      subject: 'Request for project deadline extension',
      content: 'Due to unexpected supply chain issues, we need to request a two-week extension on our current milestone.',
      received: '2025-03-10',
      priority: 'low',
    },
    {
      id: 'msg_004',
      from: 'Sarah Johnson',
      fromId: 'user_002',
      subject: 'Problem with project documentation',
      content: 'I\'m having trouble uploading additional documentation for my milestone verification. The system keeps timing out when I try to upload files larger than 10MB.',
      received: '2025-03-11',
      priority: 'medium',
    },
    {
      id: 'msg_005',
      from: 'Robert Miller',
      fromId: 'user_007',
      subject: 'Inquiry about rejected application',
      content: 'My account application was rejected yesterday but I wasn\'t given a specific reason. Could you please explain why it was rejected and what I need to do to get approved?',
      received: '2025-03-12',
      priority: 'high',
    },
  ];
  
  // Sample system health data
  const mockSystemHealth: SystemHealth = {
    status: 'healthy',
    uptime: '23 days, 7 hours',
    databaseConnections: 15,
    activeUsers: 42,
    cpuUsage: 32,
    memoryUsage: 45,
    lastBackup: '2025-03-09T02:30:00Z',
  };
  
  // Sample dashboard statistics
  const mockDashboardStats = {
    totalUsers: 124,
    activeProjects: 32,
    pendingApprovals: 18,
    escrowFunds: 825000,
    recentActivity: [
      {
        id: 'act_001',
        type: 'user_registration',
        user: 'Emma Johnson',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      },
      {
        id: 'act_002',
        type: 'project_submission',
        project: 'Solar Micro-Grids',
        user: 'Michael Chen',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      },
      {
        id: 'act_003',
        type: 'escrow_release',
        project: 'Clean Water Initiative',
        amount: 25000,
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 'act_004',
        type: 'milestone_verification',
        project: 'Healthcare AI Diagnostics',
        milestone: 'Data collection phase',
        timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
      {
        id: 'act_005',
        type: 'user_verification',
        user: 'Robert Miller',
        status: 'rejected',
        timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
      },
    ],
    projectBreakdown: {
      agriTech: 8,
      cleanTech: 12,
      energy: 7,
      healthTech: 5,
      edTech: 6,
      finTech: 3,
      other: 4,
    },
    userRoles: {
      innovators: 62,
      investors: 47,
      admins: 5,
      escrowManagers: 10,
    },
  };
  // Sample data for the admin panel
const pendingUsers: User[] = [
    {
      id: 'user_001',
      name: 'Emma Johnson',
      email: 'emma@example.com',
      role: 'Innovator',
      registeredDate: '2025-03-01',
      documents: ['id_proof.pdf', 'address_proof.pdf'],
    },
    {
      id: 'user_002',
      name: 'Michael Brown',
      email: 'michael@example.com',
      role: 'Investor',
      registeredDate: '2025-03-05',
      documents: ['id_proof.pdf', 'investment_history.pdf'],
    },
    {
      id: 'user_003',
      name: 'Sophia Williams',
      email: 'sophia@example.com',
      role: 'Innovator',
      registeredDate: '2025-03-08',
      documents: ['id_proof.pdf', 'project_history.pdf'],
    },
    {
      id: 'user_004',
      name: 'James Wilson',
      email: 'james@example.com',
      role: 'Investor',
      registeredDate: '2025-03-09',
      documents: ['id_proof.pdf', 'financial_statement.pdf', 'passport.pdf'],
    },
    {
      id: 'user_005',
      name: 'Olivia Taylor',
      email: 'olivia@example.com',
      role: 'Innovator',
      registeredDate: '2025-03-10',
      documents: ['id_proof.pdf', 'business_plan.pdf'],
    },
  ];
  
  const pendingProjects: Project[] = [
    {
      id: 'proj_001',
      title: 'Smart Agriculture System',
      innovator: 'John Doe',
      submittedDate: '2025-03-02',
      category: 'AgriTech',
      fundingGoal: 50000,
    },
    {
      id: 'proj_002',
      title: 'Clean Water Initiative',
      innovator: 'Sarah Johnson',
      submittedDate: '2025-03-07',
      category: 'CleanTech',
      fundingGoal: 75000,
    },
    {
      id: 'proj_003',
      title: 'Solar Micro-Grids',
      innovator: 'Michael Chen',
      submittedDate: '2025-03-08',
      category: 'Energy',
      fundingGoal: 120000,
    },
    {
      id: 'proj_004',
      title: 'Healthcare AI Diagnostics',
      innovator: 'Emily Rodriguez',
      submittedDate: '2025-03-10',
      category: 'HealthTech',
      fundingGoal: 200000,
    },
  ];
  
  const pendingMilestones: Milestone[] = [
    {
      id: 'mile_001',
      project: 'Smart Agriculture System',
      innovator: 'John Doe',
      description: 'Develop prototype',
      submittedDate: '2025-03-09',
      fundingRequired: 10000,
    },
    {
      id: 'mile_002',
      project: 'Clean Water Initiative',
      innovator: 'Sarah Johnson',
      description: 'Field testing phase',
      submittedDate: '2025-03-10',
      fundingRequired: 15000,
    },
    {
      id: 'mile_003',
      project: 'Solar Micro-Grids',
      innovator: 'Michael Chen',
      description: 'Setup manufacturing facilities',
      submittedDate: '2025-03-11',
      fundingRequired: 30000,
    },
    {
      id: 'mile_004',
      project: 'Healthcare AI Diagnostics',
      innovator: 'Emily Rodriguez',
      description: 'Data validation and algorithm training',
      submittedDate: '2025-03-12',
      fundingRequired: 45000,
    },
  ];
  
  const pendingEscrow: Escrow[] = [
    {
      id: 'escrow_001',
      project: 'Smart Agriculture System',
      milestone: 'Develop prototype',
      amount: 10000,
      requestDate: '2025-03-09',
    },
    {
      id: 'escrow_002',
      project: 'Clean Water Initiative',
      milestone: 'Field testing phase',
      amount: 15000,
      requestDate: '2025-03-10',
    },
    {
      id: 'escrow_003',
      project: 'Solar Micro-Grids',
      milestone: 'Setup manufacturing facilities',
      amount: 30000,
      requestDate: '2025-03-11',
    },
    {
      id: 'escrow_004',
      project: 'Healthcare AI Diagnostics',
      milestone: 'Data validation and algorithm training',
      amount: 45000,
      requestDate: '2025-03-12',
    },
  ];
  
  // Mock messages that need admin attention
  const pendingMessages: Message[] = [
    {
      id: 'msg_001',
      from: 'John Doe',
      fromId: 'user_005',
      subject: 'Question about milestone verification',
      content: 'I submitted my milestone proof but haven\'t heard back for over a week. Can you please check the status?',
      received: '2025-03-08',
      priority: 'high',
    },
    {
      id: 'msg_002',
      from: 'Michael Brown',
      fromId: 'user_003',
      subject: 'Issue with payment verification',
      content: 'My bank transfer was completed 3 days ago but my wallet still shows as pending. Reference number: BTR-82930.',
      received: '2025-03-09',
      priority: 'medium',
    },
    {
      id: 'msg_003',
      from: 'Emily Chen',
      fromId: 'user_004',
      subject: 'Request for project deadline extension',
      content: 'Due to unexpected supply chain issues, we need to request a two-week extension on our current milestone.',
      received: '2025-03-10',
      priority: 'low',
    },
    {
      id: 'msg_004',
      from: 'Sarah Johnson',
      fromId: 'user_006',
      subject: 'Urgent: Payment issue needs resolution',
      content: 'There seems to be a discrepancy in my last milestone payment. The funds were released but only partially reflected in my wallet. Please help resolve this as soon as possible.',
      received: '2025-03-11',
      priority: 'high',
    },
    {
      id: 'msg_005',
      from: 'Robert Wilson',
      fromId: 'user_007',
      subject: 'Question about investor syndicate formation',
      content: 'I\'m trying to form an investor syndicate but having trouble with the voting threshold configuration. Could you provide some guidance on the best practices?',
      received: '2025-03-12',
      priority: 'medium',
    },
  ];
  
  // Mock system health data
  const mockSystemHealth: SystemHealth = {
    status: 'healthy',
    uptime: '23 days, 5 hours',
    databaseConnections: 15,
    activeUsers: 42,
    cpuUsage: 32,
    memoryUsage: 45,
    lastBackup: '2025-03-09T03:00:00Z',
  };
  
  // Mock dashboard stats
  const mockDashboardStats = {
    totalUsers: 124,
    activeProjects: 32,
    pendingApprovals: 18,
    escrowFunds: 825000,
    recentActivity: [
      {
        id: 'act_001',
        type: 'user_registration',
        user: 'Emma Johnson',
        timestamp: new Date().toISOString(),
      },
      {
        id: 'act_002',
        type: 'project_submission',
        project: 'Solar Micro-Grids',
        user: 'Michael Brown',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'act_003',
        type: 'escrow_release',
        project: 'Clean Water Initiative',
        amount: 25000,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'act_004',
        type: 'milestone_approved',
        project: 'Smart Agriculture System',
        milestone: 'Prototype Development',
        timestamp: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: 'act_005',
        type: 'investment',
        project: 'Healthcare AI Diagnostics',
        amount: 50000,
        investor: 'Robert Miller',
        timestamp: new Date(Date.now() - 14400000).toISOString(),
      },
    ],
  };
  const AdminPanel: React.FC = () => {
    const theme = useTheme();
    const { user } = useAuth();
    
    // State for selected tab
    const [tabValue, setTabValue] = useState(0);
    
    // State for action dialogs
    const [actionDialogOpen, setActionDialogOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
    
    // State for message dialogs
    const [messageDialogOpen, setMessageDialogOpen] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [replyDialogOpen, setReplyDialogOpen] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    
    // State for reason input
    const [rejectionReason, setRejectionReason] = useState('');
    
    // Menu state
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [currentMenuItemId, setCurrentMenuItemId] = useState<string | null>(null);
    
    // Local state for data management
    const [users, setUsers] = useState(pendingUsers);
    const [projects, setProjects] = useState(pendingProjects);
    const [milestones, setMilestones] = useState(pendingMilestones);
    const [escrows, setEscrows] = useState(pendingEscrow);
    const [messages, setMessages] = useState(pendingMessages);
    
    // State for enhanced functionality
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: '',
      severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    });
    
    // State for dashboard
    const [dashboardStats, setDashboardStats] = useState(mockDashboardStats);
    const [systemHealth, setSystemHealth] = useState<SystemHealth>(mockSystemHealth);
    
    // State for report generation
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportType, setReportType] = useState<'users' | 'projects' | 'transactions'>('users');
    const [reportDateRange, setReportDateRange] = useState({
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      end: new Date(),
    });
    
    // State for filtering and document preview
    const [roleFilter, setRoleFilter] = useState<string | null>(null);
    const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
    const [statusFilter, setStatusFilter] = useState<string | null>(null);
    const [priorityFilter, setPriorityFilter] = useState<string | null>(null);
    const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
    const [documentName, setDocumentName] = useState('');
    
    // Load data on component mount
    useEffect(() => {
      fetchDashboardStats();
      fetchSystemHealth();
    }, []);
    
    // Fetch dashboard stats
    const fetchDashboardStats = async () => {
      setLoading(true);
      try {
        // In real app, this would be an API call
        // For now, just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDashboardStats(mockDashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        showSnackbar('Failed to fetch dashboard statistics', 'error');
      } finally {
        setLoading(false);
      }
    };
    
    // Fetch system health
    const fetchSystemHealth = async () => {
      try {
        // In real app, this would be an API call
        // For now, just simulate a delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setSystemHealth(mockSystemHealth);
      } catch (error) {
        console.error('Error fetching system health:', error);
      }
    };
    // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Menu open handler
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setCurrentMenuItemId(itemId);
  };
  
  // Menu close handler
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setCurrentMenuItemId(null);
  };
  
  // Open action dialog
  const handleActionDialogOpen = (item: any, action: 'approve' | 'reject') => {
    setSelectedItem(item);
    setActionType(action);
    setActionDialogOpen(true);
    setRejectionReason(''); // Reset rejection reason
    handleMenuClose();
  };
  
  // Close action dialog
  const handleActionDialogClose = () => {
    setActionDialogOpen(false);
    setSelectedItem(null);
  };
  
  // Handle action (approve/reject)
  const handleAction = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    
    try {
      let success = false;
      const itemId = selectedItem.id;
      
      if (actionType === 'approve') {
        // Determine the type of item and call appropriate method
        if (itemId.startsWith('user_')) {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          success = true;
          setUsers(users.filter(u => u.id !== itemId));
          showSnackbar(`User ${selectedItem.name} has been approved`);
        } else if (itemId.startsWith('proj_')) {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          success = true;
          setProjects(projects.filter(p => p.id !== itemId));
          showSnackbar(`Project ${selectedItem.title} has been approved`);
        } else if (itemId.startsWith('mile_')) {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          success = true;
          setMilestones(milestones.filter(m => m.id !== itemId));
          showSnackbar(`Milestone ${selectedItem.description} has been verified`);
        } else if (itemId.startsWith('escrow_')) {
          // Simulate API call
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          success = true;
          setEscrows(escrows.filter(e => e.id !== itemId));
          showSnackbar(`Escrow funds for ${selectedItem.milestone} have been released`);
        }
      } else {
        // Handle rejection with reason
        if (!rejectionReason.trim()) {
          showSnackbar('Rejection reason is required', 'error');
          setLoading(false);
          return;
        }
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (itemId.startsWith('user_')) {
          success = true;
          setUsers(users.filter(u => u.id !== itemId));
          showSnackbar(`User ${selectedItem.name} has been rejected`);
        } else if (itemId.startsWith('proj_')) {
          success = true;
          setProjects(projects.filter(p => p.id !== itemId));
          showSnackbar(`Project ${selectedItem.title} has been rejected`);
        } else if (itemId.startsWith('mile_')) {
          success = true;
          setMilestones(milestones.filter(m => m.id !== itemId));
          showSnackbar(`Milestone ${selectedItem.description} has been rejected`);
        }
      }
      
      if (!success) {
        showSnackbar('Action failed to complete', 'error');
      }
    } catch (error) {
      console.error('Error performing action:', error);
      showSnackbar('An error occurred', 'error');
    } finally {
      setLoading(false);
      handleActionDialogClose();
    }
  };
  
  // Handle message selection
  const handleMessageOpen = (message: Message) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
  };
  
  // Handle message dialog close
  const handleMessageClose = () => {
    setMessageDialogOpen(false);
    setSelectedMessage(null);
  };
  
  // Handle reply dialog open
  const handleReplyOpen = () => {
    if (!selectedMessage) return;
    setMessageDialogOpen(false);
    setReplyDialogOpen(true);
  };
  
  // Handle reply dialog close
  const handleReplyClose = () => {
    setReplyDialogOpen(false);
    setReplyContent('');
  };
  
  // Handle sending reply
  const handleSendReply = async () => {
    if (!selectedMessage || !replyContent.trim()) return;
    
    setLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mark message as replied in the UI
      const updatedMessages = messages.map(msg => 
        msg.id === selectedMessage.id 
          ? { ...msg, replied: true } 
          : msg
      );
      setMessages(updatedMessages);
      
      showSnackbar(`Reply sent to ${selectedMessage.from}`);
    } catch (error) {
      console.error('Error sending reply:', error);
      showSnackbar('An error occurred', 'error');
    } finally {
      setLoading(false);
      setReplyDialogOpen(false);
      setReplyContent('');
      setSelectedMessage(null);
    }
  };
  
  // Handle report generation
  const handleGenerateReport = () => {
    // In a real app, this would generate a downloadable file
    console.log('Generating report:', reportType, reportDateRange);
    
    // Show success message
    showSnackbar(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report generated successfully`);
    
    setReportDialogOpen(false);
  };
  
  // Helper to show snackbar messages
  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };
  
  // Handle document preview
  const handleDocumentPreview = (documentName: string) => {
    setDocumentName(documentName);
    setDocumentPreviewOpen(true);
  };
  
  // Handle filtering
  const handleFilterOpen = (event: React.MouseEvent<HTMLElement>) => {
    setFilterMenuAnchorEl(event.currentTarget);
  };
  
  const handleFilterClose = () => {
    setFilterMenuAnchorEl(null);
  };
  
  const handleSetFilter = (filterCategory: string, filterValue: string | null) => {
    switch (filterCategory) {
      case 'role':
        setRoleFilter(filterValue);
        break;
      case 'category':
        setCategoryFilter(filterValue);
        break;
      case 'status':
        setStatusFilter(filterValue);
        break;
      case 'priority':
        setPriorityFilter(filterValue);
        break;
    }
    
    handleFilterClose();
  };
  
  const handleClearFilters = () => {
    setRoleFilter(null);
    setCategoryFilter(null);
    setStatusFilter(null);
    setPriorityFilter(null);
    setSearchQuery('');
    handleFilterClose();
  };
  
  // Format date consistently
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  // Helper function to get color for activity type
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return theme.palette.primary.main;
      case 'project_submission':
        return theme.palette.secondary.main;
      case 'escrow_release':
        return theme.palette.success.main;
      case 'milestone_approved':
        return theme.palette.info.main;
      case 'investment':
        return theme.palette.warning.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  // Helper function to get icon for activity type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <Person />;
      case 'project_submission':
        return <Business />;
      case 'escrow_release':
        return <AttachMoney />;
      case 'milestone_approved':
        return <CheckCircle />;
      case 'investment':
        return <AttachMoney />;
      default:
        return <Receipt />;
    }
  };
  
  // Helper function to get description for activity
  const getActivityDescription = (activity: any) => {
    switch (activity.type) {
      case 'user_registration':
        return `${activity.user} registered as a new user`;
      case 'project_submission':
        return `${activity.user} submitted a new project: ${activity.project}`;
      case 'escrow_release':
        return `${activity.amount.toLocaleString()} released for ${activity.project}`;
      case 'milestone_approved':
        return `Milestone "${activity.milestone}" approved for ${activity.project}`;
      case 'investment':
        return `${activity.investor} invested ${activity.amount.toLocaleString()} in ${activity.project}`;
      default:
        return 'Unknown activity';
    }
  };
  
  // Render the Dashboard tab
  const renderDashboardTab = () => {
    if (loading && !dashboardStats) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">System Overview</Typography>
            <Button 
              startIcon={<Refresh />} 
              variant="outlined" 
              onClick={() => {
                fetchDashboardStats();
                fetchSystemHealth();
              }}
            >
              Refresh
            </Button>
          </Box>
          
          {systemHealth && (
            <Paper sx={{ p: 3, mb: 3, bgcolor: systemHealth.status === 'healthy' ? 'rgba(76, 175, 80, 0.08)' : 'rgba(244, 67, 54, 0.08)' }}>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    System Status: {systemHealth.status === 'healthy' ? 'Healthy' : 'Issues Detected'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Uptime: {systemHealth.uptime} | Active Users: {systemHealth.activeUsers} | Last Backup: {new Date(systemHealth.lastBackup).toLocaleString()}
                  </Typography>
                </Box>
                <Chip 
                  label={systemHealth.status === 'healthy' ? 'Operational' : 'Attention Required'} 
                  color={systemHealth.status === 'healthy' ? 'success' : 'error'} 
                />
              </Box>
            </Paper>
          )}
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'rgba(33, 150, 243, 0.08)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {dashboardStats?.totalUsers || '...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Users
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'rgba(76, 175, 80, 0.08)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {dashboardStats?.activeProjects || '...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Projects
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'rgba(255, 152, 0, 0.08)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {dashboardStats?.pendingApprovals || '...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Pending Approvals
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ bgcolor: 'rgba(156, 39, 176, 0.08)' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    ${dashboardStats?.escrowFunds.toLocaleString() || '...'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Escrow Funds
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List>
            {dashboardStats?.recentActivity?.map((activity: any) => (
              <ListItem 
                key={activity.id}
                sx={{ 
                  mb: 1, 
                  bgcolor: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: 1 
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: getActivityColor(activity.type) }}>
                    {getActivityIcon(activity.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={getActivityDescription(activity)}
                  secondary={new Date(activity.timestamp).toLocaleString()}
                />
              </ListItem>
            ))}
          </List>
        </Grid>
        
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Reports</Typography>
            <Button 
              variant="outlined" 
              startIcon={<Download />}
              onClick={() => setReportDialogOpen(true)}
            >
              Generate Report
            </Button>
          </Box>
          <Paper sx={{ p: 3 }}>
            <List>
              <ListItem>
                <ListItemText 
                  primary="User Registration Report"
                  secondary="Summary of new user registrations, verifications, and rejections"
                />
                <Button variant="outlined" size="small" startIcon={<Download />}>
                  Generate
                </Button>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Project Performance Report"
                  secondary="Analysis of project funding, milestone completions, and success rates"
                />
                <Button variant="outlined" size="small" startIcon={<Download />}>
                  Generate
                </Button>
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Financial Transactions Report"
                  secondary="Summary of deposits, investments, and escrow releases"
                />
                <Button variant="outlined" size="small" startIcon={<Download />}>
                  Generate
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Security Overview
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <Security color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle1">Authentication</Typography>
                    <Typography variant="body2" color="success.main">Secure</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <VpnKey color="success" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle1">Authorization</Typography>
                    <Typography variant="body2" color="success.main">Secure</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <SendTimeExtension color="warning" sx={{ mr: 2, fontSize: 40 }} />
                  <Box>
                    <Typography variant="subtitle1">API Rate Limiting</Typography>
                    <Typography variant="body2" color="warning.main">Warning: High Traffic</Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Last security scan completed on {new Date(Date.now() - 86400000).toLocaleDateString()}. No critical vulnerabilities detected.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  // Render User Verification Tab
  const renderUserVerificationTab = () => {
    // Apply filtering
    let filteredUsers = users;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredUsers = filteredUsers.filter(
        u => 
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query)
      );
    }
    
    if (roleFilter) {
      filteredUsers = filteredUsers.filter(u => u.role === roleFilter);
    }
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleFilterOpen}
              size="small"
            >
              Filters {roleFilter ? '(Active)' : ''}
            </Button>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Refresh
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredUsers.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No users found matching your criteria
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredUsers.map((user) => (
              <ListItem
                key={user.id}
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <Person />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="medium">
                      {user.name}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Chip
                          label={user.role}
                          size="small"
                          color="primary"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" color="text.secondary">
                          Registered: {formatDate(user.registeredDate)}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Documents: {user.documents.join(', ')}
                      </Typography>
                    </>
                  }
                />
                <Box>
                  <Button
                    variant="contained"
                    color="success"
                    size="small"
                    startIcon={<CheckCircle />}
                    sx={{ mr: 1 }}
                    onClick={() => handleActionDialogOpen(user, 'approve')}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() => handleActionDialogOpen(user, 'reject')}
                  >
                    Reject
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </>
    );
  };
  
  // Render Project Approval Tab
  const renderProjectApprovalTab = () => {
    // Apply filtering
    let filteredProjects = projects;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredProjects = filteredProjects.filter(
        p => 
          p.title.toLowerCase().includes(query) ||
          p.innovator.toLowerCase().includes(query)
      );
    }
    
    if (categoryFilter) {
      filteredProjects = filteredProjects.filter(p => p.category === categoryFilter);
    }
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleFilterOpen}
              size="small"
            >
              Filters {categoryFilter ? '(Active)' : ''}
            </Button>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Refresh
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredProjects.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No projects found matching your criteria
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredProjects.map((project) => (
              <Grid item xs={12} md={6} key={project.id}>
                <Card sx={{ height: '100%', position: 'relative' }}>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" gutterBottom>
                        {project.title}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, project.id)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Innovator
                        </Typography>
                        <Typography variant="body1">
                          {project.innovator}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Category
                        </Typography>
                        <Typography variant="body1">
                          {project.category}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Submitted
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(project.submittedDate)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Funding Goal
                        </Typography>
                        <Typography variant="body1">
                          ${project.fundingGoal.toLocaleString()}
                        </Typography>
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        color="primary"
                        startIcon={<Visibility />}
                        size="small"
                        sx={{ flexGrow: 1 }}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<CheckCircle />}
                        size="small"
                        sx={{ flexGrow: 1 }}
                        onClick={() => handleActionDialogOpen(project, 'approve')}
                      >
                        Approve
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </>
    );
  };
  // Render Milestone Verification Tab
  const renderMilestoneVerificationTab = () => {
    // Apply filtering
    let filteredMilestones = milestones;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredMilestones = filteredMilestones.filter(
        m => 
          m.project.toLowerCase().includes(query) ||
          m.innovator.toLowerCase().includes(query) ||
          m.description.toLowerCase().includes(query)
      );
    }
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <TextField
            placeholder="Search milestones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ width: 300 }}
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Refresh
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredMilestones.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No milestones found matching your criteria
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredMilestones.map((milestone) => (
              <ListItem
                key={milestone.id}
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                    <Assignment />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="medium">
                      {milestone.description}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" sx={{ color: theme.palette.primary.main }}>
                        {milestone.project}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Submitted by {milestone.innovator} on {formatDate(milestone.submittedDate)}
                        </Typography>
                      </Box>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ${milestone.fundingRequired.toLocaleString()}
                  </Typography>
                  <Box>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      startIcon={<CheckCircle />}
                      sx={{ mr: 1 }}
                      onClick={() => handleActionDialogOpen(milestone, 'approve')}
                    >
                      Verify
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => handleActionDialogOpen(milestone, 'reject')}
                    >
                      Reject
                    </Button>
                  </Box>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </>
    );
  };
  
  // Render Escrow Management Tab
  const renderEscrowManagementTab = () => {
    // Apply filtering
    let filteredEscrows = escrows;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredEscrows = filteredEscrows.filter(
        e => 
          e.project.toLowerCase().includes(query) ||
          e.milestone.toLowerCase().includes(query)
      );
    }
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <TextField
            placeholder="Search escrow requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
            }}
            sx={{ width: 300 }}
          />
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Refresh
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredEscrows.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No escrow requests found matching your criteria
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredEscrows.map((escrow) => (
              <ListItem
                key={escrow.id}
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.tertiary.main }}>
                    <AttachMoney />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Typography variant="subtitle1" fontWeight="medium">
                      {escrow.project}
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        Milestone: {escrow.milestone}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          Requested: {formatDate(escrow.requestDate)}
                        </Typography>
                      </Box>
                    </>
                  }
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                    ${escrow.amount.toLocaleString()}
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    startIcon={<AttachMoney />}
                    onClick={() => handleActionDialogOpen(escrow, 'approve')}
                  >
                    Release Funds
                  </Button>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </>
    );
  };
  // Render Messages Tab
  const renderMessagesTab = () => {
    // Apply filtering
    let filteredMessages = messages;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredMessages = filteredMessages.filter(
        m => 
          m.subject.toLowerCase().includes(query) ||
          m.from.toLowerCase().includes(query) ||
          m.content.toLowerCase().includes(query)
      );
    }
    
    if (priorityFilter) {
      filteredMessages = filteredMessages.filter(m => m.priority === priorityFilter);
    }
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              size="small"
              InputProps={{
                startAdornment: <Search sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<FilterList />}
              onClick={handleFilterOpen}
              size="small"
            >
              Filters {priorityFilter ? '(Active)' : ''}
            </Button>
          </Box>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={() => {
              setLoading(true);
              setTimeout(() => setLoading(false), 1000);
            }}
          >
            Refresh
          </Button>
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : filteredMessages.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No messages found matching your criteria
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredMessages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  mb: 2,
                  bgcolor: message.replied 
                    ? 'rgba(76, 175, 80, 0.05)'
                    : message.priority === 'high'
                    ? 'rgba(244, 67, 54, 0.05)'
                    : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  borderLeft: message.priority === 'high' 
                    ? `4px solid ${theme.palette.error.main}`
                    : message.priority === 'medium'
                    ? `4px solid ${theme.palette.warning.main}`
                    : 'none',
                  cursor: 'pointer',
                }}
                onClick={() => handleMessageOpen(message)}
              >
                <ListItemAvatar>
                  <Avatar sx={{ 
                    bgcolor: message.priority === 'high' 
                      ? theme.palette.error.main 
                      : message.priority === 'medium'
                      ? theme.palette.warning.main
                      : theme.palette.info.main 
                  }}>
                    <Message />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1" fontWeight="medium">
                        {message.subject}
                      </Typography>
                      <Chip 
                        label={message.priority} 
                        size="small"
                        color={
                          message.priority === 'high' 
                            ? 'error' 
                            : message.priority === 'medium'
                            ? 'warning'
                            : 'info'
                        }
                      />
                    </Box>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary" noWrap>
                        {message.content.substring(0, 80)}...
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          From: {message.from}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatDate(message.received)}
                        </Typography>
                      </Box>
                    </>
                  }
                />
                {message.replied && (
                  <Chip 
                    label="Replied" 
                    size="small" 
                    color="success" 
                    sx={{ ml: 1 }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}
      </>
    );
  };
  // Render Statistics Tab
  const renderStatisticsTab = () => {
    return (
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Platform Performance Metrics
          </Typography>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    User Growth Rate
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" sx={{ mr: 1 }}>
                      +15.2%
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      (+3.4%)
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    vs. previous month
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Project Success Rate
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" sx={{ mr: 1 }}>
                      78.3%
                    </Typography>
                    <Typography variant="caption" color="success.main">
                      (+2.1%)
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    completed/total projects
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Box 
                  sx={{ 
                    p: 2, 
                    border: '1px solid', 
                    borderColor: 'divider', 
                    borderRadius: 1,
                    height: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Average Project Funding
                  </Typography>
                  <Box display="flex" alignItems="center">
                    <Typography variant="h5" sx={{ mr: 1 }}>
                      $42,500
                    </Typography>
                    <Typography variant="caption" color="error.main">
                      (-5.3%)
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    vs. previous quarter
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Project Funding Overview
              </Typography>
              <Box
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 1,
                  p: 2,
                  height: 250,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Chart visualization would appear here in the real application.
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Key Performance Indicators
          </Typography>
          <Paper sx={{ p: 3 }}>
            <List>
              <ListItem>
                <Box width="100%">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      User Retention Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      85.2%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={85.2} 
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </ListItem>
              <ListItem>
                <Box width="100%">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Project Approval Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      92.7%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={92.7} 
                    color="success"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </ListItem>
              <ListItem>
                <Box width="100%">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Milestone Completion Rate
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      78.9%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={78.9} 
                    color="warning"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </ListItem>
              <ListItem>
                <Box width="100%">
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Funding Goal Achievement
                    </Typography>
                    <Typography variant="body1" fontWeight="medium">
                      65.4%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={65.4} 
                    color="info"
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              </ListItem>
            </List>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            User & Project Distribution
          </Typography>
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Users by Role
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    p: 2,
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Pie chart visualization
                  </Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <Box sx={{ width: 10, height: 10, bgcolor: theme.palette.primary.main, borderRadius: '50%', mr: 1 }} />
                    <ListItemText primary="Innovators" secondary="42%" />
                  </ListItem>
                  <ListItem>
                    <Box sx={{ width: 10, height: 10, bgcolor: theme.palette.secondary.main, borderRadius: '50%', mr: 1 }} />
                    <ListItemText primary="Investors" secondary="38%" />
                  </ListItem>
                  <ListItem>
                    <Box sx={{ width: 10, height: 10, bgcolor: theme.palette.tertiary.main, borderRadius: '50%', mr: 1 }} />
                    <ListItemText primary="Admins" secondary="20%" />
                  </ListItem>
                </List>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2" gutterBottom>
                  Projects by Category
                </Typography>
                <Box
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    p: 2,
                    height: 150,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="caption" color="text.secondary">
                    Pie chart visualization
                  </Typography>
                </Box>
                <List dense>
                  <ListItem>
                    <Box sx={{ width: 10, height: 10, bgcolor: '#4CAF50', borderRadius: '50%', mr: 1 }} />
                    <ListItemText primary="AgriTech" secondary="25%" />
                  </ListItem>
                  <ListItem>
                    <Box sx={{ width: 10, height: 10, bgcolor: '#2196F3', borderRadius: '50%', mr: 1 }} />
                    <ListItemText primary="CleanTech" secondary="22%" />
                  </ListItem>
                  <ListItem>
                    <Box sx={{ width: 10, height: 10, bgcolor: '#FFC107', borderRadius: '50%', mr: 1 }} />
                    <ListItemText primary="Energy" secondary="18%" />
                  </ListItem>
                </List>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        
        <Grid item xs={12}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Platform Usage Analytics</Typography>
            <Button variant="outlined" startIcon={<Download />}>
              Export Data
            </Button>
          </Box>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle2" gutterBottom>
              User Activity Trends
            </Typography>
            <Box
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                borderRadius: 1,
                p: 2,
                height: 300,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="body2" color="text.secondary">
                Line chart visualization would appear here in the real application.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    );
  };
  return (
    <AppLayout>
      <Typography
        variant="h4"
        sx={{
          mb: 2,
          fontWeight: "bold",
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        Admin Panel
      </Typography>
      
      <GradientDivider />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          textColor="primary"
          indicatorColor="primary"
          aria-label="admin panel tabs"
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tab label="Dashboard" icon={<Dashboard />} iconPosition="start" />
          <Tab label="User Verification" icon={<Person />} iconPosition="start" />
          <Tab label="Project Approval" icon={<Business />} iconPosition="start" />
          <Tab label="Milestone Verification" icon={<Assignment />} iconPosition="start" />
          <Tab label="Escrow Management" icon={<AttachMoney />} iconPosition="start" />
          <Tab label="Transaction Verification" icon={<Receipt />} iconPosition="start" />
          <Tab label="Messages" icon={<Message />} iconPosition="start" />
          <Tab label="Statistics" icon={<BarChart />} iconPosition="start" />
        </Tabs>
        
        {/* Dashboard Tab */}
        <TabPanel value={tabValue} index={0}>
          {renderDashboardTab()}
        </TabPanel>
        
        {/* User Verification Tab */}
        <TabPanel value={tabValue} index={1}>
          {renderUserVerificationTab()}
        </TabPanel>
        
        {/* Project Approval Tab */}
        <TabPanel value={tabValue} index={2}>
          {renderProjectApprovalTab()}
        </TabPanel>
        
        {/* Milestone Verification Tab */}
        <TabPanel value={tabValue} index={3}>
          {renderMilestoneVerificationTab()}
        </TabPanel>
        
        {/* Escrow Management Tab */}
        <TabPanel value={tabValue} index={4}>
          {renderEscrowManagementTab()}
        </TabPanel>
        
        {/* Transaction Verification Tab */}
        <TabPanel value={tabValue} index={5}>
          <TransactionVerificationPanel />
        </TabPanel>
        
        {/* Messages Tab */}
        <TabPanel value={tabValue} index={6}>
          {renderMessagesTab()}
        </TabPanel>
        
        {/* Statistics Tab */}
        <TabPanel value={tabValue} index={7}>
          {renderStatisticsTab()}
        </TabPanel>
      </Paper>
      
      {/* Action Confirmation Dialog */}
      <Dialog
        open={actionDialogOpen}
        onClose={handleActionDialogClose}
      >
        <DialogTitle>
          {actionType === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
        </DialogTitle>
        <DialogContent>
          {actionType === 'approve' 
            ? (
              <DialogContentText>
                Are you sure you want to approve this item? This action cannot be undone.
              </DialogContentText>
            ) 
            : (
              <>
                <DialogContentText sx={{ mb: 2 }}>
                  Please provide a reason for rejection. This will be shared with the user.
                </DialogContentText>
                <TextField
                  fullWidth
                  label="Rejection Reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  multiline
                  rows={3}
                  required
                  error={!rejectionReason.trim()}
                  helperText={!rejectionReason.trim() ? 'Rejection reason is required' : ''}
                />
              </>
            )
          }
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionDialogClose} disabled={loading}>Cancel</Button>
          <Button 
            onClick={handleAction} 
            variant="contained" 
            color={actionType === 'approve' ? 'success' : 'error'}
            autoFocus
            disabled={loading || (actionType === 'reject' && !rejectionReason.trim())}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              actionType === 'approve' ? 'Approve' : 'Reject'
            )}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Message Dialog */}
      <Dialog
        open={messageDialogOpen}
        onClose={handleMessageClose}
        maxWidth="sm"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              <Box display="flex" justifyContent="space-between" alignItems="center">
                {selectedMessage.subject}
                <Chip 
                  label={selectedMessage.priority} 
                  size="small"
                  color={
                    selectedMessage.priority === 'high' 
                      ? 'error' 
                      : selectedMessage.priority === 'medium'
                      ? 'warning'
                      : 'info'
                  }
                />
              </Box>
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>From:</strong> {selectedMessage.from} ({selectedMessage.fromId})
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Received:</strong> {formatDate(selectedMessage.received)}
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {selectedMessage.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleMessageClose}>Close</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleReplyOpen}
              >
                Reply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      {/* Reply Dialog */}
      <Dialog
        open={replyDialogOpen}
        onClose={handleReplyClose}
        maxWidth="sm"
        fullWidth
      >
        {selectedMessage && (
          <>
            <DialogTitle>
              Reply to: {selectedMessage.subject}
            </DialogTitle>
            <DialogContent>
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>To:</strong> {selectedMessage.from} ({selectedMessage.fromId})
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={5}
                label="Your Reply"
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                required
                error={!replyContent.trim()}
                helperText={!replyContent.trim() ? 'Reply content is required' : ''}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleReplyClose} disabled={loading}>Cancel</Button>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleSendReply}
                disabled={loading || !replyContent.trim()}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : 'Send Reply'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Document Preview Dialog */}
      <Dialog
        open={documentPreviewOpen}
        onClose={() => setDocumentPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {documentName}
            <Button startIcon={<Download />}>
              Download
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box 
            sx={{ 
              height: 600, 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              bgcolor: 'rgba(0,0,0,0.03)',
              borderRadius: 1,
              p: 2
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <Description sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1">
                Document preview would be displayed here in a real application.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This is a placeholder for the document viewer component.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Report Generation Dialog */}
      <Dialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Generate Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Report Type</InputLabel>
                <Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as 'users' | 'projects' | 'transactions')}
                  label="Report Type"
                >
                  <MenuItem value="users">User Activity</MenuItem>
                  <MenuItem value="projects">Project Performance</MenuItem>
                  <MenuItem value="transactions">Financial Transactions</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={reportDateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setReportDateRange({
                  ...reportDateRange,
                  start: new Date(e.target.value)
                })}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={reportDateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setReportDateRange({
                  ...reportDateRange,
                  end: new Date(e.target.value)
                })}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleGenerateReport}
          >
            Generate
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={handleFilterClose}
      >
        {tabValue === 1 && (
          <>
            <MenuItem disabled>
              <Typography variant="subtitle2">User Role</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleSetFilter('role', 'Innovator')}>
              <ListItemText primary="Innovators" />
              {roleFilter === 'Innovator' && <CheckCircle fontSize="small" color="primary" />}
            </MenuItem>
            <MenuItem onClick={() => handleSetFilter('role', 'Investor')}>
              <ListItemText primary="Investors" />
              {roleFilter === 'Investor' && <CheckCircle fontSize="small" color="primary" />}
            </MenuItem>
          </>
        )}
        
        {tabValue === 2 && (
          <>
            <MenuItem disabled>
              <Typography variant="subtitle2">Project Category</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleSetFilter('category', 'AgriTech')}>
              <ListItemText primary="AgriTech" />
              {categoryFilter === 'AgriTech' && <CheckCircle fontSize="small" color="primary" />}
            </MenuItem>
            <MenuItem onClick={() => handleSetFilter('category', 'CleanTech')}>
              <ListItemText primary="CleanTech" />
              {categoryFilter === 'CleanTech' && <CheckCircle fontSize="small" color="primary" />}
            </MenuItem>
            <MenuItem onClick={() => handleSetFilter('category', 'Energy')}>
              <ListItemText primary="Energy" />
              {categoryFilter === 'Energy' && <CheckCircle fontSize="small" color="primary" />}
            </MenuItem>
            <MenuItem onClick={() => handleSetFilter('category', 'HealthTech')}>
              <ListItemText primary="HealthTech" />
              {categoryFilter === 'HealthTech' && <CheckCircle fontSize="small" color="primary" />}
            </MenuItem>
          </>
        )}
        
        {tabValue === 6 && (
          <>
            <MenuItem disabled>
              <Typography variant="subtitle2">Message Priority</Typography>
            </MenuItem>
            <MenuItem onClick={() => handleSetFilter('priority', 'high')}>
              <ListItemText primary="High Priority" />
              {priorityFilter === 'high' && <CheckCircle fontSize="small" color="primary" />}
            </MenuItem>
            <MenuItem onClick={() => handleSetFilter('priority', 'medium')}>
              <ListItemText primary="Medium Priority" />
              {priorityFilter === 'medium' && <CheckCircle fontSize="small" color="primary" />}
            </MenuItem>
            <MenuItem onClick={() => handleSetFilter('priority', 'low')}>
              <ListItemText primary="Low Priority" />
              {priorityFilter === 'low' && <CheckCircle fontSize="small" color="primary" />}
            </MenuItem>
          </>
        )}
        
        <Divider />
        <MenuItem onClick={handleClearFilters}>
          <Typography color="error">Clear All Filters</Typography>
        </MenuItem>
      </Menu>
      
      {/* Item Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => currentMenuItemId && handleActionDialogOpen(
          projects.find(p => p.id === currentMenuItemId) || 
          users.find(u => u.id === currentMenuItemId) ||
          milestones.find(m => m.id === currentMenuItemId) ||
          escrows.find(e => e.id === currentMenuItemId),
          'approve'
        )}>
          <ListItemAvatar>
            <CheckCircle fontSize="small" color="success" />
          </ListItemAvatar>
          <ListItemText primary="Approve" />
        </MenuItem>
        <MenuItem onClick={() => currentMenuItemId && handleActionDialogOpen(
          projects.find(p => p.id === currentMenuItemId) || 
          users.find(u => u.id === currentMenuItemId) ||
          milestones.find(m => m.id === currentMenuItemId) ||
          escrows.find(e => e.id === currentMenuItemId),
          'reject'
        )}>
          <ListItemAvatar>
            <Cancel fontSize="small" color="error" />
          </ListItemAvatar>
          <ListItemText primary="Reject" />
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemAvatar>
            <Visibility fontSize="small" color="primary" />
          </ListItemAvatar>
          <ListItemText primary="View Details" />
        </MenuItem>
      </Menu>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
};

export default AdminPanel;