import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Divider,
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Tabs,
  Tab,
  CircularProgress,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Card,
  CardContent,
  InputAdornment,
  useTheme,
  styled,
  Alert,
} from '@mui/material';
import {
  AttachMoney,
  BusinessCenter,
  Description,
  Group,
  Timeline,
  Check,
  Insights,
  Comment,
  Share,
  FavoriteBorder,
  Download,
  CalendarToday,
  LocationOn,
  Person,
  ArrowBack,
} from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { projectService, investorService } from '../services/api';
import { Project, Milestone } from '../types/types';

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
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

const ProjectDetails: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  // State for project data
  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState(0);
  const [confirmInvestDialogOpen, setConfirmInvestDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch project data
  useEffect(() => {
    const fetchProjectData = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const projectResponse = await projectService.getProjectById(id);
        setProject(projectResponse.data);
        
        // Set initial invest amount to minimum investment if available
        if (projectResponse.data.minimumInvestment) {
          setInvestAmount(projectResponse.data.minimumInvestment);
        }
        
        // Fetch milestones
        const milestonesResponse = await projectService.getProjectMilestones(id);
        setMilestones(milestonesResponse.data);
      } catch (err) {
        console.error('Error fetching project data:', err);
        setError('Failed to load project data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjectData();
  }, [id]);
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleInvestClick = () => {
    setInvestDialogOpen(true);
  };
  
  const handleInvestDialogClose = () => {
    setInvestDialogOpen(false);
  };
  
  const handleProceedToConfirm = () => {
    setInvestDialogOpen(false);
    setConfirmInvestDialogOpen(true);
  };
  
  const handleConfirmDialogClose = () => {
    setConfirmInvestDialogOpen(false);
  };
  
  const handleConfirmInvestment = async () => {
    if (!project) return;
    
    setProcessing(true);
    
    try {
      await investorService.investInProject(project.id, investAmount);
      
      // Close dialog and show success state
      setConfirmInvestDialogOpen(false);
      setSuccessMessage(`Successfully invested $${investAmount.toLocaleString()} in ${project.title}`);
      
      // Refresh project data after a short delay
      setTimeout(async () => {
        if (id) {
          const projectResponse = await projectService.getProjectById(id);
          setProject(projectResponse.data);
        }
      }, 2000);
    } catch (err) {
      console.error('Error processing investment:', err);
      setError('Failed to process investment. Please try again later.');
    } finally {
      setProcessing(false);
    }
  };
  
  const getFundingProgress = () => {
    if (!project || !project.currentFunding) return 0;
    return (project.currentFunding / project.fundingGoal) * 100;
  };
  
  const getStatusColor = (status: string | undefined) => {
    if (!status) return "default";
    
    switch (status) {
      case 'SeekingFunding':
        return "primary";
      case 'PartiallyFunded':
        return "warning";
      case 'FullyFunded':
        return "success";
      default:
        return "default";
    }
  };
  
  const getFormattedStatus = (status: string | undefined) => {
    if (!status) return '';
    
    // Convert camelCase to space-separated words
    return status.replace(/([A-Z])/g, ' $1').trim();
  };

  if (loading) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  if (error || !project) {
    return (
      <AppLayout>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || "Project not found"}
        </Alert>
        <Button
          variant="contained"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/projects')}
          sx={{ mt: 2 }}
        >
          Back to Projects
        </Button>
      </AppLayout>
    );
  }
  return (
    <AppLayout>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Button
            variant="text"
            color="inherit"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/projects')}
            sx={{ mr: 2 }}
          >
            Back to Projects
          </Button>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {project.title}
          </Typography>
        </Box>
        
        <GradientDivider />
        
        {successMessage && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {successMessage}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Project Overview */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Chip
                        label={project.category}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={getFormattedStatus(project.status)}
                        color={getStatusColor(project.status)}
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1">
                      {project.description}
                    </Typography>
                  </Box>
                  <Box display="flex">
                    <IconButton>
                      <FavoriteBorder />
                    </IconButton>
                    <IconButton>
                      <Share />
                    </IconButton>
                  </Box>
                </Box>
                
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Funding Progress
                  </Typography>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      {getFundingProgress().toFixed(0)}% Funded
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ${(project.currentFunding || 0).toLocaleString()} of ${project.fundingGoal.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getFundingProgress()}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {project.investorsCount || 0} investors
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Min. Investment: ${(project.minimumInvestment || 1000).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
                  <Box display="flex" alignItems="center">
                    <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Duration: {project.durationMonths || 12} months
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Location: {project.geoFocus || "Global"}
                    </Typography>
                  </Box>
                </Box>
                
                {/* SDGs */}
                {project.sdgAlignment && project.sdgAlignment.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Sustainable Development Goals:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {project.sdgAlignment.map((sdg) => (
                        <Chip key={sdg} label={sdg.split(':')[0] || sdg} size="small" />
                      ))}
                    </Box>
                  </Box>
                )}
                
                {user?.role === 'Investor' && project.status !== 'FullyFunded' && (
                  <Button
                    variant="contained"
                    color="primary"
                    size="large"
                    fullWidth
                    startIcon={<AttachMoney />}
                    onClick={handleInvestClick}
                    sx={{ mt: 2 }}
                  >
                    Invest in This Project
                  </Button>
                )}
              </Box>
            </Paper>
            
            <Paper sx={{ mb: 3 }}>
              <Tabs
                value={tabValue}
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{
                  borderBottom: `1px solid ${theme.palette.divider}`,
                }}
              >
                <Tab label="Overview" icon={<Description />} iconPosition="start" />
                <Tab label="Team" icon={<Group />} iconPosition="start" />
                <Tab label="Milestones" icon={<Timeline />} iconPosition="start" />
                <Tab label="Impact" icon={<Insights />} iconPosition="start" />
                <Tab label="Updates" icon={<Comment />} iconPosition="start" />
              </Tabs>
              
              {/* Overview Tab */}
              <TabPanel value={tabValue} index={0}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {project.fullDescription || project.description}
                </Typography>
                
                {project.documents && project.documents.length > 0 && (
                  <>
                    <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                      Documents
                    </Typography>
                    <List>
                      {project.documents.map((doc, index) => (
                        <ListItem 
                          key={index} 
                          sx={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                            mb: 1, 
                            borderRadius: 1,
                          }}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ backgroundColor: theme.palette.primary.main }}>
                              <Description />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={doc}
                            secondary={`Document ${index + 1}`}
                          />
                          <Button startIcon={<Download />}>Download</Button>
                        </ListItem>
                      ))}
                    </List>
                  </>
                )}
              </TabPanel>
              
              {/* Team Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  {project.teamMembers ? (
                    project.teamMembers.map((member, index) => (
                      <Grid item xs={12} md={6} key={index}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Box display="flex" alignItems="center" mb={2}>
                              <Avatar 
                                sx={{ width: 60, height: 60, mr: 2 }}
                              >
                                {member.name?.charAt(0)}
                              </Avatar>
                              <Box>
                                <Typography variant="h6">{member.name}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                  {member.role}
                                </Typography>
                              </Box>
                            </Box>
                            <Typography variant="body2">{member.bio}</Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))
                  ) : (
                    <Grid item xs={12}>
                      <Typography variant="body1" color="text.secondary" align="center">
                        Team information not available
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </TabPanel>
              
              {/* Milestones Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Timeline
                  </Typography>
                  {milestones.length > 0 ? (
                    milestones.map((milestone, index) => (
                      <Box
                        key={milestone.id}
                        sx={{
                          position: 'relative',
                          mb: 3,
                          pb: 3,
                          borderLeft: `2px solid ${theme.palette.divider}`,
                          pl: 3,
                          '&:last-child': {
                            mb: 0,
                            pb: 0,
                            borderLeft: 'none',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            position: 'absolute',
                            left: -9,
                            top: 0,
                            width: 16,
                            height: 16,
                            borderRadius: '50%',
                            bgcolor: milestone.status === 'Approved' ? theme.palette.success.main : theme.palette.primary.main,
                            border: `2px solid ${theme.palette.background.paper}`,
                          }}
                        />
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="h6">
                              {milestone.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                            Expected: {new Date(milestone.targetCompletionDate || '').toLocaleDateString()}
                            </Typography>
                          </Box>
                          <Chip
                            label={`${Math.round((milestone.fundingRequired / project.fundingGoal) * 100)}%`}
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                          {milestone.description}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body1" color="text.secondary" align="center">
                      No milestones available
                    </Typography>
                  )}
                </Box>
              </TabPanel>
              
              {/* Impact Tab */}
              <TabPanel value={tabValue} index={3}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {project.impactStatement || "Impact information not available"}
                </Typography>
              </TabPanel>
              
              {/* Updates Tab */}
              <TabPanel value={tabValue} index={4}>
                {project.updates && project.updates.length > 0 ? (
                  project.updates.map((update, index) => (
                    <Paper
                      key={index}
                      sx={{
                        p: 3,
                        mb: 2,
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      }}
                    >
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="h6">{update.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(update.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ mb: 2 }} />
                      <Typography variant="body1">{update.content}</Typography>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body1" color="text.secondary" align="center">
                    No updates available
                  </Typography>
                )}
              </TabPanel>
            </Paper>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Project Creator
              </Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <Avatar 
                  sx={{ width: 50, height: 50, mr: 2 }}
                >
                  {project.innovator?.charAt(0) || 'I'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {project.innovator || 'Project Creator'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Innovator
                  </Typography>
                </Box>
              </Box>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Person />}
                sx={{ mb: 2 }}
              >
                View Profile
              </Button>
              <Button
                variant="outlined"
                fullWidth
                startIcon={<Comment />}
              >
                Contact Creator
              </Button>
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Investment Summary
              </Typography>
              <List dense>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Funding Goal"
                    secondary={`$${project.fundingGoal.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Current Funding"
                    secondary={`$${(project.currentFunding || 0).toLocaleString()} (${getFundingProgress().toFixed(0)}%)`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Minimum Investment"
                    secondary={`$${(project.minimumInvestment || 1000).toLocaleString()}`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Number of Investors"
                    secondary={project.investorsCount || 0}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Project Created"
                    secondary={new Date(project.submittedDate).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Similar Projects
              </Typography>
              <List>
                {/* This would ideally be populated from an API call for similar projects */}
                <ListItem
                  component="div"
                  sx={{
                    mb: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/projects')}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <BusinessCenter />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Browse Similar Projects"
                    secondary="Find more projects in this category"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Investment Dialog */}
        <Dialog open={investDialogOpen} onClose={handleInvestDialogClose}>
          <DialogTitle>Invest in {project.title}</DialogTitle>
          <DialogContent>
            <DialogContentText gutterBottom>
              How much would you like to invest? The minimum investment is ${(project.minimumInvestment || 1000).toLocaleString()}.
            </DialogContentText>
            <TextField
              fullWidth
              label="Investment Amount"
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: project.minimumInvestment || 1000 },
              }}
              error={investAmount < (project.minimumInvestment || 1000)}
              helperText={
                investAmount < (project.minimumInvestment || 1000)
                  ? `Minimum investment is $${(project.minimumInvestment || 1000).toLocaleString()}`
                  : ''
              }
              sx={{ mt: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleInvestDialogClose}>Cancel</Button>
            <Button
              onClick={handleProceedToConfirm}
              variant="contained"
              color="primary"
              disabled={investAmount < (project.minimumInvestment || 1000)}
            >
              Proceed
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Confirm Investment Dialog */}
        <Dialog open={confirmInvestDialogOpen} onClose={handleConfirmDialogClose}>
          <DialogTitle>Confirm Your Investment</DialogTitle>
          <DialogContent>
            <DialogContentText gutterBottom>
              Please confirm your investment of ${investAmount.toLocaleString()} in {project.title}.
            </DialogContentText>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              By confirming, you agree to our investment terms and conditions. Funds will be held in escrow and released according to the milestone schedule.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleConfirmDialogClose} disabled={processing}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmInvestment}
              variant="contained"
              color="primary"
              disabled={processing}
              startIcon={processing ? <CircularProgress size={20} /> : null}
            >
              {processing ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AppLayout>
  );
};

export default ProjectDetails;