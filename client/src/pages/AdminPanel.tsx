import React, { useState } from 'react';
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
  useTheme,
  styled,
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

// Sample data for the admin panel
const pendingUsers = [
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
];

const pendingProjects = [
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
];

const pendingMilestones = [
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
];

const pendingEscrow = [
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
];

// Mock messages that need admin attention
const pendingMessages = [
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
];

const AdminPanel: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [currentMenuItemId, setCurrentMenuItemId] = useState<string | null>(null);
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, itemId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setCurrentMenuItemId(itemId);
  };
  
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setCurrentMenuItemId(null);
  };
  
  const handleActionDialogOpen = (item: any, action: 'approve' | 'reject') => {
    setSelectedItem(item);
    setActionType(action);
    setActionDialogOpen(true);
    handleMenuClose();
  };
  
  const handleActionDialogClose = () => {
    setActionDialogOpen(false);
    setSelectedItem(null);
  };
  
  const handleAction = () => {
    // In a real app, this would make an API call to approve or reject the item
    console.log(`${actionType === 'approve' ? 'Approved' : 'Rejected'} item:`, selectedItem);
    handleActionDialogClose();
  };

  const handleMessageOpen = (message: any) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
  };
  
  const handleMessageClose = () => {
    setMessageDialogOpen(false);
    setSelectedMessage(null);
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
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          aria-label="admin panel tabs"
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Tab label="User Verification" />
          <Tab label="Project Approval" />
          <Tab label="Milestone Verification" />
          <Tab label="Escrow Management" />
          <Tab label="Transaction Verification" />
          <Tab label="Messages" />
        </Tabs>
        
        {/* User Verification Tab */}
        <TabPanel value={tabValue} index={0}>
          <List>
            {pendingUsers.map((user) => (
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
                          Registered: {new Date(user.registeredDate).toLocaleDateString()}
                        </Typography>
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
        </TabPanel>
        
        {/* Project Approval Tab */}
        <TabPanel value={tabValue} index={1}>
          <Grid container spacing={3}>
            {pendingProjects.map((project) => (
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
                          {new Date(project.submittedDate).toLocaleDateString()}
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
        </TabPanel>
        
        {/* Milestone Verification Tab */}
        <TabPanel value={tabValue} index={2}>
          <List>
            {pendingMilestones.map((milestone) => (
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
                          Submitted by {milestone.innovator} on {new Date(milestone.submittedDate).toLocaleDateString()}
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
        </TabPanel>
        
        {/* Escrow Management Tab */}
        <TabPanel value={tabValue} index={3}>
          <List>
            {pendingEscrow.map((escrow) => (
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
                          Requested: {new Date(escrow.requestDate).toLocaleDateString()}
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
        </TabPanel>
        
        {/* Transaction Verification Tab */}
        <TabPanel value={tabValue} index={4}>
          <TransactionVerificationPanel />
        </TabPanel>

        {/* Messages Tab */}
        <TabPanel value={tabValue} index={5}>
          <List>
            {pendingMessages.map((message) => (
              <ListItem
                key={message.id}
                sx={{
                  mb: 2,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 2,
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
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
                          {new Date(message.received).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </>
                  }
                />
              </ListItem>
            ))}
          </List>
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
          <DialogContentText>
            {actionType === 'approve' 
              ? 'Are you sure you want to approve this item? This action cannot be undone.'
              : 'Are you sure you want to reject this item? This action cannot be undone.'}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleActionDialogClose}>Cancel</Button>
          <Button 
            onClick={handleAction} 
            variant="contained" 
            color={actionType === 'approve' ? 'success' : 'error'}
            autoFocus
          >
            {actionType === 'approve' ? 'Approve' : 'Reject'}
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
                <strong>Received:</strong> {new Date(selectedMessage.received).toLocaleString()}
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
              >
                Reply
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Item Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => currentMenuItemId && handleActionDialogOpen(
          pendingProjects.find(p => p.id === currentMenuItemId) || 
          pendingUsers.find(u => u.id === currentMenuItemId) ||
          pendingMilestones.find(m => m.id === currentMenuItemId) ||
          pendingEscrow.find(e => e.id === currentMenuItemId),
          'approve'
        )}>
          <ListItemAvatar>
            <CheckCircle fontSize="small" color="success" />
          </ListItemAvatar>
          <ListItemText primary="Approve" />
        </MenuItem>
        <MenuItem onClick={() => currentMenuItemId && handleActionDialogOpen(
          pendingProjects.find(p => p.id === currentMenuItemId) || 
          pendingUsers.find(u => u.id === currentMenuItemId) ||
          pendingMilestones.find(m => m.id === currentMenuItemId) ||
          pendingEscrow.find(e => e.id === currentMenuItemId),
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
    </AppLayout>
  );
};

export default AdminPanel;