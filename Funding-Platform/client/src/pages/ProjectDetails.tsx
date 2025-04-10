import React, { useState } from 'react';
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

// Mock project data (would come from API in real app)
const projectData = {
  id: 'proj_001',
  title: 'Smart Agriculture System',
  short_description: 'Sustainable farming using IoT sensors and AI for crop optimization',
  full_description: `
    The Smart Agriculture System is an innovative solution that combines IoT sensors, AI-driven analytics, and mobile technology to help farmers optimize crop yields while reducing resource usage.
    
    By deploying a network of affordable sensors throughout fields, farmers can monitor soil moisture, nutrient levels, and environmental conditions in real-time. Our AI algorithms process this data to provide actionable insights and recommendations, helping farmers make data-driven decisions about irrigation, fertilization, and pest control.
    
    The system is designed to be affordable and accessible for smallholder farmers in developing regions, with a focus on improving productivity while promoting sustainable farming practices. Initial pilot tests have shown yield increases of up to 30% while reducing water usage by 20%.
  `,
  category: 'AgriTech',
  status: 'seeking_funding',
  funding_goal: 50000,
  current_funding: 15000,
  min_investment: 1000,
  investors_count: 7,
  created_at: '2025-02-15',
  duration_months: 18,
  target_location: 'Sub-Saharan Africa (Kenya, Tanzania, Uganda)',
  selected_sdgs: ['SDG 2: Zero Hunger', 'SDG 12: Responsible Consumption and Production'],
  impact_statement: `
    Our Smart Agriculture System addresses critical challenges in food security, environmental sustainability, and economic development:
    
    1. Increases crop yields by 20-30% through optimized farming practices
    2. Reduces water usage by 15-25% through precision irrigation
    3. Decreases fertilizer and pesticide use by monitoring soil conditions
    4. Improves income for smallholder farmers
    5. Creates rural tech jobs through system implementation and maintenance
    
    By making precision agriculture accessible to smallholder farmers, we can help feed growing populations while protecting natural resources.
  `,
  milestones: [
    {
      id: 'mile_001',
      title: 'Sensor Prototype Development',
      description: 'Develop and test low-cost, solar-powered sensor units that can monitor soil moisture, temperature, and nutrient levels.',
      expected_completion_date: '2025-05-15',
      status: 'pending',
      funding_percentage: 20,
      verification_method: 'Working prototype demonstration and technical documentation',
    },
    {
      id: 'mile_002',
      title: 'AI Algorithm Development',
      description: 'Develop machine learning algorithms to analyze sensor data and provide actionable recommendations to farmers.',
      expected_completion_date: '2025-08-15',
      status: 'pending',
      funding_percentage: 25,
      verification_method: 'Algorithm validation with test data sets and accuracy reports',
    },
    {
      id: 'mile_003',
      title: 'Mobile App Development',
      description: 'Create a user-friendly mobile application that works offline and displays insights in simple, visual formats.',
      expected_completion_date: '2025-10-30',
      status: 'pending',
      funding_percentage: 20,
      verification_method: 'Functional app demonstration and user testing reports',
    },
    {
      id: 'mile_004',
      title: 'Field Testing',
      description: 'Deploy the system in 10 pilot farms across different regions to validate performance and gather feedback.',
      expected_completion_date: '2025-03-15',
      status: 'pending',
      funding_percentage: 25,
      verification_method: 'Field test results and farmer testimonials',
    },
    {
      id: 'mile_005',
      title: 'Production & Distribution Setup',
      description: 'Establish production and distribution channels for system components in target markets.',
      expected_completion_date: '2025-07-30',
      status: 'pending',
      funding_percentage: 10,
      verification_method: 'Supply chain documentation and first batch of production units',
    },
  ],
  team_members: [
    {
      name: 'John Doe',
      role: 'Founder & Agricultural Technologist',
      bio: 'Former agricultural extension officer with 12 years of experience in sustainable farming practices. MSc in Agricultural Engineering.',
      avatar: '/static/images/avatars/john.jpg',
    },
    {
      name: 'Sarah Johnson',
      role: 'Lead Engineer',
      bio: 'IoT specialist with expertise in sensor networks and embedded systems. Previously worked at AgriTech Solutions.',
      avatar: '/static/images/avatars/sarah.jpg',
    },
    {
      name: 'Michael Chen',
      role: 'AI & Data Scientist',
      bio: 'PhD in Machine Learning with focus on agricultural applications. Led data science team at Innovation Labs.',
      avatar: '/static/images/avatars/michael.jpg',
    },
  ],
  documents: [
    {
      name: 'Business Plan.pdf',
      size: 2450000,
      type: 'application/pdf',
    },
    {
      name: 'Technical Specifications.pdf',
      size: 1840000,
      type: 'application/pdf',
    },
    {
      name: 'Market Analysis.pptx',
      size: 3560000,
      type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    },
  ],
  updates: [
    {
      date: '2025-03-01',
      title: 'First Prototype Completed',
      content: 'We\'ve completed the initial version of our soil moisture sensor prototype, achieving a battery life of over 6 months on a single charge.',
    },
    {
      date: '2025-02-20',
      title: 'New Partnership Announced',
      content: 'We\'re excited to announce a partnership with FarmTech Solutions to help scale our distribution network across East Africa.',
    },
  ],
};

const ProjectDetails: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [tabValue, setTabValue] = useState(0);
  const [investDialogOpen, setInvestDialogOpen] = useState(false);
  const [investAmount, setInvestAmount] = useState(projectData.min_investment);
  const [confirmInvestDialogOpen, setConfirmInvestDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleInvestClick = () => {
    setInvestDialogOpen(true);
  };
  
  const handleInvestDialogClose = () => {
    setInvestDialogOpen(false);
    setInvestAmount(projectData.min_investment);
  };
  
  const handleProceedToConfirm = () => {
    setInvestDialogOpen(false);
    setConfirmInvestDialogOpen(true);
  };
  
  const handleConfirmDialogClose = () => {
    setConfirmInvestDialogOpen(false);
  };
  
  const handleConfirmInvestment = async () => {
    setProcessing(true);
    
    try {
      // In a real app, this would make an API call to process the investment
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Close dialog and show success state
      setConfirmInvestDialogOpen(false);
      
      // Refresh project data
      // This would fetch updated project data in a real app
    } catch (error) {
      console.error('Error processing investment:', error);
    } finally {
      setProcessing(false);
    }
  };
  
  const getFundingProgress = () => {
    return (projectData.current_funding / projectData.funding_goal) * 100;
  };
  
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
            {projectData.title}
          </Typography>
        </Box>
        
        <GradientDivider />
        
        <Grid container spacing={3}>
          {/* Project Overview */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Chip
                        label={projectData.category}
                        color="primary"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip
                        label={projectData.status.replace('_', ' ')}
                        color={
                          projectData.status === 'seeking_funding'
                            ? 'primary'
                            : projectData.status === 'partially_funded'
                            ? 'warning'
                            : 'success'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body1">
                      {projectData.short_description}
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
                      ${projectData.current_funding.toLocaleString()} of ${projectData.funding_goal.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={getFundingProgress()}
                    sx={{ height: 10, borderRadius: 5, mb: 1 }}
                  />
                  <Box display="flex" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">
                      {projectData.investors_count} investors
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Min. Investment: ${projectData.min_investment.toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
                
                <Box display="flex" alignItems="center" flexWrap="wrap" gap={2} mb={2}>
                  <Box display="flex" alignItems="center">
                    <CalendarToday fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Duration: {projectData.duration_months} months
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center">
                    <LocationOn fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      Location: {projectData.target_location}
                    </Typography>
                  </Box>
                </Box>
                
                {/* SDGs */}
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Sustainable Development Goals:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {projectData.selected_sdgs.map((sdg) => (
                      <Chip key={sdg} label={sdg.split(':')[0]} size="small" />
                    ))}
                  </Box>
                </Box>
                
                {user?.role === 'Investor' && projectData.status !== 'fully_funded' && (
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
                  {projectData.full_description}
                </Typography>
                
                <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
                  Documents
                </Typography>
                <List>
                  {projectData.documents.map((doc, index) => (
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
                        primary={doc.name}
                        secondary={`${(doc.size / 1024 / 1024).toFixed(2)} MB`}
                      />
                      <Button startIcon={<Download />}>Download</Button>
                    </ListItem>
                  ))}
                </List>
              </TabPanel>
              
              {/* Team Tab */}
              <TabPanel value={tabValue} index={1}>
                <Grid container spacing={3}>
                  {projectData.team_members.map((member, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card sx={{ height: '100%' }}>
                        <CardContent>
                          <Box display="flex" alignItems="center" mb={2}>
                            <Avatar 
                              src={member.avatar} 
                              sx={{ width: 60, height: 60, mr: 2 }}
                            >
                              {member.name.charAt(0)}
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
                  ))}
                </Grid>
              </TabPanel>
              
              {/* Milestones Tab */}
              <TabPanel value={tabValue} index={2}>
                <Box sx={{ mb: 4 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Project Timeline
                  </Typography>
                  {projectData.milestones.map((milestone, index) => (
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
                          bgcolor: milestone.status === 'completed' ? theme.palette.success.main : theme.palette.primary.main,
                          border: `2px solid ${theme.palette.background.paper}`,
                        }}
                      />
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography variant="h6">
                            {milestone.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" gutterBottom>
                            Expected: {new Date(milestone.expected_completion_date).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Chip
                          label={`${milestone.funding_percentage}%`}
                          color="primary"
                          variant="outlined"
                        />
                      </Box>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        {milestone.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Verification: {milestone.verification_method}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </TabPanel>
              
              {/* Impact Tab */}
              <TabPanel value={tabValue} index={3}>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {projectData.impact_statement}
                </Typography>
              </TabPanel>
              
              {/* Updates Tab */}
              <TabPanel value={tabValue} index={4}>
                {projectData.updates.map((update, index) => (
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
                ))}
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
                  src={projectData.team_members[0].avatar}
                  sx={{ width: 50, height: 50, mr: 2 }}
                >
                  {projectData.team_members[0].name.charAt(0)}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1">
                    {projectData.team_members[0].name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {projectData.team_members[0].role}
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
                    secondary={`$${projectData.funding_goal.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Current Funding"
                    secondary={`$${projectData.current_funding.toLocaleString()} (${getFundingProgress().toFixed(0)}%)`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Minimum Investment"
                    secondary={`$${projectData.min_investment.toLocaleString()}`}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Number of Investors"
                    secondary={projectData.investors_count}
                  />
                </ListItem>
                <ListItem sx={{ px: 0 }}>
                  <ListItemText
                    primary="Project Created"
                    secondary={new Date(projectData.created_at).toLocaleDateString()}
                  />
                </ListItem>
              </List>
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Similar Projects
              </Typography>
              <List>
                <ListItem
                  component="div"
                  sx={{
                    mb: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/projects/proj_002')}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      <BusinessCenter />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Clean Water Initiative"
                    secondary="Water purification technology for rural communities"
                  />
                </ListItem>
                <ListItem
                  component="div"
                  sx={{
                    mb: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/projects/proj_003')}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.secondary.main }}>
                      <BusinessCenter />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Digital Farming Assistant"
                    secondary="Mobile app for smallholder farmers"
                  />
                </ListItem>
                <ListItem
                  component="div"
                  sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    borderRadius: 1,
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/projects/proj_004')}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: theme.palette.tertiary.main }}>
                      <BusinessCenter />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary="Sustainable Drip Irrigation"
                    secondary="Low-cost irrigation solutions for dry regions"
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
        </Grid>
        
        {/* Investment Dialog */}
        <Dialog open={investDialogOpen} onClose={handleInvestDialogClose}>
          <DialogTitle>Invest in {projectData.title}</DialogTitle>
          <DialogContent>
            <DialogContentText gutterBottom>
              How much would you like to invest? The minimum investment is ${projectData.min_investment.toLocaleString()}.
            </DialogContentText>
            <TextField
              fullWidth
              label="Investment Amount"
              type="number"
              value={investAmount}
              onChange={(e) => setInvestAmount(Number(e.target.value))}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
                inputProps: { min: projectData.min_investment },
              }}
              error={investAmount < projectData.min_investment}
              helperText={
                investAmount < projectData.min_investment
                  ? `Minimum investment is ${projectData.min_investment.toLocaleString()}`
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
              disabled={investAmount < projectData.min_investment}
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
              Please confirm your investment of ${investAmount.toLocaleString()} in {projectData.title}.
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