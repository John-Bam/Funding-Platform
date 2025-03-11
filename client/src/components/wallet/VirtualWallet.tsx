// client/src/components/wallet/VirtualWallet.tsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Chip,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  IconButton,
  styled,
  Theme,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  ArrowUpward,
  ArrowDownward,
  AttachMoney,
  Refresh,
  UploadFile,
  Check,
  Close,
} from '@mui/icons-material';
import { Wallet, Transaction } from '../../types/types';

// Import API service from correct relative path
// During development, you may use a mock implementation
const walletService = {
  getWalletBalance: async (): Promise<{ success: boolean; data: Wallet }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        walletId: 'wallet_123',
        balance: 5000
      }
    };
  },
  getTransactions: async (): Promise<{ success: boolean; data: Transaction[] }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: [
        {
          id: 'tx_001',
          type: 'deposit',
          status: 'completed',
          amount: 2000,
          date: new Date().toISOString(),
          paymentMethod: 'bank_transfer',
          notes: 'Initial deposit'
        },
        {
          id: 'tx_002',
          type: 'withdrawal',
          status: 'pending',
          amount: 500,
          date: new Date().toISOString(),
          paymentMethod: 'bank_transfer',
          notes: 'Withdrawal request'
        }
      ]
    };
  },
  createDeposit: async (amount: number, paymentMethod: string): Promise<{ success: boolean; data: Transaction }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        id: `tx_dep_${Date.now()}`,
        type: 'deposit',
        status: 'pending',
        amount,
        date: new Date().toISOString(),
        paymentMethod,
        notes: `Deposit via ${paymentMethod}`
      }
    };
  },
  uploadProofOfPayment: async (transactionId: string, file: File): Promise<{ success: boolean; data: Transaction }> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return {
      success: true,
      data: {
        id: transactionId,
        type: 'deposit',
        status: 'verifying',
        amount: 1000,
        date: new Date().toISOString(),
        paymentMethod: 'bank_transfer',
        proofOfPayment: file.name,
        notes: 'Proof of payment uploaded'
      }
    };
  }
};

interface VirtualWalletProps {
  userId: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const GradientCard = styled(Card)(({ theme }: { theme: Theme }) => ({
  backgroundColor: 'rgba(40, 40, 40, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`wallet-tabpanel-${index}`}
      aria-labelledby={`wallet-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
};

const paymentMethods = [
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'crypto', label: 'Cryptocurrency' },
];

const VirtualWallet: React.FC<VirtualWalletProps> = ({ userId }) => {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Dialog states
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false);
  const [uploadProofDialogOpen, setUploadProofDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form states
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositMethod, setDepositMethod] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [withdrawMethod, setWithdrawMethod] = useState<string>('');
  const [accountDetails, setAccountDetails] = useState<string>('');
  
  // Success/error messages
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  
  // Fetch wallet data
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Get wallet balance
        const walletResponse = await walletService.getWalletBalance();
        setWallet(walletResponse.data);
        
        // Get transactions
        const transactionsResponse = await walletService.getTransactions();
        setTransactions(transactionsResponse.data);
      } catch (err) {
        console.error('Error fetching wallet data:', err);
        setError('Failed to load wallet data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [userId]);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleRefresh = async () => {
    try {
      setLoading(true);
      
      // Get wallet balance
      const walletResponse = await walletService.getWalletBalance();
      setWallet(walletResponse.data);
      
      // Get transactions
      const transactionsResponse = await walletService.getTransactions();
      setTransactions(transactionsResponse.data);
      
      setSuccessMessage('Wallet data refreshed');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error refreshing wallet data:', err);
      setError('Failed to refresh wallet data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDepositDialogOpen = () => {
    setDepositDialogOpen(true);
    setDepositAmount(0);
    setDepositMethod('');
    setActionError(null);
  };
  
  const handleDepositDialogClose = () => {
    setDepositDialogOpen(false);
  };
  
  const handleWithdrawDialogOpen = () => {
    setWithdrawDialogOpen(true);
    setWithdrawAmount(0);
    setWithdrawMethod('');
    setAccountDetails('');
    setActionError(null);
  };
  
  const handleWithdrawDialogClose = () => {
    setWithdrawDialogOpen(false);
  };
  
  const handleUploadDialogOpen = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setUploadProofDialogOpen(true);
    setSelectedFile(null);
    setActionError(null);
  };
  
  const handleUploadDialogClose = () => {
    setUploadProofDialogOpen(false);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  const handleCreateDeposit = async () => {
    if (depositAmount <= 0) {
      setActionError('Please enter a valid amount');
      return;
    }
    
    if (!depositMethod) {
      setActionError('Please select a payment method');
      return;
    }
    
    try {
      const response = await walletService.createDeposit(depositAmount, depositMethod);
      
      // Close dialog
      setDepositDialogOpen(false);
      
      // Show success message
      setSuccessMessage('Deposit request created successfully. Please upload proof of payment.');
      
      // Refresh transactions
      const transactionsResponse = await walletService.getTransactions();
      setTransactions(transactionsResponse.data);
      
      // Open upload proof dialog
      handleUploadDialogOpen(response.data.id);
    } catch (err) {
      console.error('Error creating deposit:', err);
      setActionError('Failed to create deposit. Please try again.');
    }
  };
  
  const handleUploadProof = async () => {
    if (!selectedTransaction || !selectedFile) {
      setActionError('Please select a file to upload');
      return;
    }
    
    try {
      await walletService.uploadProofOfPayment(selectedTransaction, selectedFile);
      
      // Close dialog
      setUploadProofDialogOpen(false);
      
      // Show success message
      setSuccessMessage('Proof of payment uploaded successfully');
      
      // Refresh transactions
      const transactionsResponse = await walletService.getTransactions();
      setTransactions(transactionsResponse.data);
    } catch (err) {
      console.error('Error uploading proof:', err);
      setActionError('Failed to upload proof of payment. Please try again.');
    }
  };
  
  const handleCreateWithdrawal = async () => {
    if (!wallet) return;
    
    if (withdrawAmount <= 0) {
      setActionError('Please enter a valid amount');
      return;
    }
    
    if (withdrawAmount > wallet.balance) {
      setActionError('Insufficient funds');
      return;
    }
    
    if (!withdrawMethod) {
      setActionError('Please select a withdrawal method');
      return;
    }
    
    if (!accountDetails) {
      setActionError('Please enter account details');
      return;
    }
    
    try {
      // This would be replaced with actual API call
      // await walletService.createWithdrawal(withdrawAmount, withdrawMethod, accountDetails);
      
      // Mock withdrawal for now
      console.log('Withdrawal request:', {
        amount: withdrawAmount,
        method: withdrawMethod,
        accountDetails
      });
      
      // Close dialog
      setWithdrawDialogOpen(false);
      
      // Show success message
      setSuccessMessage('Withdrawal request submitted successfully');
      
      // Refresh wallet data
      await handleRefresh();
    } catch (err) {
      console.error('Error creating withdrawal:', err);
      setActionError('Failed to submit withdrawal request. Please try again.');
    }
  };
  
  const getStatusChip = (status: string) => {
    let color = 'default';
    
    switch (status.toLowerCase()) {
      case 'completed':
        color = 'success';
        break;
      case 'pending':
        color = 'warning';
        break;
      case 'rejected':
        color = 'error';
        break;
      case 'verifying':
        color = 'info';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip
        label={status}
        color={color as "success" | "warning" | "error" | "info" | "default"}
        size="small"
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };
  
  const getTransactionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'deposit':
        return <ArrowUpward color="success" />;
      case 'withdrawal':
        return <ArrowDownward color="error" />;
      case 'investment':
        return <AttachMoney color="info" />;
      default:
        return <AttachMoney />;
    }
  };
  
  if (loading && !wallet) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <GradientCard>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Box display="flex" alignItems="center">
          <AccountBalanceWallet sx={{ fontSize: 30, mr: 1, color: '#7986CB' }} />
          <Typography variant="h5">Virtual Wallet</Typography>
        </Box>
        <IconButton onClick={handleRefresh} disabled={loading}>
          {loading ? <CircularProgress size={24} /> : <Refresh />}
        </IconButton>
      </Box>
      
      <Box 
        sx={{ 
          p: 3,
          borderRadius: 2,
          background: 'linear-gradient(135deg, #1976d2 0%, #512da8 100%)',
          mb: 3
        }}
      >
        <Typography variant="body2" color="white" gutterBottom>
          Available Balance
        </Typography>
        <Typography variant="h4" color="white" gutterBottom>
          ${wallet?.balance.toLocaleString() || '0.00'}
        </Typography>
        <Box display="flex" mt={2}>
          <Button
            variant="contained"
            color="success"
            startIcon={<ArrowUpward />}
            onClick={handleDepositDialogOpen}
            sx={{ mr: 1 }}
          >
            Deposit
          </Button>
          <Button
            variant="contained"
            color="error"
            startIcon={<ArrowDownward />}
            onClick={handleWithdrawDialogOpen}
            disabled={!wallet || wallet.balance <= 0}
          >
            Withdraw
          </Button>
        </Box>
      </Box>
      
      <Box>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Transactions" />
          <Tab label="Deposits" />
          <Tab label="Withdrawals" />
          <Tab label="Investments" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          {renderTransactions(transactions)}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          {renderTransactions(transactions.filter(t => t.type.toLowerCase() === 'deposit'))}
        </TabPanel>
        
        <TabPanel value={tabValue} index={2}>
          {renderTransactions(transactions.filter(t => t.type.toLowerCase() === 'withdrawal'))}
        </TabPanel>
        
        <TabPanel value={tabValue} index={3}>
          {renderTransactions(transactions.filter(t => t.type.toLowerCase() === 'investment'))}
        </TabPanel>
      </Box>
      
      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onClose={handleDepositDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Deposit Funds</DialogTitle>
        <DialogContent>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}
          
          <DialogContentText gutterBottom>
            Enter the amount you want to deposit and select a payment method.
          </DialogContentText>
          
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={depositAmount}
            onChange={(e) => setDepositAmount(Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { min: 1 }
            }}
            sx={{ mb: 2, mt: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="deposit-method-label">Payment Method</InputLabel>
            <Select
              labelId="deposit-method-label"
              value={depositMethod}
              onChange={(e) => setDepositMethod(e.target.value)}
              label="Payment Method"
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <DialogContentText variant="body2" color="text.secondary">
            After submitting your deposit request, you will need to upload proof of payment.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDepositDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateDeposit}
            variant="contained"
            color="primary"
            disabled={depositAmount <= 0 || !depositMethod}
          >
            Create Deposit
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Upload Proof Dialog */}
      <Dialog open={uploadProofDialogOpen} onClose={handleUploadDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Proof of Payment</DialogTitle>
        <DialogContent>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}
          
          <DialogContentText gutterBottom>
            Please upload proof of your payment (receipt, screenshot, etc.)
          </DialogContentText>
          
          <Box sx={{ mt: 2, mb: 2 }}>
            <input
              accept="image/*,application/pdf"
              style={{ display: 'none' }}
              id="upload-file-button"
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="upload-file-button">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadFile />}
                sx={{ mb: 1 }}
              >
                Select File
              </Button>
            </label>
            
            {selectedFile && (
              <Typography variant="body2">
                Selected: {selectedFile.name}
              </Typography>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleUploadDialogClose}>Cancel</Button>
          <Button
            onClick={handleUploadProof}
            variant="contained"
            color="primary"
            disabled={!selectedFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Withdraw Dialog */}
      <Dialog open={withdrawDialogOpen} onClose={handleWithdrawDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Withdraw Funds</DialogTitle>
        <DialogContent>
          {actionError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {actionError}
            </Alert>
          )}
          
          <DialogContentText gutterBottom>
            Enter the amount you want to withdraw and your account details.
          </DialogContentText>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, mt: 2 }}>
            <Typography variant="body2" mr={1}>
              Available:
            </Typography>
            <Typography variant="body1" fontWeight="bold">
              ${wallet?.balance.toLocaleString() || '0.00'}
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(Number(e.target.value))}
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>,
              inputProps: { min: 1, max: wallet?.balance || 0 }
            }}
            sx={{ mb: 2 }}
          />
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="withdraw-method-label">Withdrawal Method</InputLabel>
            <Select
              labelId="withdraw-method-label"
              value={withdrawMethod}
              onChange={(e) => setWithdrawMethod(e.target.value)}
              label="Withdrawal Method"
            >
              {paymentMethods.map((method) => (
                <MenuItem key={method.value} value={method.value}>
                  {method.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            fullWidth
            label="Account Details"
            multiline
            rows={3}
            value={accountDetails}
            onChange={(e) => setAccountDetails(e.target.value)}
            placeholder="Enter account details for the withdrawal (account number, wallet address, etc.)"
            sx={{ mb: 2 }}
          />
          
          <DialogContentText variant="body2" color="text.secondary">
            Withdrawal requests are typically processed within 1-3 business days.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleWithdrawDialogClose}>Cancel</Button>
          <Button
            onClick={handleCreateWithdrawal}
            variant="contained"
            color="primary"
            disabled={withdrawAmount <= 0 || withdrawAmount > (wallet?.balance || 0) || !withdrawMethod || !accountDetails}
          >
            Submit Withdrawal
          </Button>
        </DialogActions>
      </Dialog>
    </GradientCard>
  );
  
  function renderTransactions(transactionList: Transaction[]) {
    if (transactionList.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            No transactions found
          </Typography>
        </Box>
      );
    }
    
    return (
      <List sx={{ width: '100%' }}>
        {transactionList.map((transaction) => (
          <React.Fragment key={transaction.id}>
            <ListItem 
              alignItems="flex-start"
              secondaryAction={
                transaction.type.toLowerCase() === 'deposit' && 
                transaction.status.toLowerCase() === 'pending' && (
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<UploadFile />}
                    onClick={() => handleUploadDialogOpen(transaction.id)}
                  >
                    Upload Proof
                  </Button>
                )
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: 'transparent' }}>
                  {getTransactionIcon(transaction.type)}
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="subtitle1">
                      {transaction.type}{transaction.project ? ` - ${transaction.project}` : ''}
                    </Typography>
                    <Typography 
                      variant="subtitle1" 
                      color={transaction.type.toLowerCase() === 'deposit' ? 'success.main' : 
                            (transaction.type.toLowerCase() === 'withdrawal' ? 'error.main' : 'info.main')}
                    >
                      {transaction.type.toLowerCase() === 'withdrawal' ? '-' : '+'} 
                      ${transaction.amount.toLocaleString()}
                    </Typography>
                  </Box>
                }
                secondary={
                  <>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary" component="span">
                        {new Date(transaction.date).toLocaleString()}
                      </Typography>
                      {getStatusChip(transaction.status)}
                    </Box>
                    <Typography variant="body2" color="text.secondary">
                      {transaction.notes}
                    </Typography>
                  </>
                }
              />
            </ListItem>
            <Divider variant="inset" component="li" />
          </React.Fragment>
        ))}
      </List>
    );
  }
};

export default VirtualWallet;