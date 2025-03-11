import React, { useState, useEffect } from 'react';
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
  CircularProgress,
  Alert,
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

// Services
import { 
  projectService, 
  investorService, 
  walletService, 
  messageService, 
  notificationService,
  userService 
} from '../services/api';

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

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State for data
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // UI state
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [replyDialogOpen, setReplyDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');

  // Fetch dashboard data based on user role
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Fetch common data for all users
        const messagesResponse = await messageService.getMessages();
        setMessages(messagesResponse.data);
        
        // Fetch role-specific data
        if (user.role === 'Innovator' || user.role === 'Investor') {
          // Get user stats (works for both roles)
          const statsResponse = await userService.getUserStats();
          setDashboardData(statsResponse.data);
          
          // Fetch projects - for innovators, their projects; for investors, available projects
          const projectsResponse = await projectService.getProjects();
          setProjects(projectsResponse.data);
          
          // Fetch milestones for the most recent project
          if (projectsResponse.data.length > 0) {
            const milestonesResponse = await projectService.getProjectMilestones(
              projectsResponse.data[0].id
            );
            setMilestones(milestonesResponse.data);
          }
          
          // Fetch chart data (will be different for each role)
          // This would normally come from a dedicated API endpoint
          try {
            const transactionStatsResponse = await walletService.getTransactionStats();
            setChartData(transactionStatsResponse.data.monthlyData || []);
          } catch (statsError) {
            console.error('Error fetching transaction stats:', statsError);
            // Fallback: create chart data from projects
            const chartDataArray = projectsResponse.data.slice(0, 7).map((project: any) => ({
              month: new Date(project.submittedDate).toLocaleString('default', { month: 'short' }),
              amount: project.currentFunding || 0
            }));
            
            setChartData(chartDataArray);
          }
        }
        else if (user.role === 'Admin' || user.role === 'EscrowManager') {
          // Admin would have dedicated endpoints for dashboard stats
          try {
            const adminStatsResponse = await userService.getAdminStats();
            setDashboardData(adminStatsResponse.data);
          } catch (adminError) {
            console.error('Error fetching admin stats:', adminError);
            
            // Fallback: Get projects and adapt the data
            const projectsResponse = await projectService.getProjects();
            setProjects(projectsResponse.data);
            
            // Create counts for admin dashboard
            const activeProjects = projectsResponse.data.filter(
              (project: any) => project.status === 'InProgress' || project.status === 'PartiallyFunded'
            ).length;
            
            const totalFunding = projectsResponse.data.reduce(
              (sum: number, project: any) => sum + (project.currentFunding || 0), 
              0
            );
            
            setDashboardData({
              totalUsers: projectsResponse.data.length * 3, // Estimate based on projects
              activeProjects,
              pendingApprovals: projectsResponse.data.filter(
                (project: any) => project.status === 'PendingApproval'
              ).length,
              escrowFunds: totalFunding
            });
          }
          
          // Try to get chart data from a dedicated endpoint
          try {
            const chartResponse = await userService.getPlatformActivityData();
            setChartData(chartResponse.data);
          } catch (chartError) {
            console.error('Error fetching chart data:', chartError);
            
            // Fallback: Use project data for chart
            const projectsResponse = await projectService.getProjects();
            const chartDataArray = projectsResponse.data.slice(0, 7).map((project: any) => ({
              month: new Date(project.submittedDate).toLocaleString('default', { month: 'short' }),
              amount: project.currentFunding || 0
            }));
            
            setChartData(chartDataArray);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  const handleMessageOpen = (message: any) => {
    setSelectedMessage(message);
    setMessageDialogOpen(true);
    
    // Mark message as read if not already
    if (!message.read) {
      messageService.markAsRead(message.id).catch(err => {
        console.error('Error marking message as read:', err);
      });
    }
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
  
  const handleSendReply = async () => {
    if (!replyContent.trim() || !selectedMessage) return;
    
    try {
      await messageService.sendMessage(
        selectedMessage.fromId,
        `Re: ${selectedMessage.subject}`,
        replyContent
      );
      
      // Close dialog and reset state
      setReplyDialogOpen(false);
      setReplyContent('');
      setSelectedMessage(null);
      
      // Show success message
      // Refresh messages after a short delay
      setTimeout(async () => {
        try {
          const messagesResponse = await messageService.getMessages();
          setMessages(messagesResponse.data);
        } catch (err) {
          console.error('Error refreshing messages:', err);
        }
      }, 1000);
    } catch (err) {
      console.error('Error sending reply:', err);
      setError('Failed to send reply. Please try again.');
    }
  };

  // Content based on user role
  const renderRoleSpecificContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (error) {
      return (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      );
    }
    
    switch (user?.role) {
      case 'Innovator':
        return renderInnovatorDashboard();
      case 'Investor':
        return renderInvestorDashboard();
      case 'Admin':
      case 'EscrowManager':
        return renderAdminDashboard();
      default:
        return (
          <Typography variant="body1" align="center">
            Dashboard not available for your role.
          </Typography>
        );
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
            ${dashboardData?.totalFunding?.toLocaleString() || '0'}
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              Recent increase
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
            {dashboardData?.activeProjects || 0}
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              Of {dashboardData?.totalProjects || 0} total
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
            {dashboardData?.completedMilestones || 0}
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              Recently completed
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
            {messages.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No messages to display
              </Typography>
            ) : (
              <List>
                {messages.map((message) => (
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
            )}
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Funding Chart */}
      <Grid item xs={12} md={8}>
        <GlassCard>
          <CardHeader title="Funding Overview" />
          <GradientDivider />
          <CardContent sx={{ height: 300 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body1" color="text.secondary">
                  No funding data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Milestone Tracking */}
      <Grid item xs={12} md={4}>
        <GlassCard>
          <CardHeader title="Upcoming Milestones" />
          <GradientDivider />
          <CardContent sx={{ maxHeight: 300, overflow: 'auto' }}>
            {milestones.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No upcoming milestones
              </Typography>
            ) : (
              <List>
                {milestones.map((milestone) => (
                  <ListItem
                    key={milestone.id}
                    sx={{
                      mb: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText
                      primary={milestone.title}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {milestone.project || 'Project'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due: {new Date(milestone.targetCompletionDate).toLocaleDateString()}
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
            )}
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
            {projects.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No projects to display
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {projects.slice(0, 3).map((project) => (
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
                            label={project.status?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown'}
                            color={
                              project.status === 'SeekingFunding'
                                ? 'primary'
                                : project.status === 'InProgress' || project.status === 'PartiallyFunded'
                                ? 'warning'
                                : 'success'
                            }
                            size="small"
                          />
                          <Typography variant="body2">
                            {project.currentFunding ? 
                              `${Math.round((project.currentFunding / project.fundingGoal) * 100)}% Funded` : 
                              '0% Funded'}
                          </Typography>
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
            )}
          </CardContent>
        </GlassCard>
      </Grid>
    </Grid>
  );
  
  const renderInvestorDashboard = () => (
    <Grid container spacing={3}>
      {/* Virtual Wallet Component */}
      <Grid item xs={12}>
        <VirtualWallet userId={user?.id || ''} />
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
            ${dashboardData?.totalInvested?.toLocaleString() || '0'}
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              Recent investment
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
            {dashboardData?.projectsInvested || 0}
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              {dashboardData?.activeSyndicates || 0} active syndicates
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
            {dashboardData?.avgReturn?.toFixed(1) || 0}%
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
            {messages.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No messages to display
              </Typography>
            ) : (
              <List>
                {messages.map((message) => (
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
            )}
          </CardContent>
        </GlassCard>
      </Grid>
      
      {/* Project Status */}
      <Grid item xs={12} md={5}>
        <GlassCard>
          <CardHeader title="Portfolio Status" />
          <GradientDivider />
          <CardContent sx={{ height: 300, display: 'flex', justifyContent: 'center' }}>
            {projects.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Seeking Funding', value: projects.filter(p => p.status === 'SeekingFunding').length || 1 },
                      { name: 'In Progress', value: projects.filter(p => p.status === 'InProgress' || p.status === 'PartiallyFunded').length || 1 },
                      { name: 'Completed', value: projects.filter(p => p.status === 'Completed' || p.status === 'FullyFunded').length || 1 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {[theme.palette.primary.main, theme.palette.secondary.main, theme.palette.tertiary.main].map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
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
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body1" color="text.secondary">
                  No portfolio data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Milestone Chart */}
      <Grid item xs={12} md={7}>
        <GlassCard>
          <CardHeader title="Milestone Completions" />
          <GradientDivider />
          <CardContent sx={{ height: 300 }}>
            {milestones.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={milestones.map(m => ({
                  month: new Date(m.targetCompletionDate).toLocaleString('default', { month: 'short' }),
                  completed: m.status === 'Approved' ? 1 : 0,
                  pending: m.status !== 'Approved' ? 1 : 0
                }))}>
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
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body1" color="text.secondary">
                  No milestone data available
                </Typography>
              </Box>
            )}
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
            {projects.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No projects available for investment
              </Typography>
            ) : (
              <Grid container spacing={2}>
                {projects
                  .filter(project => project.status === 'SeekingFunding' || project.status === 'PartiallyFunded')
                  .slice(0, 3)
                  .map((project) => (
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
                              label={project.status?.replace(/([A-Z])/g, ' $1').trim() || 'Unknown'}
                              color={
                                project.status === 'SeekingFunding'
                                  ? 'primary'
                                  : project.status === 'InProgress' || project.status === 'PartiallyFunded'
                                  ? 'warning'
                                  : 'success'
                              }
                              size="small"
                            />
                            <Typography variant="body2">
                              {project.currentFunding ? 
                                `${Math.round((project.currentFunding / project.fundingGoal) * 100)}% Funded` : 
                                '0% Funded'}
                            </Typography>
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
            )}
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
            {dashboardData?.totalUsers || 0}
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              New registrations
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
            {dashboardData?.activeProjects || 0}
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              In progress
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
            ${dashboardData?.escrowFunds?.toLocaleString() || '0'}
          </Typography>
          <Box display="flex" alignItems="center">
            <TrendingUp sx={{ color: '#4caf50', mr: 1 }} fontSize="small" />
            <Typography variant="body2" color="#4caf50">
              Funds in holding
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
            {dashboardData?.pendingApprovals || 0}
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
            {messages.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No messages to display
              </Typography>
            ) : (
              <List>
                {messages.map((message) => (
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
            )}
          </CardContent>
        </GlassCard>
      </Grid>

      {/* Admin Charts */}
      <Grid item xs={12} md={8}>
        <GlassCard>
          <CardHeader title="Platform Activity" />
          <GradientDivider />
          <CardContent sx={{ height: 320 }}>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
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
            ) : (
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <Typography variant="body1" color="text.secondary">
                  No activity data available
                </Typography>
              </Box>
            )}
          </CardContent>
        </GlassCard>
      </Grid>
      
      {/* Pending Approvals */}
      <Grid item xs={12} md={4}>
        <GlassCard>
          <CardHeader title="Pending Actions" />
          <GradientDivider />
          <CardContent sx={{ maxHeight: 320, overflow: 'auto' }}>
            {projects.filter(p => p.status === 'PendingApproval').length === 0 && milestones.filter(m => m.status === 'PendingVerification').length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No pending actions
              </Typography>
            ) : (
              <List>
                {projects.filter(p => p.status === 'PendingApproval').slice(0, 3).map((project) => (
                  <ListItem
                    key={project.id}
                    sx={{
                      mb: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText
                      primary={`Project: ${project.title}`}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            Submitted for Approval
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Date: {new Date(project.submittedDate).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                    <Button variant="outlined" size="small" color="success">
                      Approve
                    </Button>
                  </ListItem>
                ))}
                
                {milestones.filter(m => m.status === 'PendingVerification').slice(0, 3).map((milestone) => (
                  <ListItem
                    key={milestone.id}
                    sx={{
                      mb: 1,
                      bgcolor: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: 1,
                    }}
                  >
                    <ListItemText
                      primary={milestone.title}
                      secondary={
                        <>
                          <Typography variant="body2" color="text.secondary">
                            {milestone.project || 'Project'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due: {new Date(milestone.targetCompletionDate).toLocaleDateString()}
                          </Typography>
                        </>
                      }
                    />
                    <Button variant="outlined" size="small" color="success">
                      Approve
                    </Button>
                  </ListItem>
                ))}
              </List>
            )}
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
            {projects.length === 0 ? (
              <Typography variant="body1" color="text.secondary" align="center">
                No recent activity
              </Typography>
            ) : (
              <List>
                {projects.slice(0, 3).map((project, index) => (
                  <ListItem
                    key={project.id}
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
                      primary={index % 3 === 0 ? "New Project Submission" : (index % 3 === 1 ? "User Registration" : "Milestone Submission")}
                      secondary={
                        index % 3 === 0 ? 
                          `${project.title} project submitted for approval` : 
                          (index % 3 === 1 ? 
                            `${project.innovator} registered as Innovator` : 
                            `Milestone submitted for ${project.title}`)
                      }
                    />
                    <Typography variant="caption" color="text.secondary">
                      {new Date(project.submittedDate).toLocaleDateString()}
                    </Typography>
                  </ListItem>
                ))}
              </List>
            )}
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