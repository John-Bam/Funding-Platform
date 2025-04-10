import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  useTheme,
  Chip,
  styled,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
} from '@mui/material';
import {
  AttachMoney,
  TrendingUp,
  Assignment,
  CheckCircle,
  MoreVert,
  Business,
  Visibility,
  People,
  Person as PersonIcon,
  Reply,
  Close,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

// Layout component
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import VirtualWallet from '../components/wallet/VirtualWallet';

// Styled components
const GlassCard = styled(Card)(({ theme }) => ({
  backgroundColor: 'rgba(40, 40, 40, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  border: `1px solid ${theme.palette.divider}`,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.2)',
  },
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  backgroundColor: 'rgba(40, 40, 40, 0.7)',
  backdropFilter: 'blur(10px)',
  border: `1px solid ${theme.palette.divider}`,
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
}));

const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

// Sample data
const fundingData = [
  { month: 'Jan', amount: 12000 },
  { month: 'Feb', amount: 19000 },
  { month: 'Mar', amount: 15000 },
  { month: 'Apr', amount: 28000 },
  { month: 'May', amount: 32000 },
  { month: 'Jun', amount: 38000 },
  { month: 'Jul', amount: 42000 },
];

const projectStatusData = [
  { name: 'Seeking Funding', value: 5 },
  { name: 'In Progress', value: 7 },
  { name: 'Completed', value: 3 },
];

const milestoneData = [
  { month: 'Jan', completed: 3, pending: 2 },
  { month: 'Feb', completed: 4, pending: 3 },
  { month: 'Mar', completed: 5, pending: 2 },
  { month: 'Apr', completed: 6, pending: 1 },
  { month: 'May', completed: 4, pending: 3 },
  { month: 'Jun', completed: 7, pending: 2 },
];

const recentProjects = [
  {
    id: 'proj_001',
    title: 'Smart Agriculture System',
    status: 'seeking_funding',
    funding: '20%',
    category: 'AgriTech',
  },
  {
    id: 'proj_002',
    title: 'Clean Water Initiative',
    status: 'in_progress',
    funding: '75%',
    category: 'CleanTech',
  },
  {
    id: 'proj_003',
    title: 'Solar Micro-Grids',
    status: 'fully_funded',
    funding: '100%',
    category: 'Energy',
  },
];

const upcomingMilestones = [
  {
    id: 'mile_001',
    project: 'Smart Agriculture System',
    description: 'Develop prototype',
    dueDate: '2025-04-15',
  },
  {
    id: 'mile_002',
    project: 'Clean Water Initiative',
    description: 'Field testing phase',
    dueDate: '2025-04-10',
  },
  {
    id: 'mile_003',
    project: 'Solar Micro-Grids',
    description: 'Manufacturing setup',
    dueDate: '2025-04-22',
  },
];

// Sample messages for the dashboard
const recentMessages = [
  {
    id: 'msg_001',
    from: 'Admin',
    fromId: 'user_001',
    subject: 'Your project has been approved',
    content: 'Congratulations! Your project "Smart Agriculture System" has been approved and is now seeking funding.',
    received: '2025-03-08',
    read: false,
  },
  {
    id: 'msg_002',
    from: 'Sarah Johnson',
    fromId: 'user_002',
    subject: 'Question about your project',
    content: 'Hello, I\'m interested in investing in your Clean Water Initiative. Could you provide more details about your implementation timeline?',
    received: '2025-03-09',
    read: true,
  },
  {
    id: 'msg_003',
    from: 'System',
    fromId: 'system',
    subject: 'Milestone deadline approaching',
    content: 'Your milestone "Develop prototype" for Smart Agriculture System is due in 7 days. Please ensure you\'re on track to meet this deadline.',
    received: '2025-03-10',
    read: false,
  },
];
const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');

  const COLORS = [theme.palette.primary.main, theme.palette.secondary.main, theme.palette.tertiary.main];

  const handleMessageOpen = (message: any) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
  };
  
  const handleMessageClose = () => {
    setMessageDialogOpen(false);
    setSelectedMessage(null);
  };
  
  const handleReplyOpen = () => {
    setMessageDialogOpen(false);
    setReplyDialogOpen(true);
  };
  
  const handleReplyClose = () => {
    setReplyDialogOpen(false);
    setReplyContent('');
  };
  
  const handleSendReply = () => {
    if (!replyContent.trim() || !selectedMessage) return;
    
    // In a real app, this would call an API to send the message
    console.log('Replying to:', selectedMessage.from, 'Content:', replyContent);
    
    // Close dialog and reset state
    setReplyDialogOpen(false);
    setReplyContent('');
    setSelectedMessage(null);
  };

  // Content based on user role
  const renderRoleSpecificContent = () => {
    switch (user?.role) {
      case 'Innovator':
        return renderInnovatorDashboard();
      case 'Investor':
        return renderInvestorDashboard();
      case 'Admin':
      case 'EscrowManager':
        return renderAdminDashboard();
      default:
        return null;
    }
  };
  const renderInnovatorDashboard = () => (
    <Grid container spacing={3}>
      {/* Stats */}
      <Grid item xs={12} md={4}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Total Funding
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 46,
                height: 46,
              }}
            >
              <AttachMoney />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            $142,000
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              +12.5% from last month
            </Typography>
          </Box>
        </StatCard>
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Active Projects
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.secondary.main,
                width: 46,
                height: 46,
              }}
            >
              <Business />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            7
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              +2 new this quarter
            </Typography>
          </Box>
        </StatCard>
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Completed Milestones
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.tertiary.main,
                width: 46,
                height: 46,
              }}
            >
              <CheckCircle />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            18
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              3 recent approvals
            </Typography>
          </Box>
        </StatCard>
      </Grid>

      {/* Messages section */}
      <Grid item xs={12}>
        <GlassCard>
          <CardHeader 
            title="Recent Messages" 
            action={
              <Button variant="outlined" size="small">View All</Button>
            }
          />
          <GradientDivider />
          <CardContent sx={{ maxHeight: 250, overflow: 'auto' }}>
            <List>
              {recentMessages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    mb: 1,
                    backgroundColor: message.read ? 'rgba(255, 255, 255, 0.03)' : 'rgba(30, 136, 229, 0.08)',
                    borderRadius: 1,
                    borderLeft: message.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleMessageOpen(message)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {message.from.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight={message.read ? 'normal' : 'bold'}>
                          {message.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.received).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          fontWeight: message.read ? 'normal' : 'medium',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {message.content}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Funding Chart */}
      <Grid item xs={12} md={8}>
        <GlassCard>
          <CardHeader title="Funding Overview" />
          <GradientDivider />
          <CardContent sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fundingData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                  }} 
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={theme.palette.primary.main}
                  activeDot={{ r: 8 }}
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Milestone Tracking */}
      <Grid item xs={12} md={4}>
        <GlassCard>
          <CardHeader title="Upcoming Milestones" />
          <GradientDivider />
          <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
            <List>
              {upcomingMilestones.map((milestone) => (
                <ListItem
                  key={milestone.id}
                  sx={{
                    mb: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                  }}
                >
                  <ListItemText
                    primary={milestone.description}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {milestone.project}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                  <Button variant="outlined" size="small">
                    Submit
                  </Button>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </GlassCard>
      </Grid>
      
      {/* Project List */}
      <Grid item xs={12}>
        <GlassCard>
          <CardHeader
            title="Recent Projects"
            action={
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={() => navigate('/projects/create')}
              >
                Create New
              </Button>
            }
          />
          <GradientDivider />
          <CardContent>
            <Grid container spacing={2}>
              {recentProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                    <CardHeader
                      title={project.title}
                      subheader={project.category}
                      action={
                        <IconButton aria-label="settings" size="small">
                          <MoreVert />
                        </IconButton>
                      }
                    />
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip
                          label={project.status.replace('_', ' ')}
                          color={
                            project.status === 'seeking_funding'
                              ? 'primary'
                              : project.status === 'in_progress'
                              ? 'warning'
                              : 'success'
                          }
                          size="small"
                        />
                        <Typography variant="body2">{project.funding} Funded</Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        color="primary"
                        fullWidth
                        startIcon={<Visibility />}
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        View Details
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </GlassCard>
      </Grid>
    </Grid>
  );
  const renderInvestorDashboard = () => (
    <Grid container spacing={3}>
      {/* Virtual Wallet Component */}
      <Grid item xs={12}>
        <VirtualWallet userId={user?.user_id || ''} />
      </Grid>

      {/* Stats */}
      <Grid item xs={12} md={4}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Total Investments
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 46,
                height: 46,
              }}
            >
              <AttachMoney />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            $195,000
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              +8.3% from last month
            </Typography>
          </Box>
        </StatCard>
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Funded Projects
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.secondary.main,
                width: 46,
                height: 46,
              }}
            >
              <Business />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            12
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              3 active syndicates
            </Typography>
          </Box>
        </StatCard>
      </Grid>
      <Grid item xs={12} md={4}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Returns (Avg.)
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.tertiary.main,
                width: 46,
                height: 46,
              }}
            >
              <TrendingUp />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            22.5%
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              Above market average
            </Typography>
          </Box>
        </StatCard>
      </Grid>

      {/* Messages section */}
      <Grid item xs={12}>
        <GlassCard>
          <CardHeader 
            title="Recent Messages" 
            action={
              <Button variant="outlined" size="small">View All</Button>
            }
          />
          <GradientDivider />
          <CardContent sx={{ maxHeight: 250, overflow: 'auto' }}>
            <List>
              {recentMessages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    mb: 1,
                    backgroundColor: message.read ? 'rgba(255, 255, 255, 0.03)' : 'rgba(30, 136, 229, 0.08)',
                    borderRadius: 1,
                    borderLeft: message.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleMessageOpen(message)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {message.from.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight={message.read ? 'normal' : 'bold'}>
                          {message.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.received).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          fontWeight: message.read ? 'normal' : 'medium',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {message.content}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </GlassCard>
      </Grid>
      
      {/* Project Status */}
      <Grid item xs={12} md={5}>
        <GlassCard>
          <CardHeader title="Portfolio Status" />
          <GradientDivider />
          <CardContent sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Milestone Chart */}
      <Grid item xs={12} md={7}>
        <GlassCard>
          <CardHeader title="Milestone Completions" />
          <GradientDivider />
          <CardContent sx={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={milestoneData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                  }}
                />
                <Bar dataKey="completed" fill={theme.palette.success.main} name="Completed" />
                <Bar dataKey="pending" fill={theme.palette.warning.main} name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Investment Opportunities */}
      <Grid item xs={12}>
        <GlassCard>
          <CardHeader
            title="Investment Opportunities"
            action={
              <Button 
                variant="contained" 
                color="primary" 
                size="small"
                onClick={() => navigate('/projects')}
              >
                Browse All
              </Button>
            }
          />
          <GradientDivider />
          <CardContent>
            <Grid container spacing={2}>
              {recentProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
                    <CardHeader
                      title={project.title}
                      subheader={project.category}
                      action={
                        <IconButton aria-label="settings" size="small">
                          <MoreVert />
                        </IconButton>
                      }
                    />
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                        <Chip
                          label={project.status.replace('_', ' ')}
                          color={
                            project.status === 'seeking_funding'
                              ? 'primary'
                              : project.status === 'in_progress'
                              ? 'warning'
                              : 'success'
                          }
                          size="small"
                        />
                        <Typography variant="body2">{project.funding} Funded</Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        color="secondary"
                        fullWidth
                        startIcon={<AttachMoney />}
                        onClick={() => navigate(`/projects/${project.id}`)}
                      >
                        Invest
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </GlassCard>
      </Grid>
    </Grid>
  );
  const renderAdminDashboard = () => (
    <Grid container spacing={3}>
      {/* Stats */}
      <Grid item xs={12} md={3}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Total Users
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.primary.main,
                width: 46,
                height: 46,
              }}
            >
              <People />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            124
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              +15 new this month
            </Typography>
          </Box>
        </StatCard>
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Active Projects
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.secondary.main,
                width: 46,
                height: 46,
              }}
            >
              <Business />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            32
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              8 pending approval
            </Typography>
          </Box>
        </StatCard>
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Escrow Funds
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.tertiary.main,
                width: 46,
                height: 46,
              }}
            >
              <AttachMoney />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            $825,000
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              5 pending releases
            </Typography>
          </Box>
        </StatCard>
      </Grid>
      <Grid item xs={12} md={3}>
        <StatCard>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="text.secondary">
              Pending Approvals
            </Typography>
            <Avatar
              sx={{
                bgcolor: theme.palette.warning.main,
                width: 46,
                height: 46,
              }}
            >
              <Assignment />
            </Avatar>
          </Box>
          <Typography variant="h4" sx={{ mt: 2, mb: 1 }}>
            18
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              Requires attention
            </Typography>
          </Box>
        </StatCard>
      </Grid>

      {/* Messages section */}
      <Grid item xs={12}>
        <GlassCard>
          <CardHeader 
            title="Recent Messages" 
            action={
              <Button variant="outlined" size="small">View All</Button>
            }
          />
          <GradientDivider />
          <CardContent sx={{ maxHeight: 250, overflow: 'auto' }}>
            <List>
              {recentMessages.map((message) => (
                <ListItem
                  key={message.id}
                  sx={{
                    mb: 1,
                    backgroundColor: message.read ? 'rgba(255, 255, 255, 0.03)' : 'rgba(30, 136, 229, 0.08)',
                    borderRadius: 1,
                    borderLeft: message.read ? 'none' : `4px solid ${theme.palette.primary.main}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => handleMessageOpen(message)}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {message.from.charAt(0)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box display="flex" justifyContent="space-between">
                        <Typography variant="subtitle2" fontWeight={message.read ? 'normal' : 'bold'}>
                          {message.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(message.received).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ 
                          fontWeight: message.read ? 'normal' : 'medium',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical'
                        }}
                      >
                        {message.content}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Admin Charts */}
      <Grid item xs={12} md={8}>
        <GlassCard>
          <CardHeader title="Platform Activity" />
          <GradientDivider />
          <CardContent sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={fundingData}>
                <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                <XAxis dataKey="month" stroke={theme.palette.text.secondary} />
                <YAxis stroke={theme.palette.text.secondary} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme.palette.background.paper,
                    borderColor: theme.palette.divider,
                  }} 
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke={theme.palette.primary.main}
                  activeDot={{ r: 8 }}
                  strokeWidth={3}
                  name="Total Funding ($)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </GlassCard>
      </Grid>
      {/* Pending Approvals */}
      <Grid item xs={12} md={4}>
        <GlassCard>
          <CardHeader title="Pending Actions" />
          <GradientDivider />
          <CardContent sx={{ maxHeight: 320, overflow: 'auto' }}>
            <List>
              {upcomingMilestones.map((milestone) => (
                <ListItem
                  key={milestone.id}
                  sx={{
                    mb: 1,
                    bgcolor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                  }}
                >
                  <ListItemText
                    primary={milestone.description}
                    secondary={
                      <>
                        <Typography variant="body2" color="text.secondary">
                          {milestone.project}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(milestone.dueDate).toLocaleDateString()}
                        </Typography>
                      </>
                    }
                  />
                  <Button variant="outlined" size="small" color="success">
                    Approve
                  </Button>
                </ListItem>
              ))}
              <ListItem
                sx={{
                  mb: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 1,
                }}
              >
                <ListItemText
                  primary="User Verification"
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        John Doe (Investor)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Requested: 2025-03-08
                      </Typography>
                    </>
                  }
                />
                <Button variant="outlined" size="small" color="success">
                  Verify
                </Button>
              </ListItem>
            </List>
          </CardContent>
        </GlassCard>
      </Grid>

      {/* User Management */}
      <Grid item xs={12}>
        <GlassCard>
          <CardHeader
            title="Recent Activity"
            action={
              <Button variant="contained" color="primary" size="small">
                View All
              </Button>
            }
          />
          <GradientDivider />
          <CardContent>
            <List>
              <ListItem
                sx={{
                  mb: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <PersonIcon />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="New User Registration"
                  secondary="Emma Johnson (Innovator) registered and requires verification"
                />
                <Typography variant="caption" color="text.secondary">
                  5 minutes ago
                </Typography>
              </ListItem>
              <ListItem
                sx={{
                  mb: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                    <Business />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="New Project Submission"
                  secondary="Solar Micro-Grids project submitted for approval"
                />
                <Typography variant="caption" color="text.secondary">
                  2 hours ago
                </Typography>
              </ListItem>
              <ListItem
                sx={{
                  mb: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.03)',
                  borderRadius: 1,
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: theme.palette.success.main }}>
                    <AttachMoney />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Escrow Release"
                  secondary="$25,000 released for Clean Water Initiative milestone completion"
                />
                <Typography variant="caption" color="text.secondary">
                  1 day ago
                </Typography>
              </ListItem>
            </List>
          </CardContent>
        </GlassCard>
      </Grid>
    </Grid>
  );
  return (
    <AppLayout>
      <Typography
        variant="h4"
        sx={{
          mb: 4,
          fontWeight: "bold",
          background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {user?.role} Dashboard
      </Typography>

      {renderRoleSpecificContent()}

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
                <IconButton onClick={handleMessageClose} size="small">
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar sx={{ bgcolor: theme.palette.primary.main, mr: 2 }}>
                  {selectedMessage.from.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {selectedMessage.from}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(selectedMessage.received).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                {selectedMessage.content}
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<Reply />}
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
              <Box display="flex" justifyContent="space-between" alignItems="center">
                Reply to: {selectedMessage.subject}
                <IconButton onClick={handleReplyClose} size="small">
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Box display="flex" mb={2}>
                <Typography variant="body2" color="text.secondary">
                  To: {selectedMessage.from} ({selectedMessage.fromId})
                </Typography>
              </Box>
              <TextField
                fullWidth
                multiline
                rows={8}
                placeholder="Type your reply here..."
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                variant="outlined"
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleReplyClose}>
                Cancel
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleSendReply}
                disabled={!replyContent.trim()}
              >
                Send
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </AppLayout>
  );
};

export default Dashboard;