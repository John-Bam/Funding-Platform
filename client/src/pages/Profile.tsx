
// client/src/pages/Profile.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Avatar,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputAdornment,
  IconButton,
  useTheme,
  styled,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Phone,
  CalendarToday,
  LocationOn,
  Edit,
  Lock,
  Visibility,
  VisibilityOff,
  Business,
  Check,
  Close,
  Settings,
  NotificationsActive,
} from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { userService, investorService } from '../services/api';

// Styled components
const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.background.paper}`,
  boxShadow: '0 8px 16px rgba(0, 0, 0, 0.2)',
  marginBottom: theme.spacing(2),
}));

const Profile: React.FC = () => {
  const theme = useTheme();
  const { user } = useAuth();
  
  // State for profile data and loading
  const [loading, setLoading] = useState<boolean>(true);
  const [profileData, setProfileData] = useState({
    full_name: '',
    email: '',
    phone_number: '',
    date_of_birth: '',
    address: '',
    role: '',
    status: '',
    created_at: '',
  });
  
  // State for stats (for investors or innovators)
  const [stats, setStats] = useState<any>(null);
  
  const [editMode, setEditMode] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch user profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        const response = await userService.getUserProfile();
        
        // Fetch role-specific stats
        if (response.data.role === 'Investor') {
          const investorData = await investorService.getInvestorProfile();
          setStats(investorData.data);
        } else if (response.data.role === 'Innovator') {
          // For innovators, we'll get this from project service later
          setStats({
            projects: 7,
            activateProjects: 3,
            milestones: 18,
            fundingRaised: 142000
          });
        }
      } catch (err) {
        console.error('Error fetching profile data:', err);
        setError('Failed to load profile data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);
  
  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };
  
  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      await userService.updateUserProfile(profileData);
      setSuccess('Profile updated successfully!');
      setEditMode(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };
  
  const handleChangePassword = async () => {
    // Validation
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    try {
      setLoading(true);
      await userService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      setSuccess('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setChangePasswordOpen(false);
    } catch (err) {
      console.error('Error changing password:', err);
      setError('Failed to change password. Please check your current password and try again.');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(null), 3000);
    }
  };
  
  const toggleShowCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };
  
  const toggleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };
  
  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // If loading, show a loading indicator
  if (loading && !profileData.email) {
    return (
      <AppLayout>
        <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
          <CircularProgress />
        </Box>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
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
          My Profile
        </Typography>
        
        <GradientDivider />
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Personal Information
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={editMode ? <Close /> : <Edit />}
                  onClick={() => setEditMode(!editMode)}
                  disabled={loading}
                >
                  {editMode ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Box>
              
              {editMode ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleProfileChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      value={profileData.email}
                      onChange={handleProfileChange}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Email />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      name="phone_number"
                      value={profileData.phone_number}
                      onChange={handleProfileChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Phone />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Date of Birth"
                      name="date_of_birth"
                      type="date"
                      value={profileData.date_of_birth}
                      onChange={handleProfileChange}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CalendarToday />
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Role"
                      value={profileData.role}
                      disabled
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Business />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      name="address"
                      value={profileData.address}
                      onChange={handleProfileChange}
                      multiline
                      rows={2}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOn />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Box display="flex" justifyContent="flex-end" mt={2}>
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={loading ? <CircularProgress size={20} /> : <Check />}
                        onClick={handleSaveProfile}
                        disabled={loading}
                      >
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              ) : (
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Person />
                    </ListItemIcon>
                    <ListItemText
                      primary="Full Name"
                      secondary={profileData.full_name}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Email />
                    </ListItemIcon>
                    <ListItemText
                      primary="Email"
                      secondary={profileData.email}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Phone />
                    </ListItemIcon>
                    <ListItemText
                      primary="Phone Number"
                      secondary={profileData.phone_number}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarToday />
                    </ListItemIcon>
                    <ListItemText
                      primary="Date of Birth"
                      secondary={new Date(profileData.date_of_birth).toLocaleDateString()}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Address"
                      secondary={profileData.address}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Business />
                    </ListItemIcon>
                    <ListItemText
                      primary="Role"
                      secondary={
                        <Chip 
                          label={profileData.role} 
                          color="primary" 
                          size="small" 
                        />
                      }
                    />
                  </ListItem>
                </List>
              )}
            </Paper>
            
            <Paper sx={{ p: 3 }}>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6">
                  Security
                </Typography>
              </Box>
              
              <List>
                <ListItem>
                  <ListItemIcon>
                    <Lock />
                  </ListItemIcon>
                  <ListItemText
                    primary="Password"
                    secondary="Last changed: 30 days ago"
                  />
                  <Button
                    variant="outlined"
                    onClick={() => setChangePasswordOpen(true)}
                    disabled={loading}
                  >
                    Change Password
                  </Button>
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <CalendarToday />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Created"
                    secondary={new Date(profileData.created_at).toLocaleDateString()}
                  />
                </ListItem>
                <ListItem>
                  <ListItemIcon>
                    <Check color="success" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Account Status"
                    secondary={
                      <Chip 
                        label={profileData.status} 
                        color="success" 
                        size="small" 
                      />
                    }
                  />
                </ListItem>
              </List>
            </Paper>
          </Grid>
          
          {/* Sidebar */}
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, mb: 3, textAlign: 'center' }}>
              <ProfileAvatar alt={profileData.full_name}>
                {profileData.full_name.charAt(0)}
              </ProfileAvatar>
              <Typography variant="h5" gutterBottom>
                {profileData.full_name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                {profileData.email}
              </Typography>
              <Chip 
                label={profileData.role} 
                color="primary" 
                sx={{ mt: 1 }}
              />
            </Paper>
            
            <Paper sx={{ p: 3, mb: 3 }}>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Settings />}
                sx={{ mb: 2 }}
              >
                Account Settings
              </Button>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<NotificationsActive />}
              >
                Notification Preferences
              </Button>
            </Paper>
            
            {profileData.role === 'Innovator' && stats && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Innovator Stats
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Projects"
                      secondary={`${stats.projects} total (${stats.activateProjects} active)`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Milestones"
                      secondary={`${stats.milestones} completed`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Funding Raised"
                      secondary={`$${stats.fundingRaised.toLocaleString()}`}
                    />
                  </ListItem>
                </List>
              </Paper>
            )}
            
            {profileData.role === 'Investor' && stats && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Investor Stats
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemText
                      primary="Investments"
                      secondary={`${stats.investments} projects`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Total Invested"
                      secondary={`$${stats.totalInvested.toLocaleString()}`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Active Syndicates"
                      secondary={stats.activeSyndicates}
                    />
                  </ListItem>
                </List>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => setChangePasswordOpen(false)}>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Please enter your current password and choose a new password.
          </DialogContentText>
          <TextField
            fullWidth
            margin="dense"
            label="Current Password"
            type={showCurrentPassword ? 'text' : 'password'}
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowCurrentPassword}
                    edge="end"
                  >
                    {showCurrentPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="New Password"
            type={showNewPassword ? 'text' : 'password'}
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowNewPassword}
                    edge="end"
                  >
                    {showNewPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            margin="dense"
            label="Confirm New Password"
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handlePasswordChange}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={toggleShowConfirmPassword}
                    edge="end"
                  >
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            color="primary"
            disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword || loading}
            startIcon={loading ? <CircularProgress size={20} /> : null}
          >
            {loading ? 'Processing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>
    </AppLayout>
  );
};

export default Profile;