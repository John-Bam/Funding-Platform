import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
  CircularProgress,
  styled,
  useTheme,
  SelectChangeEvent,
} from '@mui/material';
import {
  AccountBalanceWallet,
  Add,
  Send,
  ArrowUpward,
  ArrowDownward,
  Receipt,
  AttachFile,
  CheckCircle,
  Cancel,
  Description,
  CloudUpload,
} from '@mui/icons-material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

// Mock transaction data
const mockTransactions = [
  {
    id: 'txn_001',
    type: 'deposit',
    amount: 10000,
    date: '2025-03-01',
    status: 'completed',
    paymentMethod: 'bank_transfer',
    proofOfPayment: 'payment_receipt.pdf',
  },
  {
    id: 'txn_002',
    type: 'investment',
    amount: 5000,
    date: '2025-03-05',
    status: 'completed',
    project: 'Smart Agriculture System',
    projectId: 'proj_001',
  },
  {
    id: 'txn_003',
    type: 'deposit',
    amount: 15000,
    date: '2025-03-08',
    status: 'pending',
    paymentMethod: 'cryptocurrency',
    proofOfPayment: 'crypto_transfer.png',
  },
  {
    id: 'txn_004',
    type: 'investment',
    amount: 7500,
    date: '2025-03-10',
    status: 'pending',
    project: 'Clean Water Initiative',
    projectId: 'proj_002',
  },
];

// Types for wallet and transactions
type TransactionStatus = 'pending' | 'verifying' | 'completed' | 'rejected';
type TransactionType = 'deposit' | 'withdrawal' | 'investment';
type PaymentMethod = 'bank_transfer' | 'cryptocurrency' | 'credit_card';

interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  date: string;
  status: TransactionStatus;
  paymentMethod?: PaymentMethod;
  proofOfPayment?: string;
  project?: string;
  projectId?: string;
}

interface VirtualWalletProps {
  userId: string;
}

const VirtualWallet: React.FC<VirtualWalletProps> = ({ userId }) => {
  const theme = useTheme();
  
  // State for wallet and transactions
  const [balance, setBalance] = useState(12500);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  
  // Dialog states
  const [depositDialogOpen, setDepositDialogOpen] = useState(false);
  const [transactionDetailsOpen, setTransactionDetailsOpen] = useState(false);
  const [proofUploadOpen, setProofUploadOpen] = useState(false);
  
  // Form states
  const [depositAmount, setDepositAmount] = useState(1000);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Handle opening transaction details
  const handleViewTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setTransactionDetailsOpen(true);
  };
  
  // Handle deposit dialog
  const handleOpenDepositDialog = () => {
    setDepositDialogOpen(true);
  };
  
  const handleCloseDepositDialog = () => {
    setDepositDialogOpen(false);
    setDepositAmount(1000);
    setPaymentMethod('bank_transfer');
  };
  
  // Handle payment method change
  const handlePaymentMethodChange = (event: SelectChangeEvent<PaymentMethod>) => {
    setPaymentMethod(event.target.value as PaymentMethod);
  };
  
  // Handle proof upload
  const handleOpenProofUpload = () => {
    setDepositDialogOpen(false);
    setProofUploadOpen(true);
  };
  
  const handleCloseProofUpload = () => {
    setProofUploadOpen(false);
    setProofFile(null);
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setProofFile(event.target.files[0]);
    }
  };
  
  // Handle submit deposit with proof
  const handleSubmitDeposit = async () => {
    if (!proofFile) return;
    
    setLoading(true);
    
    try {
      // In a real app, this would upload the file and create a transaction in the backend
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add new transaction to state
      const newTransaction: Transaction = {
        id: `txn_${Date.now()}`,
        type: 'deposit',
        amount: depositAmount,
        date: new Date().toISOString().split('T')[0],
        status: 'pending',
        paymentMethod: paymentMethod,
        proofOfPayment: proofFile.name,
      };
      
      setTransactions([newTransaction, ...transactions]);
      
      // Close dialog and reset states
      setProofUploadOpen(false);
      setProofFile(null);
      setDepositAmount(1000);
      setPaymentMethod('bank_transfer');
    } catch (error) {
      console.error('Error submitting deposit:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Get status color for chips
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
        return <Send color="primary" />;
      default:
        return <Description />;
    }
  };
  
  return (
    <>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box display="flex" alignItems="center">
              <AccountBalanceWallet fontSize="large" color="primary" sx={{ mr: 2 }} />
              <Box>
                <Typography variant="h6" color="text.secondary">
                  Wallet Balance
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  ${balance.toLocaleString()}
                </Typography>
              </Box>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={handleOpenDepositDialog}
            >
              Add Funds
            </Button>
          </Box>
          <GradientDivider />
          <Typography variant="subtitle1" sx={{ mb: 2 }}>
            Recent Transactions
          </Typography>
          <List sx={{ maxHeight: 320, overflow: 'auto' }}>
            {transactions.map((transaction) => (
              <ListItem
                key={transaction.id}
                sx={{ 
                  mb: 1, 
                  backgroundColor: 'rgba(255, 255, 255, 0.03)', 
                  borderRadius: 2,
                  cursor: 'pointer',
                }}
                onClick={() => handleViewTransaction(transaction)}
                secondaryAction={
                  <Chip 
                    label={transaction.status} 
                    color={getStatusColor(transaction.status)}
                    size="small"
                  />
                }
              >
                <Box display="flex" alignItems="center" width="100%">
                  <IconButton
                    size="small"
                    sx={{ 
                      mr: 1,
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    {getTransactionIcon(transaction.type)}
                  </IconButton>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="body2" fontWeight="medium">
                          {transaction.type === 'investment' 
                            ? `Investment in ${transaction.project}` 
                            : `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={transaction.type === 'deposit' ? 'success.main' : 'primary.main'}
                          fontWeight="bold"
                        >
                          {transaction.type === 'withdrawal' ? '-' : '+'}{transaction.amount.toLocaleString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="caption" color="text.secondary">
                          {new Date(transaction.date).toLocaleDateString()}
                        </Typography>
                        {transaction.paymentMethod && (
                          <Typography variant="caption" color="text.secondary">
                            {transaction.paymentMethod.replace('_', ' ')}
                          </Typography>
                        )}
                      </Box>
                    }
                  />
                </Box>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
      
      {/* Deposit Dialog */}
      <Dialog open={depositDialogOpen} onClose={handleCloseDepositDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Add Funds to Wallet</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount (USD)"
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 100 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="payment-method-label">Payment Method</InputLabel>
                <Select
                  labelId="payment-method-label"
                  value={paymentMethod}
                  onChange={handlePaymentMethodChange}
                  label="Payment Method"
                >
                  <MenuItem value="bank_transfer">Bank Transfer</MenuItem>
                  <MenuItem value="cryptocurrency">Cryptocurrency</MenuItem>
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary">
                Please note that funds will only be credited to your wallet after verification of your payment. 
                You will need to upload proof of payment in the next step.
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDepositDialog}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenProofUpload}
            disabled={depositAmount < 100}
          >
            Continue
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Proof Upload Dialog */}
      <Dialog open={proofUploadOpen} onClose={handleCloseProofUpload} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Proof of Payment</DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Amount: ${depositAmount.toLocaleString()}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Payment Method: {paymentMethod.replace('_', ' ')}
              </Typography>
              <GradientDivider />
            </Grid>
            
            {paymentMethod === 'bank_transfer' && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Please make a bank transfer to the following account:
                </Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">Bank: Global Investment Bank</Typography>
                  <Typography variant="body2">Account Name: InnoCap Forge Ltd</Typography>
                  <Typography variant="body2">Account Number: 1234567890</Typography>
                  <Typography variant="body2">Routing Number: 987654321</Typography>
                  <Typography variant="body2">Reference: INV-{userId.substring(0, 8)}</Typography>
                </Box>
              </Grid>
            )}
            
            {paymentMethod === 'cryptocurrency' && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Please send cryptocurrency to the following wallet address:
                </Typography>
                <Box 
                  sx={{ 
                    p: 2, 
                    backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                    borderRadius: 1,
                    mb: 2,
                  }}
                >
                  <Typography variant="body2">Bitcoin (BTC): 3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5</Typography>
                  <Typography variant="body2">Ethereum (ETH): 0x89205A3A3b2A69De6Dbf7f01ED13B2108B2c43e7</Typography>
                  <Typography variant="body2">
                    Memo/Reference: INV-{userId.substring(0, 8)}
                  </Typography>
                </Box>
              </Grid>
            )}
            
            {paymentMethod === 'credit_card' && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  You'll be redirected to our secure payment gateway after uploading the required documents.
                </Typography>
              </Grid>
            )}
            
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Upload proof of payment:
              </Typography>
              
              <Box 
                sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  p: 3,
                  border: `2px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 255, 255, 0.03)',
                  textAlign: 'center',
                }}
              >
                {!proofFile ? (
                  <>
                    <CloudUpload fontSize="large" color="primary" sx={{ mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Drag and drop a file here, or click to select
                    </Typography>
                    <Button
                      component="label"
                      variant="outlined"
                      startIcon={<AttachFile />}
                      sx={{ mt: 2 }}
                    >
                      Select File
                      <VisuallyHiddenInput 
                        type="file" 
                        onChange={handleFileChange}
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
                      />
                    </Button>
                  </>
                ) : (
                  <>
                    <CheckCircle fontSize="large" color="success" sx={{ mb: 2 }} />
                    <Typography variant="body1" gutterBottom>
                      {proofFile.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {(proofFile.size / 1024).toFixed(2)} KB
                    </Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Cancel />}
                      onClick={() => setProofFile(null)}
                      sx={{ mt: 2 }}
                    >
                      Remove
                    </Button>
                  </>
                )}
              </Box>
              
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                Accepted file formats: JPG, PNG, PDF, DOC. Maximum file size: 5MB
              </Typography>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProofUpload}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmitDeposit}
            disabled={!proofFile || loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Submitting...' : 'Submit Payment'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Transaction Details Dialog */}
      {selectedTransaction && (
        <Dialog 
          open={transactionDetailsOpen} 
          onClose={() => setTransactionDetailsOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Transaction Details
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
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
                    <Box display="flex" alignItems="center">
                      <Chip 
                        label={selectedTransaction.status} 
                        color={getStatusColor(selectedTransaction.status)}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {new Date(selectedTransaction.date).toLocaleDateString()}
                      </Typography>
                    </Box>
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
                <Typography 
                  variant="body1"
                  color={selectedTransaction.type === 'deposit' ? 'success.main' : 'primary.main'}
                  fontWeight="bold"
                >
                  ${selectedTransaction.amount.toLocaleString()}
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
              
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Date
                </Typography>
                <Typography variant="body1">
                  {new Date(selectedTransaction.date).toLocaleDateString()}
                </Typography>
              </Grid>
              
              {selectedTransaction.paymentMethod && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Method
                  </Typography>
                  <Typography variant="body1" textTransform="capitalize">
                    {selectedTransaction.paymentMethod.replace('_', ' ')}
                  </Typography>
                </Grid>
              )}
              
              {selectedTransaction.project && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Project
                  </Typography>
                  <Typography variant="body1">
                    {selectedTransaction.project}
                  </Typography>
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
                    <Button 
                      variant="text" 
                      sx={{ ml: 'auto' }}
                      size="small"
                    >
                      View
                    </Button>
                  </Box>
                </Grid>
              )}
              
              {selectedTransaction.status === 'pending' && (
                <Grid item xs={12}>
                  <Alert 
                    severity="info"
                    sx={{ mt: 1 }}
                  >
                    This transaction is pending verification. You will be notified once it's processed.
                  </Alert>
                </Grid>
              )}
              
              {selectedTransaction.status === 'rejected' && (
                <Grid item xs={12}>
                  <Alert 
                    severity="error"
                    sx={{ mt: 1 }}
                  >
                    This transaction was rejected. Please contact support for more information.
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setTransactionDetailsOpen(false)}>Close</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default VirtualWallet;