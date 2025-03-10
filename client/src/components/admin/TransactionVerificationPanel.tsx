import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Chip,
  useTheme,
  styled,
  Tab,
  Tabs,
  Alert,
  CircularProgress,
  Snackbar,
  Menu,
  MenuItem,
  Tooltip,
  Checkbox,
  Badge,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  AttachMoney,
  CheckCircle,
  Cancel,
  Visibility,
  MoreVert,
  Receipt,
  AccountBalanceWallet,
  Person,
  Download,
  ArrowUpward,
  ArrowDownward,
  Search,
  FilterList,
  Refresh,
  VerifiedUser,
  Block,
  Info,
  Description,
  AccessTime,
  History,
  Flag,
  RemoveRedEye,
  PriorityHigh,
  CalendarToday,
} from '@mui/icons-material';

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

const UploadPreview = styled(Box)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
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
      id={`transaction-tabpanel-${index}`}
      aria-labelledby={`transaction-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

// Transaction status and types
type TransactionStatus = 'pending' | 'verifying' | 'completed' | 'rejected';
type TransactionType = 'deposit' | 'withdrawal' | 'investment';
type PaymentMethod = 'bank_transfer' | 'cryptocurrency' | 'credit_card';
type SortOrder = 'newest' | 'oldest' | 'highest' | 'lowest';
type RiskLevel = 'low' | 'medium' | 'high';

// Transaction interface
interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  proofOfPayment?: string;
  project?: string;
  projectId?: string;
  notes?: string;
  riskLevel?: RiskLevel;
}

// User activity interface
interface UserActivity {
  id: string;
  action: string;
  timestamp: string;
  details?: string;
}
// Mock transaction data for admin panel
const mockPendingTransactions: Transaction[] = [
    {
      id: 'txn_001',
      userId: 'user_002',
      userName: 'Sarah Johnson',
      type: 'deposit',
      amount: 25000,
      date: '2025-03-09',
      status: 'pending',
      paymentMethod: 'bank_transfer',
      proofOfPayment: 'bank_receipt.pdf',
      riskLevel: 'low',
    },
    {
      id: 'txn_002',
      userId: 'user_003',
      userName: 'Michael Brown',
      type: 'deposit',
      amount: 10000,
      date: '2025-03-10',
      status: 'pending',
      paymentMethod: 'cryptocurrency',
      proofOfPayment: 'crypto_transaction.png',
      riskLevel: 'medium',
    },
    {
      id: 'txn_003',
      userId: 'user_004',
      userName: 'Emily Chen',
      type: 'investment',
      amount: 15000,
      date: '2025-03-10',
      status: 'pending',
      project: 'Clean Water Initiative',
      projectId: 'proj_002',
      riskLevel: 'low',
    },
    {
      id: 'txn_007',
      userId: 'user_006',
      userName: 'James Wilson',
      type: 'deposit',
      amount: 50000,
      date: '2025-03-11',
      status: 'pending',
      paymentMethod: 'bank_transfer',
      proofOfPayment: 'bank_statement.pdf',
      riskLevel: 'high',
    },
    {
      id: 'txn_008',
      userId: 'user_007',
      userName: 'Lisa Rodriguez',
      type: 'investment',
      amount: 8000,
      date: '2025-03-11',
      status: 'pending',
      project: 'Solar Micro-Grids',
      projectId: 'proj_003',
      riskLevel: 'low',
    },
  ];
  
  const mockCompletedTransactions: Transaction[] = [
    {
      id: 'txn_004',
      userId: 'user_002',
      userName: 'Sarah Johnson',
      type: 'deposit',
      amount: 50000,
      date: '2025-03-01',
      status: 'completed',
      paymentMethod: 'bank_transfer',
      proofOfPayment: 'bank_receipt_1.pdf',
      notes: 'Verified by admin on March 2, 2025',
      riskLevel: 'low',
    },
    {
      id: 'txn_005',
      userId: 'user_003',
      userName: 'Michael Brown',
      type: 'investment',
      amount: 35000,
      date: '2025-03-05',
      status: 'completed',
      project: 'Smart Agriculture System',
      projectId: 'proj_001',
      notes: 'Investment allocated to milestone 1 & 2',
      riskLevel: 'low',
    },
    {
      id: 'txn_009',
      userId: 'user_005',
      userName: 'David Smith',
      type: 'deposit',
      amount: 15000,
      date: '2025-03-07',
      status: 'completed',
      paymentMethod: 'credit_card',
      notes: 'Verified and processed through payment gateway',
      riskLevel: 'low',
    },
    {
      id: 'txn_010',
      userId: 'user_007',
      userName: 'Lisa Rodriguez',
      type: 'investment',
      amount: 12000,
      date: '2025-03-06',
      status: 'completed',
      project: 'Healthcare AI Diagnostics',
      projectId: 'proj_004',
      notes: 'Investment verified and allocated to project',
      riskLevel: 'low',
    },
  ];
  
  const mockRejectedTransactions: Transaction[] = [
    {
      id: 'txn_006',
      userId: 'user_005',
      userName: 'Robert Miller',
      type: 'deposit',
      amount: 7500,
      date: '2025-03-07',
      status: 'rejected',
      paymentMethod: 'cryptocurrency',
      proofOfPayment: 'invalid_receipt.jpg',
      notes: 'Unable to verify transaction. Proof of payment does not match the amount stated.',
      riskLevel: 'high',
    },
    {
      id: 'txn_011',
      userId: 'user_008',
      userName: 'Thomas Greene',
      type: 'deposit',
      amount: 100000,
      date: '2025-03-09',
      status: 'rejected',
      paymentMethod: 'bank_transfer',
      proofOfPayment: 'suspicious_transfer.pdf',
      notes: 'Unusual transaction pattern. Request additional verification documents.',
      riskLevel: 'high',
    },
  ];
  
  // Mock user activity data
  const mockUserActivityData: Record<string, UserActivity[]> = {
    'user_002': [
      { id: 'act_001', action: 'Login', timestamp: '2025-03-09T14:32:00Z', details: 'IP: 192.168.1.1' },
      { id: 'act_002', action: 'Profile Update', timestamp: '2025-03-08T10:15:00Z', details: 'Changed address information' },
      { id: 'act_003', action: 'Deposit', timestamp: '2025-03-07T16:45:00Z', details: '$10,000 via bank transfer' },
    ],
    'user_003': [
      { id: 'act_004', action: 'Login', timestamp: '2025-03-10T09:20:00Z', details: 'IP: 192.168.2.3' },
      { id: 'act_005', action: 'Investment', timestamp: '2025-03-09T11:30:00Z', details: '$35,000 in Smart Agriculture System' },
      { id: 'act_006', action: 'Document Upload', timestamp: '2025-03-08T15:10:00Z', details: 'Uploaded ID verification' },
    ],
    'user_004': [
      { id: 'act_007', action: 'Login', timestamp: '2025-03-10T08:45:00Z', details: 'IP: 192.168.3.4' },
      { id: 'act_008', action: 'Project View', timestamp: '2025-03-10T08:50:00Z', details: 'Viewed Clean Water Initiative' },
      { id: 'act_009', action: 'Message Sent', timestamp: '2025-03-09T14:20:00Z', details: 'Message to project creator' },
    ],
    'user_005': [
      { id: 'act_010', action: 'Login', timestamp: '2025-03-07T10:30:00Z', details: 'IP: 192.168.4.5 (Unusual location)' },
      { id: 'act_011', action: 'Multiple Login Attempts', timestamp: '2025-03-07T10:25:00Z', details: '3 failed attempts before success' },
      { id: 'act_012', action: 'Deposit Attempt', timestamp: '2025-03-07T10:35:00Z', details: 'Attempted $7,500 crypto deposit' },
    ],
    'user_006': [
      { id: 'act_013', action: 'Account Created', timestamp: '2025-03-10T09:15:00Z', details: 'New investor account' },
      { id: 'act_014', action: 'KYC Documents Uploaded', timestamp: '2025-03-10T09:30:00Z', details: 'Provided ID and proof of address' },
      { id: 'act_015', action: 'Large Deposit', timestamp: '2025-03-11T11:20:00Z', details: 'Initiated $50,000 bank transfer' },
    ],
  };
  
  // Transaction analysis information
  const getTransactionAnalysis = (transaction: Transaction): string[] => {
    const analysis: string[] = [];
    
    // Add analysis based on transaction type and amount
    if (transaction.amount > 20000) {
      analysis.push('Large transaction amount requires additional verification');
    }
    
    if (transaction.type === 'deposit' && transaction.paymentMethod === 'cryptocurrency') {
      analysis.push('Cryptocurrency deposits require blockchain verification');
    }
    
    // Add user history analysis
    if (transaction.userId === 'user_005') {
      analysis.push('User has previous rejected transactions');
    }
    
    if (transaction.userId === 'user_006' && transaction.amount > 10000) {
      analysis.push('New user with large transaction - verify source of funds');
    }
    
    // Add risk assessment
    if (transaction.riskLevel === 'high') {
      analysis.push('High risk transaction - careful verification required');
    }
    
    return analysis;
  };
  const TransactionVerificationPanel: React.FC = () => {
    const theme = useTheme();
    
    // State for selected tab
    const [tabValue, setTabValue] = useState(0);
    
    // State for transaction details and actions
    const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
    const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false);
    const [verificationDialogOpen, setVerificationDialogOpen] = useState(false);
    const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState('');
    const [verificationNote, setVerificationNote] = useState('');
    
    // State for user details
    const [userActivityOpen, setUserActivityOpen] = useState(false);
    const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
    
    // All transactions based on status
    const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>(mockPendingTransactions);
    const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>(mockCompletedTransactions);
    const [rejectedTransactions, setRejectedTransactions] = useState<Transaction[]>(mockRejectedTransactions);
    
    // New states for enhanced functionality
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMenuAnchorEl, setFilterMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [filterType, setFilterType] = useState<string | null>(null);
    const [filterPaymentMethod, setFilterPaymentMethod] = useState<string | null>(null);
    const [filterRiskLevel, setFilterRiskLevel] = useState<string | null>(null);
    const [sortOrder, setSortOrder] = useState<SortOrder>('newest');
    const [detailsMenuAnchorEl, setDetailsMenuAnchorEl] = useState<null | HTMLElement>(null);
    const [verifyingTransaction, setVerifyingTransaction] = useState<string | null>(null);
    const [flaggedTransactions, setFlaggedTransactions] = useState<string[]>(['txn_007']);
    const [snackbar, setSnackbar] = useState({
      open: false,
      message: '',
      severity: 'success' as 'success' | 'error' | 'info' | 'warning',
    });
    
    // Document preview state
    const [documentPreviewOpen, setDocumentPreviewOpen] = useState(false);
    const [documentName, setDocumentName] = useState('');
    
    // Batch actions
    const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
    const [batchActionMenuAnchorEl, setBatchActionMenuAnchorEl] = useState<null | HTMLElement>(null);
    
    // Analytics state
    const [analyticsDialogOpen, setAnalyticsDialogOpen] = useState(false);
    const [transactionAnalytics, setTransactionAnalytics] = useState({
      totalPending: pendingTransactions.length,
      totalAmount: pendingTransactions.reduce((sum, t) => sum + t.amount, 0),
      highRisk: pendingTransactions.filter(t => t.riskLevel === 'high').length,
      byType: {
        deposit: pendingTransactions.filter(t => t.type === 'deposit').length,
        investment: pendingTransactions.filter(t => t.type === 'investment').length,
        withdrawal: pendingTransactions.filter(t => t.type === 'withdrawal').length,
      },
      byPaymentMethod: {
        bank_transfer: pendingTransactions.filter(t => t.paymentMethod === 'bank_transfer').length,
        cryptocurrency: pendingTransactions.filter(t => t.paymentMethod === 'cryptocurrency').length,
        credit_card: pendingTransactions.filter(t => t.paymentMethod === 'credit_card').length,
      },
    });
    
    useEffect(() => {
      // Simulate loading data from backend
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }, []);
    
    // Update analytics when transactions change
    useEffect(() => {
      setTransactionAnalytics({
        totalPending: pendingTransactions.length,
        totalAmount: pendingTransactions.reduce((sum, t) => sum + t.amount, 0),
        highRisk: pendingTransactions.filter(t => t.riskLevel === 'high').length,
        byType: {
          deposit: pendingTransactions.filter(t => t.type === 'deposit').length,
          investment: pendingTransactions.filter(t => t.type === 'investment').length,
          withdrawal: pendingTransactions.filter(t => t.type === 'withdrawal').length,
        },
        byPaymentMethod: {
          bank_transfer: pendingTransactions.filter(t => t.paymentMethod === 'bank_transfer').length,
          cryptocurrency: pendingTransactions.filter(t => t.paymentMethod === 'cryptocurrency').length,
          credit_card: pendingTransactions.filter(t => t.paymentMethod === 'credit_card').length,
        },
      });
    }, [pendingTransactions]);
    // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle opening transaction details
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsOpen(true);
  };
  
  // Handle opening verification dialog
  const handleOpenVerificationDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setVerificationDialogOpen(true);
    setTransactionDetailsOpen(false);
    setVerifyingTransaction(transaction.id);
  };
  
  // Handle opening rejection dialog
  const handleOpenRejectionDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRejectionDialogOpen(true);
    setTransactionDetailsOpen(false);
  };
  
  // Handle user activity
  const handleViewUserActivity = (userId: string) => {
    const activities = mockUserActivityData[userId] || [];
    setUserActivities(activities);
    setUserActivityOpen(true);
  };
  
  // Handle approving a transaction
  const handleApproveTransaction = async () => {
    if (!selectedTransaction) return;
    
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state
      const updatedTransaction = {
        ...selectedTransaction,
        status: 'completed' as TransactionStatus,
        notes: verificationNote || 'Verified by admin',
      };
      
      // Remove from pending and add to completed
      setPendingTransactions(pendingTransactions.filter(t => t.id !== selectedTransaction.id));
      setCompletedTransactions([updatedTransaction, ...completedTransactions]);
      
      showSnackbar(`Transaction ${selectedTransaction.id} has been approved`, 'success');
    } catch (error) {
      console.error('Error approving transaction:', error);
      showSnackbar('An error occurred', 'error');
    } finally {
      setLoading(false);
      setVerificationDialogOpen(false);
      setSelectedTransaction(null);
      setVerificationNote('');
      setVerifyingTransaction(null);
    }
  };
  
  // Handle rejecting a transaction
  const handleRejectTransaction = async () => {
    if (!selectedTransaction || !rejectReason) return;
    
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update local state
      const updatedTransaction = {
        ...selectedTransaction,
        status: 'rejected' as TransactionStatus,
        notes: rejectReason,
      };
      
      // Remove from pending and add to rejected
      setPendingTransactions(pendingTransactions.filter(t => t.id !== selectedTransaction.id));
      setRejectedTransactions([updatedTransaction, ...rejectedTransactions]);
      
      showSnackbar(`Transaction ${selectedTransaction.id} has been rejected`, 'error');
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      showSnackbar('An error occurred', 'error');
    } finally {
      setLoading(false);
      setRejectionDialogOpen(false);
      setSelectedTransaction(null);
      setRejectReason('');
    }
  };
  
  // Handle batch actions
  const handleBatchActionOpen = (event: React.MouseEvent<HTMLElement>) => {
    setBatchActionMenuAnchorEl(event.currentTarget);
  };
  
  const handleBatchActionClose = () => {
    setBatchActionMenuAnchorEl(null);
  };
  
  const handleBatchApprove = async () => {
    if (selectedTransactions.length === 0) return;
    
    setLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Filter transactions to approve
      const transactionsToApprove = pendingTransactions.filter(t => selectedTransactions.includes(t.id));
      
      // Update statuses
      const updatedTransactions = transactionsToApprove.map(t => ({
        ...t,
        status: 'completed' as TransactionStatus,
        notes: 'Batch verified by admin',
      }));
      
      // Update state
      setPendingTransactions(pendingTransactions.filter(t => !selectedTransactions.includes(t.id)));
      setCompletedTransactions([...updatedTransactions, ...completedTransactions]);
      
      showSnackbar(`${selectedTransactions.length} transactions approved successfully`, 'success');
      setSelectedTransactions([]);
    } catch (error) {
      console.error('Error in batch approval:', error);
      showSnackbar('An error occurred during batch approval', 'error');
    } finally {
      setLoading(false);
      handleBatchActionClose();
    }
  };
  
  const handleBatchFlag = () => {
    if (selectedTransactions.length === 0) return;
    
    // Add selected transactions to flagged list
    setFlaggedTransactions([...flaggedTransactions, ...selectedTransactions]);
    
    showSnackbar(`${selectedTransactions.length} transactions flagged for review`, 'warning');
    setSelectedTransactions([]);
    handleBatchActionClose();
  };
  
  // Toggle selection of a transaction
  const toggleTransactionSelection = (transactionId: string) => {
    if (selectedTransactions.includes(transactionId)) {
      setSelectedTransactions(selectedTransactions.filter(id => id !== transactionId));
    } else {
      setSelectedTransactions([...selectedTransactions, transactionId]);
    }
  };
  
  // Get color for transaction status
  const getStatusColor = (status: TransactionStatus) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'verifying':
        return 'info';
      case 'rejected':
        return 'error';
      default:
        return 'default';
    }
  };
  
  // Get icon for transaction type
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <ArrowUpward color="success" />;
      case 'withdrawal':
        return <ArrowDownward color="error" />;
      case 'investment':
        return <AttachMoney color="primary" />;
      default:
        return <Receipt />;
    }
  };
  
  // Get icon and color for risk level
  const getRiskLevelInfo = (riskLevel: RiskLevel = 'low') => {
    switch (riskLevel) {
      case 'high':
        return { icon: <PriorityHigh />, color: theme.palette.error.main };
      case 'medium':
        return { icon: <Info />, color: theme.palette.warning.main };
      case 'low':
        return { icon: <CheckCircle />, color: theme.palette.success.main };
      default:
        return { icon: <Info />, color: theme.palette.info.main };
    }
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
      case 'type':
        setFilterType(filterValue);
        break;
      case 'paymentMethod':
        setFilterPaymentMethod(filterValue);
        break;
      case 'riskLevel':
        setFilterRiskLevel(filterValue);
        break;
    }
    
    handleFilterClose();
  };
  
  const handleClearFilters = () => {
    setFilterType(null);
    setFilterPaymentMethod(null);
    setFilterRiskLevel(null);
    setSearchQuery('');
    handleFilterClose();
  };
  
  // Handle sorting
  const handleSortChange = (order: SortOrder) => {
    setSortOrder(order);
  };
  
  // Handle flagging a transaction
  const handleFlagTransaction = (transactionId: string) => {
    if (flaggedTransactions.includes(transactionId)) {
      setFlaggedTransactions(flaggedTransactions.filter(id => id !== transactionId));
      showSnackbar('Flag removed from transaction', 'info');
    } else {
      setFlaggedTransactions([...flaggedTransactions, transactionId]);
      showSnackbar('Transaction flagged for review', 'warning');
    }
    setDetailsMenuAnchorEl(null);
  };
  
  // Handle details menu
  const handleDetailsMenuOpen = (event: React.MouseEvent<HTMLElement>, transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsMenuAnchorEl(event.currentTarget);
  };
  
  const handleDetailsMenuClose = () => {
    setDetailsMenuAnchorEl(null);
  };
  
  // Function to format date in a consistent way
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Filter and sort transactions based on user input
  const getFilteredTransactions = (transactions: Transaction[]) => {
    // First apply search filter
    let filtered = transactions;
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t => 
          t.id.toLowerCase().includes(query) ||
          t.userName.toLowerCase().includes(query) ||
          (t.project && t.project.toLowerCase().includes(query))
      );
    }
    
    // Then apply type filter
    if (filterType) {
      filtered = filtered.filter(t => t.type === filterType);
    }
    
    // Then apply payment method filter
    if (filterPaymentMethod) {
      filtered = filtered.filter(t => t.paymentMethod === filterPaymentMethod);
    }
    
    // Then apply risk level filter
    if (filterRiskLevel) {
      filtered = filtered.filter(t => t.riskLevel === filterRiskLevel);
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      switch (sortOrder) {
        case 'newest':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'highest':
          return b.amount - a.amount;
        case 'lowest':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });
  };
  // Render pending transactions tab
  const renderPendingTransactionsTab = () => {
    const filteredTransactions = getFilteredTransactions(pendingTransactions);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search transactions..."
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
              Filters {(filterType || filterPaymentMethod || filterRiskLevel) ? '(Active)' : ''}
            </Button>
            
            {selectedTransactions.length > 0 && (
              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleBatchActionOpen}
              >
                Actions ({selectedTransactions.length})
              </Button>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="text"
              size="small"
              startIcon={<Info />}
              onClick={() => setAnalyticsDialogOpen(true)}
            >
              Analytics
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSortChange('newest')}
              color={sortOrder === 'newest' ? 'primary' : 'inherit'}
            >
              Newest
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSortChange('highest')}
              color={sortOrder === 'highest' ? 'primary' : 'inherit'}
            >
              Highest
            </Button>
          </Box>
        </Box>
        
        {filteredTransactions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No pending transactions to verify
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredTransactions.map((transaction) => (
              <ListItem
                key={transaction.id}
                sx={{
                  mb: 2,
                  bgcolor: flaggedTransactions.includes(transaction.id) 
                    ? 'rgba(255, 152, 0, 0.08)' 
                    : selectedTransactions.includes(transaction.id)
                    ? 'rgba(63, 81, 181, 0.08)'
                    : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  borderLeft: flaggedTransactions.includes(transaction.id) 
                    ? `4px solid ${theme.palette.warning.main}`
                    : transaction.riskLevel === 'high'
                    ? `4px solid ${theme.palette.error.main}`
                    : 'none',
                }}
              >
                <Box
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mr: 2,
                    cursor: 'pointer'
                  }}
                  onClick={() => toggleTransactionSelection(transaction.id)}
                >
                  <Checkbox 
                    checked={selectedTransactions.includes(transaction.id)} 
                    color="primary"
                  />
                </Box>
                
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Tooltip title={`${transaction.riskLevel || 'low'} risk`}>
                        <Avatar 
                          sx={{ 
                            width: 15, 
                            height: 15,
                            bgcolor: getRiskLevelInfo(transaction.riskLevel).color
                          }}
                        >
                          {transaction.riskLevel === 'high' && <PriorityHigh sx={{ width: 12, height: 12 }} />}
                        </Avatar>
                      </Tooltip>
                    }
                  >
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {getTransactionIcon(transaction.type)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1">
                        {transaction.type === 'investment' 
                          ? `Investment in ${transaction.project}` 
                          : `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        ${transaction.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Tooltip title="View user activity">
                          <Box
                            sx={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                            onClick={() => handleViewUserActivity(transaction.userId)}
                          >
                            <Person fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                            <Typography variant="body2" color="text.secondary">
                              {transaction.userName} ({transaction.userId})
                            </Typography>
                          </Box>
                        </Tooltip>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Box display="flex" alignItems="center">
                          <CalendarToday fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(transaction.date)}
                          </Typography>
                        </Box>
                        <Box display="flex" alignItems="center">
                          {transaction.paymentMethod && (
                            <Chip
                              label={transaction.paymentMethod.replace('_', ' ')}
                              size="small"
                              sx={{ mr: 1, textTransform: 'capitalize' }}
                            />
                          )}
                          <Chip
                            label={verifyingTransaction === transaction.id ? 'Verifying...' : transaction.status}
                            color={verifyingTransaction === transaction.id ? 'info' : getStatusColor(transaction.status)}
                            size="small"
                          />
                        </Box>
                      </Box>
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
                    onClick={() => handleOpenVerificationDialog(transaction)}
                    disabled={verifyingTransaction !== null}
                  >
                    Verify
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    startIcon={<Cancel />}
                    onClick={() => handleOpenRejectionDialog(transaction)}
                    disabled={verifyingTransaction !== null}
                  >
                    Reject
                  </Button>
                  <IconButton
                    sx={{ ml: 1 }}
                    onClick={() => handleViewTransaction(transaction)}
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={(e) => handleDetailsMenuOpen(e, transaction)}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
              </ListItem>
            ))}
          </List>
        )}
      </>
    );
  };
  // Render completed transactions tab
  const renderCompletedTransactionsTab = () => {
    const filteredTransactions = getFilteredTransactions(completedTransactions);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search transactions..."
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
              Filters {(filterType || filterPaymentMethod || filterRiskLevel) ? '(Active)' : ''}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSortChange('newest')}
              color={sortOrder === 'newest' ? 'primary' : 'inherit'}
            >
              Newest
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSortChange('highest')}
              color={sortOrder === 'highest' ? 'primary' : 'inherit'}
            >
              Highest
            </Button>
          </Box>
        </Box>
        
        {filteredTransactions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No completed transactions to show
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredTransactions.map((transaction) => (
              <ListItem
                key={transaction.id}
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  borderLeft: transaction.riskLevel === 'high'
                    ? `4px solid ${theme.palette.error.main}`
                    : 'none',
                }}
              >
                <ListItemAvatar>
                  <Badge
                    overlap="circular"
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                    badgeContent={
                      <Tooltip title={`${transaction.riskLevel || 'low'} risk`}>
                        <Avatar 
                          sx={{ 
                            width: 15, 
                            height: 15,
                            bgcolor: getRiskLevelInfo(transaction.riskLevel).color
                          }}
                        />
                      </Tooltip>
                    }
                  >
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                      {getTransactionIcon(transaction.type)}
                    </Avatar>
                  </Badge>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1">
                        {transaction.type === 'investment' 
                          ? `Investment in ${transaction.project}` 
                          : `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        ${transaction.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Person fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {transaction.userName} ({transaction.userId})
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(transaction.date)}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          {transaction.paymentMethod && (
                            <Chip
                              label={transaction.paymentMethod.replace('_', ' ')}
                              size="small"
                              sx={{ mr: 1, textTransform: 'capitalize' }}
                            />
                          )}
                          <Chip
                            label={transaction.status}
                            color={getStatusColor(transaction.status)}
                            size="small"
                          />
                        </Box>
                      </Box>
                    </>
                  }
                />
                <IconButton
                  onClick={() => handleViewTransaction(transaction)}
                >
                  <Visibility />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </>
    );
  };
  
  // Render rejected transactions tab
  const renderRejectedTransactionsTab = () => {
    const filteredTransactions = getFilteredTransactions(rejectedTransactions);
    
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    return (
      <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              placeholder="Search transactions..."
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
              Filters {(filterType || filterPaymentMethod || filterRiskLevel) ? '(Active)' : ''}
            </Button>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSortChange('newest')}
              color={sortOrder === 'newest' ? 'primary' : 'inherit'}
            >
              Newest
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleSortChange('highest')}
              color={sortOrder === 'highest' ? 'primary' : 'inherit'}
            >
              Highest
            </Button>
          </Box>
        </Box>
        
        {filteredTransactions.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              No rejected transactions to show
            </Typography>
          </Box>
        ) : (
          <List>
            {filteredTransactions.map((transaction) => (
              <ListItem
                key={transaction.id}
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.error.main }}>
                    {getTransactionIcon(transaction.type)}
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary={
                    <Box display="flex" justifyContent="space-between">
                      <Typography variant="subtitle1">
                        {transaction.type === 'investment' 
                          ? `Investment in ${transaction.project}` 
                          : `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`}
                      </Typography>
                      <Typography variant="subtitle1" fontWeight="bold">
                        ${transaction.amount.toLocaleString()}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <>
                      <Box display="flex" alignItems="center" mt={0.5}>
                        <Person fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {transaction.userName} ({transaction.userId})
                        </Typography>
                      </Box>
                      <Box display="flex" justifyContent="space-between" mt={0.5}>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(transaction.date)}
                        </Typography>
                        <Box display="flex" alignItems="center">
                          {transaction.paymentMethod && (
                            <Chip
                              label={transaction.paymentMethod.replace('_', ' ')}
                              size="small"
                              sx={{ mr: 1, textTransform: 'capitalize' }}
                            />
                          )}
                          <Chip
                            label={transaction.status}
                            color={getStatusColor(transaction.status)}
                            size="small"
                          />
                        </Box>
                      </Box>
                      {transaction.notes && (
                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                          Reason: {transaction.notes}
                        </Typography>
                      )}
                    </>
                  }
                />
                <IconButton
                  onClick={() => handleViewTransaction(transaction)}
                >
                  <Visibility />
                </IconButton>
              </ListItem>
            ))}
          </List>
        )}
      </>
    );
  };
  return (
    <Box sx={{ mb: 4 }}>
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
        Transaction Verification
      </Typography>
      
      <GradientDivider />
      
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StyledBadge badgeContent={pendingTransactions.length} color="error" max={99} showZero>
                  <Receipt sx={{ mr: 1 }} />
                </StyledBadge>
                <Typography>Pending</Typography>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StyledBadge badgeContent={completedTransactions.length} color="success" max={99} showZero>
                  <CheckCircle sx={{ mr: 1 }} />
                </StyledBadge>
                <Typography>Completed</Typography>
              </Box>
            }
          />
          <Tab 
            label={
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <StyledBadge badgeContent={rejectedTransactions.length} color="error" max={99} showZero>
                  <Cancel sx={{ mr: 1 }} />
                </StyledBadge>
                <Typography>Rejected</Typography>
              </Box>
            }
          />
        </Tabs>
        
        {/* Pending Transactions */}
        <TabPanel value={tabValue} index={0}>
          {renderPendingTransactionsTab()}
        </TabPanel>
        
        {/* Completed Transactions */}
        <TabPanel value={tabValue} index={1}>
          {renderCompletedTransactionsTab()}
        </TabPanel>
        
        {/* Rejected Transactions */}
        <TabPanel value={tabValue} index={2}>
          {renderRejectedTransactionsTab()}
        </TabPanel>
      </Paper>
      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog
          open={transactionDetailsOpen}
          onClose={() => setTransactionDetailsOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              Transaction Details
              <Chip 
                label={selectedTransaction.status} 
                color={getStatusColor(selectedTransaction.status)}
                size="small"
              />
            </Box>
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              {/* Transaction summary */}
              <Grid item xs={12}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    mb: 2,
                  }}
                >
                  <IconButton
                    size="large"
                    sx={{ 
                      mr: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {getTransactionIcon(selectedTransaction.type)}
                  </IconButton>
                  <Box>
                    <Typography variant="h6">
                      {selectedTransaction.type === 'investment' 
                        ? `Investment in ${selectedTransaction.project}` 
                        : `${selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}`}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(selectedTransaction.date)}
                    </Typography>
                  </Box>
                  {selectedTransaction.riskLevel && (
                    <Chip 
                      icon={getRiskLevelInfo(selectedTransaction.riskLevel).icon}
                      label={`${selectedTransaction.riskLevel} risk`}
                      color={selectedTransaction.riskLevel as 'error' | 'warning' | 'success' | 'default'}
                      sx={{ ml: 'auto' }}
                    />
                  )}
                </Box>
                <GradientDivider />
              </Grid>
              
              {/* First column: Transaction details */}
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Transaction Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Transaction ID
                        </Typography>
                        <Typography variant="body1">
                          {selectedTransaction.id}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Amount
                        </Typography>
                        <Typography variant="h6" fontWeight="bold">
                          ${selectedTransaction.amount.toLocaleString()}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Date
                        </Typography>
                        <Typography variant="body1">
                          {formatDate(selectedTransaction.date)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Type
                        </Typography>
                        <Typography variant="body1" textTransform="capitalize">
                          {selectedTransaction.type.replace('_', ' ')}
                        </Typography>
                      </Grid>
                      {selectedTransaction.paymentMethod && (
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Payment Method
                          </Typography>
                          <Typography variant="body1" textTransform="capitalize">
                            {selectedTransaction.paymentMethod.replace('_', ' ')}
                          </Typography>
                        </Grid>
                      )}
                      {selectedTransaction.project && (
                        <Grid item xs={selectedTransaction.paymentMethod ? 6 : 12}>
                          <Typography variant="body2" color="text.secondary">
                            Project
                          </Typography>
                          <Typography variant="body1">
                            {selectedTransaction.project}
                          </Typography>
                          {selectedTransaction.projectId && (
                            <Typography variant="caption" color="text.secondary">
                              Project ID: {selectedTransaction.projectId}
                            </Typography>
                          )}
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
                
                {/* User information */}
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        User Information
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<History />}
                        onClick={() => handleViewUserActivity(selectedTransaction.userId)}
                      >
                        View Activity
                      </Button>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          User
                        </Typography>
                        <Typography variant="body1">
                          {selectedTransaction.userName}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          User ID
                        </Typography>
                        <Typography variant="body1">
                          {selectedTransaction.userId}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              
              {/* Second column: Documents and analysis */}
              <Grid item xs={12} md={6}>
                {/* Proof of payment */}
                {selectedTransaction.proofOfPayment && (
                  <Card sx={{ mb: 3 }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Proof of Payment
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          p: 2,
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: 1,
                          mt: 1,
                        }}
                      >
                        <Receipt sx={{ mr: 1 }} />
                        <Typography variant="body2">
                          {selectedTransaction.proofOfPayment}
                        </Typography>
                        <Box sx={{ ml: 'auto' }}>
                          <Button 
                            variant="text" 
                            size="small"
                            startIcon={<RemoveRedEye />}
                            onClick={() => handleDocumentPreview(selectedTransaction.proofOfPayment || '')}
                            sx={{ mr: 1 }}
                          >
                            View
                          </Button>
                          <Button 
                            variant="text" 
                            size="small"
                            startIcon={<Download />}
                          >
                            Download
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                )}
                
                {/* Transaction analysis */}
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Transaction Analysis
                    </Typography>
                    {getTransactionAnalysis(selectedTransaction).length > 0 ? (
                      <List dense>
                        {getTransactionAnalysis(selectedTransaction).map((item, index) => (
                          <ListItem key={index} sx={{ py: 0.5 }}>
                            <ListItemText 
                              primary={item} 
                              primaryTypographyProps={{ 
                                variant: 'body2',
                                color: item.includes('High risk') ? 'error.main' : 'text.primary'
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No analysis flags for this transaction.
                      </Typography>
                    )}
                  </CardContent>
                </Card>
                
                {/* Notes section */}
                {selectedTransaction.notes && (
                  <Card>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Notes
                      </Typography>
                      <Typography variant="body2">
                        {selectedTransaction.notes}
                      </Typography>
                    </CardContent>
                  </Card>
                )}
              </Grid>
              
              {/* Actions for pending transactions */}
              {selectedTransaction.status === 'pending' && (
                <Grid item xs={12} sx={{ mt: 2 }}>
                  <Box display="flex" justifyContent="space-between">
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<CheckCircle />}
                      onClick={() => {
                        setTransactionDetailsOpen(false);
                        handleOpenVerificationDialog(selectedTransaction);
                      }}
                    >
                      Verify
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setTransactionDetailsOpen(false);
                        handleOpenRejectionDialog(selectedTransaction);
                      }}
                    >
                      Reject
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransactionDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
      {/* Verification Dialog */}
      {selectedTransaction && (
        <Dialog
          open={verificationDialogOpen}
          onClose={() => setVerificationDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Verify Transaction</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to verify this transaction?
            </DialogContentText>
            
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Transaction Type
                </Typography>
                <Typography variant="body1" textTransform="capitalize">
                  {selectedTransaction.type.replace('_', ' ')}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Amount
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  ${selectedTransaction.amount.toLocaleString()}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  User
                </Typography>
                <Typography variant="body1">
                  {selectedTransaction.userName}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {formatDate(selectedTransaction.date)}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Verification Notes (Optional)"
                  value={verificationNote}
                  onChange={(e) => setVerificationNote(e.target.value)}
                  sx={{ mt: 2 }}
                  placeholder="Add any notes about this verification"
                />
              </Grid>
              
              {selectedTransaction.proofOfPayment && (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                    <Typography variant="body2">
                      Proof of Payment: {selectedTransaction.proofOfPayment}
                    </Typography>
                    <Button variant="outlined" size="small" startIcon={<Visibility />}>
                      View
                    </Button>
                  </Box>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVerificationDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={handleApproveTransaction}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <VerifiedUser />}
            >
              {loading ? 'Processing...' : 'Verify Transaction'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* Rejection Dialog */}
      {selectedTransaction && (
        <Dialog
          open={rejectionDialogOpen}
          onClose={() => setRejectionDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Reject Transaction</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Please provide a reason for rejecting this transaction:
            </DialogContentText>
            
            <TextField
              fullWidth
              multiline
              rows={3}
              label="Rejection Reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              required
              error={rejectReason === ''}
              helperText={rejectReason === '' ? 'Rejection reason is required' : ''}
              sx={{ mt: 2 }}
            />
            
            <Alert severity="warning" sx={{ mt: 2 }}>
              This action cannot be undone. The user will be notified of the rejection.
            </Alert>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectionDialogOpen(false)} disabled={loading}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleRejectTransaction}
              disabled={loading || rejectReason === ''}
              startIcon={loading ? <CircularProgress size={20} /> : <Block />}
            >
              {loading ? 'Processing...' : 'Reject Transaction'}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      
      {/* User Activity Dialog */}
      <Dialog
        open={userActivityOpen}
        onClose={() => setUserActivityOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>User Activity History</DialogTitle>
        <DialogContent>
          {userActivities.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>
              No activity found for this user.
            </Typography>
          ) : (
            <List>
              {userActivities.map((activity) => (
                <ListItem key={activity.id} sx={{ borderBottom: `1px solid ${theme.palette.divider}`, py: 2 }}>
                  <Box width="100%">
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle2">{activity.action}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(activity.timestamp)}
                      </Typography>
                    </Box>
                    {activity.details && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        {activity.details}
                      </Typography>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserActivityOpen(false)}>Close</Button>
        </DialogActions>
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
      
      {/* Analytics Dialog */}
      <Dialog
        open={analyticsDialogOpen}
        onClose={() => setAnalyticsDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Transaction Analytics</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Summary
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Pending Transactions" 
                        secondary={transactionAnalytics.totalPending} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Total Amount" 
                        secondary={`$${transactionAnalytics.totalAmount.toLocaleString()}`} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="High Risk Transactions" 
                        secondary={transactionAnalytics.highRisk} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    By Transaction Type
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Deposits" 
                        secondary={transactionAnalytics.byType.deposit} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Investments" 
                        secondary={transactionAnalytics.byType.investment} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Withdrawals" 
                        secondary={transactionAnalytics.byType.withdrawal} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    By Payment Method
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText 
                        primary="Bank Transfer" 
                        secondary={transactionAnalytics.byPaymentMethod.bank_transfer} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Cryptocurrency" 
                        secondary={transactionAnalytics.byPaymentMethod.cryptocurrency} 
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Credit Card" 
                        secondary={transactionAnalytics.byPaymentMethod.credit_card} 
                      />
                    </ListItem>
                  </List>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Card sx={{ mt: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Transaction Processing Time
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Average time to process transactions by type:
              </Typography>
              <Box sx={{ p: 2 }}>
                <Typography variant="body2">
                  Bank Transfer: 1.5 days
                </Typography>
                <Typography variant="body2">
                  Cryptocurrency: 0.5 days
                </Typography>
                <Typography variant="body2">
                  Credit Card: 0.1 days
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAnalyticsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Filter Menu */}
      <Menu
        anchorEl={filterMenuAnchorEl}
        open={Boolean(filterMenuAnchorEl)}
        onClose={handleFilterClose}
      >
        <MenuItem disabled>
          <Typography variant="subtitle2">Transaction Type</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSetFilter('type', 'deposit')}>
          <ListItemText primary="Deposit" />
          {filterType === 'deposit' && <CheckCircle fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => handleSetFilter('type', 'withdrawal')}>
          <ListItemText primary="Withdrawal" />
          {filterType === 'withdrawal' && <CheckCircle fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => handleSetFilter('type', 'investment')}>
          <ListItemText primary="Investment" />
          {filterType === 'investment' && <CheckCircle fontSize="small" color="primary" />}
        </MenuItem>
        <Divider />
        <MenuItem disabled>
          <Typography variant="subtitle2">Payment Method</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSetFilter('paymentMethod', 'bank_transfer')}>
          <ListItemText primary="Bank Transfer" />
          {filterPaymentMethod === 'bank_transfer' && <CheckCircle fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => handleSetFilter('paymentMethod', 'cryptocurrency')}>
          <ListItemText primary="Cryptocurrency" />
          {filterPaymentMethod === 'cryptocurrency' && <CheckCircle fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => handleSetFilter('paymentMethod', 'credit_card')}>
          <ListItemText primary="Credit Card" />
          {filterPaymentMethod === 'credit_card' && <CheckCircle fontSize="small" color="primary" />}
        </MenuItem>
        <Divider />
        <MenuItem disabled>
          <Typography variant="subtitle2">Risk Level</Typography>
        </MenuItem>
        <MenuItem onClick={() => handleSetFilter('riskLevel', 'high')}>
          <ListItemText primary="High Risk" />
          {filterRiskLevel === 'high' && <CheckCircle fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => handleSetFilter('riskLevel', 'medium')}>
          <ListItemText primary="Medium Risk" />
          {filterRiskLevel === 'medium' && <CheckCircle fontSize="small" color="primary" />}
        </MenuItem>
        <MenuItem onClick={() => handleSetFilter('riskLevel', 'low')}>
          <ListItemText primary="Low Risk" />
          {filterRiskLevel === 'low' && <CheckCircle fontSize="small" color="primary" />}
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleClearFilters}>
          <Typography color="error">Clear All Filters</Typography>
        </MenuItem>
      </Menu>
      
      {/* Details Menu */}
      <Menu
        anchorEl={detailsMenuAnchorEl}
        open={Boolean(detailsMenuAnchorEl)}
        onClose={handleDetailsMenuClose}
      >
        <MenuItem onClick={() => handleFlagTransaction(selectedTransaction?.id || '')}>
          <ListItemText primary={flaggedTransactions.includes(selectedTransaction?.id || '') ? 'Remove Flag' : 'Flag for Review'} />
        </MenuItem>
        <MenuItem onClick={() => {
          handleDetailsMenuClose();
          handleViewUserActivity(selectedTransaction?.userId || '');
        }}>
          <ListItemText primary="User History" />
        </MenuItem>
        <MenuItem onClick={handleDetailsMenuClose}>
          <ListItemText primary="Export Details" />
        </MenuItem>
      </Menu>
      
      {/* Batch Action Menu */}
      <Menu
        anchorEl={batchActionMenuAnchorEl}
        open={Boolean(batchActionMenuAnchorEl)}
        onClose={handleBatchActionClose}
      >
        <MenuItem onClick={handleBatchApprove}>
          <ListItemText primary="Approve Selected" />
        </MenuItem>
        <MenuItem onClick={handleBatchFlag}>
          <ListItemText primary="Flag Selected" />
        </MenuItem>
        <MenuItem onClick={() => {
          setSelectedTransactions([]);
          handleBatchActionClose();
        }}>
          <ListItemText primary="Clear Selection" />
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
    </Box>
  );
};

export default TransactionVerificationPanel;