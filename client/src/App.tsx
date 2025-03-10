import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Theme
import forgeTheme from './themes/forgeTheme';

// Auth Context
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import CreateProject from './pages/CreateProject';
import Profile from './pages/Profile';
import AdminPanel from './pages/AdminPanel';
import NotFound from './pages/NotFound';

// Create a client for React Query
const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute: React.FC<{ element: React.ReactNode; allowedRoles?: string[] }> = ({ 
  element, 
  allowedRoles = [] 
}) => {
  const { isAuthenticated, user } = useAuth();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }
  
  return <>{element}</>;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={forgeTheme}>
        <CssBaseline />
        <AuthProvider>
          <Router>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Protected Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute element={<Dashboard />} />
              } />
              <Route path="/projects" element={
                <ProtectedRoute element={<Projects />} />
              } />
              <Route path="/projects/create" element={
                <ProtectedRoute element={<CreateProject />} allowedRoles={['Innovator']} />
              } />
              <Route path="/projects/:id" element={
                <ProtectedRoute element={<ProjectDetails />} />
              } />
              <Route path="/profile" element={
                <ProtectedRoute element={<Profile />} />
              } />
              
              {/* Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute element={<AdminPanel />} allowedRoles={['Admin', 'EscrowManager']} />
              } />
              
              {/* Redirect root to dashboard if authenticated, otherwise login */}
              <Route path="/" element={<Navigate to="/dashboard" />} />
              
              {/* 404 Page */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;