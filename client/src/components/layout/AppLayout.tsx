// client/src/components/layout/AppLayout.tsx
import React, { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Button,
  useTheme,
  useMediaQuery,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Badge,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Business as ProjectsIcon,
  AccountCircle as ProfileIcon,
  AdminPanelSettings as AdminIcon,
  Logout as LogoutIcon,
  Notifications as NotificationsIcon,
  Email as EmailIcon,
  ChevronLeft as ChevronLeftIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../contexts/AuthContext';

const drawerWidth = 240;

interface NavItem {
  title: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: <DashboardIcon />,
    roles: ['Innovator', 'Investor', 'Admin', 'EscrowManager'],
  },
  {
    title: 'Projects',
    path: '/projects',
    icon: <ProjectsIcon />,
    roles: ['Innovator', 'Investor', 'Admin', 'EscrowManager'],
  },
  {
    title: 'Profile',
    path: '/profile',
    icon: <ProfileIcon />,
    roles: ['Innovator', 'Investor', 'Admin', 'EscrowManager'],
  },
  {
    title: 'Admin Panel',
    path: '/admin',
    icon: <AdminIcon />,
    roles: ['Admin', 'EscrowManager'],
  },
];

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'space-between',
}));

const Content = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: 0,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: drawerWidth,
  }),
}));

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(!isMobile);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [messagesAnchorEl, setMessagesAnchorEl] = useState<null | HTMLElement>(null);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const handleDrawerToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setDrawerOpen(!drawerOpen);
    }
  };
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleProfileClick = () => {
    handleMenuClose();
    navigate('/profile');
  };
  
  const handleLogout = async () => {
    handleMenuClose();
    await logout();
    navigate('/login');
  };
  
  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };
  
  const handleMessagesOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMessagesAnchorEl(event.currentTarget);
  };
  
  const handleMessagesClose = () => {
    setMessagesAnchorEl(null);
  };
  
  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <DrawerHeader>
        <Typography 
          variant="h6" 
          color="primary" 
          sx={{ 
            fontWeight: 'bold',
            mx: 'auto',
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Funding Platform
        </Typography>
        {!isMobile && (
          <IconButton onClick={handleDrawerToggle}>
            <ChevronLeftIcon />
          </IconButton>
        )}
      </DrawerHeader>
      <Divider />
      <List>
        {navItems
          .filter(item => item.roles.includes(user?.role || ''))
          .map((item) => (
            <ListItem key={item.path} disablePadding>
              <ListItemButton
                component={RouterLink}
                to={item.path}
                selected={location.pathname === item.path}
                sx={{
                  borderLeft: location.pathname === item.path ? `4px solid ${theme.palette.primary.main}` : 'none',
                  bgcolor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                }}
              >
                <ListItemIcon
                  sx={{
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.title} 
                  sx={{
                    color: location.pathname === item.path ? theme.palette.primary.main : 'inherit',
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
      </List>
      <Divider sx={{ mt: 2, mb: 2 }} />
      <Box sx={{ p: 2 }}>
        <Button
          variant="outlined"
          color="primary"
          fullWidth
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
        >
          Sign Out
        </Button>
      </Box>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: isMobile ? '100%' : drawerOpen ? `calc(100% - ${drawerWidth}px)` : '100%',
          ml: isMobile ? 0 : drawerOpen ? `${drawerWidth}px` : 0,
          boxShadow: 'none',
          bgcolor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
        color="default"
      >
        <Toolbar sx={{ pr: '24px' }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: 'flex' }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            component="h1"
            variant="h6"
            color="inherit"
            noWrap
            sx={{ flexGrow: 1, display: { xs: 'none', sm: 'block' } }}
          >
            {navItems.find(item => item.path === location.pathname)?.title || 'Dashboard'}
          </Typography>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Messages">
              <IconButton
                size="large"
                aria-label="show new messages"
                color="inherit"
                onClick={handleMessagesOpen}
                sx={{ mr: 1 }}
              >
                <Badge badgeContent={3} color="primary">
                  <EmailIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={messagesAnchorEl}
              id="messages-menu"
              open={Boolean(messagesAnchorEl)}
              onClose={handleMessagesClose}
              PaperProps={{
                sx: { maxHeight: 300, width: 320 },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleMessagesClose}>
                <ListItemText
                  primary="Project Update"
                  secondary="Your project 'Smart Agriculture' has a new update"
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </MenuItem>
              <MenuItem onClick={handleMessagesClose}>
                <ListItemText
                  primary="New Message"
                  secondary="Sarah Johnson sent you a message about your project"
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => {
                handleMessagesClose();
                // navigate('/messages');
              }}>
                <Typography color="primary">View All Messages</Typography>
              </MenuItem>
            </Menu>
            
            <Tooltip title="Notifications">
              <IconButton
                size="large"
                aria-label="show new notifications"
                color="inherit"
                onClick={handleNotificationsOpen}
                sx={{ mr: 2 }}
              >
                <Badge badgeContent={5} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={notificationsAnchorEl}
              id="notifications-menu"
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
              PaperProps={{
                sx: { maxHeight: 300, width: 320 },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleNotificationsClose}>
                <ListItemText
                  primary="Investment Received"
                  secondary="Your project received a new investment of $5,000"
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </MenuItem>
              <MenuItem onClick={handleNotificationsClose}>
                <ListItemText
                  primary="Milestone Approved"
                  secondary="Your milestone 'Prototype Development' has been approved"
                  secondaryTypographyProps={{ noWrap: true }}
                />
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => {
                handleNotificationsClose();
                // navigate('/notifications');
              }}>
                <Typography color="primary">View All Notifications</Typography>
              </MenuItem>
            </Menu>
            
            <Tooltip title={user?.full_name || 'Profile'}>
              <IconButton
                size="large"
                edge="end"
                aria-label="account of current user"
                aria-haspopup="true"
                onClick={handleMenuOpen}
                color="inherit"
              >
                <Avatar
                  alt={user?.full_name || ''}
                  src="/static/images/avatar/1.jpg"
                  sx={{ 
                    width: 35, 
                    height: 35,
                    bgcolor: theme.palette.primary.main,
                  }}
                >
                  {user?.full_name?.charAt(0) || <PersonIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={anchorEl}
              id="account-menu"
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                  <ProfileIcon fontSize="small" />
                </ListItemIcon>
                Profile
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box
        component="nav"
        sx={{ width: { md: drawerOpen ? drawerWidth : 0 }, flexShrink: { md: 0 } }}
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="persistent"
          open={drawerOpen}
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              backgroundColor: theme.palette.background.default,
              borderRight: `1px solid ${theme.palette.divider}`,
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>
      
      <Content open={drawerOpen && !isMobile} sx={{ pt: 10 }}>
        {children}
      </Content>
    </Box>
  );
};

export default AppLayout;