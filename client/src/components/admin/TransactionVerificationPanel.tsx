import React, { useState } from 'react';
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
} from '@mui/icons-material';

// Styled components
const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
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
  },
];

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
  
  // All transactions based on status
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>(mockPendingTransactions);
  const [completedTransactions, setCompletedTransactions] = useState<Transaction[]>(mockCompletedTransactions);
  const [rejectedTransactions, setRejectedTransactions] = useState<Transaction[]>(mockRejectedTransactions);
  
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
  };
  
  // Handle opening rejection dialog
  const handleOpenRejectionDialog = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setRejectionDialogOpen(true);
    setTransactionDetailsOpen(false);
  };
  
  // Handle approving a transaction
  const handleApproveTransaction = () => {
    if (!selectedTransaction) return;
    
    // In a real app, this would make an API call to update the transaction status
    
    // Update local state
    const updatedTransaction = {
      ...selectedTransaction,
      status: 'completed' as TransactionStatus,
      notes: verificationNote || 'Verified by admin',
    };
    
    // Remove from pending and add to completed
    setPendingTransactions(pendingTransactions.filter(t => t.id !== selectedTransaction.id));
    setCompletedTransactions([updatedTransaction, ...completedTransactions]);
    
    // Close dialog and reset state
    setVerificationDialogOpen(false);
    setSelectedTransaction(null);
    setVerificationNote('');
  };
  
  // Handle rejecting a transaction
  const handleRejectTransaction = () => {
    if (!selectedTransaction || !rejectReason) return;
    
    // In a real app, this would make an API call to update the transaction status
    
    // Update local state
    const updatedTransaction = {
      ...selectedTransaction,
      status: 'rejected' as TransactionStatus,
      notes: rejectReason,
    };
    
    // Remove from pending and add to rejected
    setPendingTransactions(pendingTransactions.filter(t => t.id !== selectedTransaction.id));
    setRejectedTransactions([updatedTransaction, ...rejectedTransactions]);
    
    // Close dialog and reset state
    setRejectionDialogOpen(false);
    setSelectedTransaction(null);
    setRejectReason('');
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
            label={`Pending (${pendingTransactions.length})`} 
            icon={<Receipt />} 
            iconPosition="start" 
          />
          <Tab 
            label={`Completed (${completedTransactions.length})`} 
            icon={<CheckCircle />} 
            iconPosition="start" 
          />
          <Tab 
            label={`Rejected (${rejectedTransactions.length})`} 
            icon={<Cancel />} 
            iconPosition="start" 
          />
        </Tabs>
        
        {/* Pending Transactions */}
        <TabPanel value={tabValue} index={0}>
          {pendingTransactions.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No pending transactions to verify
              </Typography>
            </Box>
          ) : (
            <List>
              {pendingTransactions.map((transaction) => (
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
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
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
                            {new Date(transaction.date).toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={transaction.status}
                            color={getStatusColor(transaction.status)}
                            size="small"
                          />
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
                    >
                      Verify
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<Cancel />}
                      onClick={() => handleOpenRejectionDialog(transaction)}
                    >
                      Reject
                    </Button>
                    <IconButton
                      sx={{ ml: 1 }}
                      onClick={() => handleViewTransaction(transaction)}
                    >
                      <Visibility />
                    </IconButton>
                  </Box>
                </ListItem>
              ))}
            </List>
          )}
        </TabPanel>
        
        {/* Completed Transactions */}
        <TabPanel value={tabValue} index={1}>
          {completedTransactions.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No completed transactions to show
              </Typography>
            </Box>
          ) : (
            <List>
              {completedTransactions.map((transaction) => (
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
                    <Avatar sx={{ bgcolor: theme.palette.success.main }}>
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
                            {new Date(transaction.date).toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={transaction.status}
                            color={getStatusColor(transaction.status)}
                            size="small"
                          />
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
        </TabPanel>
        
        {/* Rejected Transactions */}
        <TabPanel value={tabValue} index={2}>
          {rejectedTransactions.length === 0 ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="body1" color="text.secondary">
                No rejected transactions to show
              </Typography>
            </Box>
          ) : (
            <List>
              {rejectedTransactions.map((transaction) => (
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
                            {new Date(transaction.date).toLocaleDateString()}
                          </Typography>
                          <Chip
                            label={transaction.status}
                            color={getStatusColor(transaction.status)}
                            size="small"
                          />
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
        </TabPanel>
      </Paper>
      
      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog
          open={transactionDetailsOpen}
          onClose={() => setTransactionDetailsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Transaction Details</DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <Avatar 
                    sx={{ 
                      bgcolor: selectedTransaction.status === 'completed'
                        ? theme.palette.success.main
                        : selectedTransaction.status === 'rejected'
                        ? theme.palette.error.main
                        : theme.palette.primary.main,
                      mr: 2,
                    }}
                  >
                    {getTransactionIcon(selectedTransaction.type)}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">
                      {selectedTransaction.type === 'investment' 
                        ? `Investment in ${selectedTransaction.project}` 
                        : `${selectedTransaction.type.charAt(0).toUpperCase() + selectedTransaction.type.slice(1)}`}
                    </Typography>
                    <Chip
                      label={selectedTransaction.status}
                      color={getStatusColor(selectedTransaction.status)}
                      size="small"
                    />
                  </Box>
                </Box>
                <GradientDivider />
              </Grid>
              
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
                  User
                </Typography>
                <Typography variant="body1">
                  {selectedTransaction.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  User ID: {selectedTransaction.userId}
                </Typography>
              </Grid>
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedTransaction.date).toLocaleDateString()}
                </Typography>
              </Grid>
              
              <Grid item xs={12}>
                <GradientDivider />
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
              
              {selectedTransaction.proofOfPayment && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
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
                    <Button variant="text" sx={{ ml: 'auto' }} startIcon={<Download />}>
                      Download
                    </Button>
                  </Box>
                </Grid>
              )}
              
              {selectedTransaction.notes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Notes
                  </Typography>
                  <Paper
                    sx={{
                      p: 2,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 1,
                      mt: 1,
                    }}
                  >
                    <Typography variant="body2">
                      {selectedTransaction.notes}
                    </Typography>
                  </Paper>
                </Grid>
              )}
              
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
                  {new Date(selectedTransaction.date).toLocaleDateString()}
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
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setVerificationDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="success"
              onClick={handleApproveTransaction}
            >
              Verify Transaction
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
            <Button onClick={() => setRejectionDialogOpen(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="error"
              onClick={handleRejectTransaction}
              disabled={rejectReason === ''}
            >
              Reject Transaction
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Box>
  );
};

export default TransactionVerificationPanel;