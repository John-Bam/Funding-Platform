import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  TextField,
  InputAdornment,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  IconButton,
  Pagination,
  useTheme,
  styled,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search,
  FilterList,
  Visibility,
  AttachMoney,
  Business,
  Add,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { projectService } from '../services/api';
import { Project } from '../types/types';

// Styled components
const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

const Projects: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<string[]>(['All']);
  
  const projectsPerPage = 6;

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await projectService.getProjects();
        setProjects(response.data);
        
        // Extract unique categories
        const uniqueCategories = ['All', ...Array.from(new Set(response.data.map((project: Project) => project.category)))];
        setCategories(uniqueCategories);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, []);
  
  // Filter and sort projects
  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    const matchesCategory = categoryFilter === 'All' || project.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
      case 'oldest':
        return new Date(a.submittedDate).getTime() - new Date(b.submittedDate).getTime();
      case 'most_funded':
        return ((b.currentFunding || 0) / b.fundingGoal) - ((a.currentFunding || 0) / a.fundingGoal);
      case 'least_funded':
        return ((a.currentFunding || 0) / a.fundingGoal) - ((b.currentFunding || 0) / b.fundingGoal);
      case 'highest_goal':
        return b.fundingGoal - a.fundingGoal;
      case 'lowest_goal':
        return a.fundingGoal - b.fundingGoal;
      default:
        return 0;
    }
  });
  
  // Paginate projects
  const indexOfLastProject = page * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = sortedProjects.slice(indexOfFirstProject, indexOfLastProject);
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const getStatusColor = (status: string | undefined) => {
    if (!status) return theme.palette.grey[500];
    
    switch (status) {
      case 'SeekingFunding':
        return theme.palette.primary.main;
      case 'PartiallyFunded':
        return theme.palette.warning.main;
      case 'FullyFunded':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const getFormattedStatus = (status: string | undefined) => {
    if (!status) return '';
    
    // Convert camelCase to space-separated words
    return status.replace(/([A-Z])/g, ' $1').trim();
  };
  
  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };
  
  const getFundingProgress = (current: number | undefined, goal: number) => {
    if (!current) return 0;
    return (current / goal) * 100;
  };

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setCategoryFilter(event.target.value);
  };
  
  const handleStatusChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };
  
  const handleSortChange = (event: SelectChangeEvent<string>) => {
    setSortBy(event.target.value);
  };

  return (
    <AppLayout>
      <Box sx={{ mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Projects
          </Typography>
          {user?.role === 'Innovator' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => navigate('/projects/create')}
            >
              Create Project
            </Button>
          )}
        </Box>
        
        <GradientDivider />
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6} md={2}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<FilterList />}
                onClick={() => setShowFilters(!showFilters)}
              >
                Filters
              </Button>
            </Grid>
            <Grid item xs={6} md={4}>
              <FormControl fullWidth>
                <InputLabel id="sort-by-label">Sort By</InputLabel>
                <Select
                  labelId="sort-by-label"
                  value={sortBy}
                  onChange={handleSortChange}
                  label="Sort By"
                >
                  <MenuItem value="newest">Newest</MenuItem>
                  <MenuItem value="oldest">Oldest</MenuItem>
                  <MenuItem value="most_funded">Most Funded</MenuItem>
                  <MenuItem value="least_funded">Least Funded</MenuItem>
                  <MenuItem value="highest_goal">Highest Goal</MenuItem>
                  <MenuItem value="lowest_goal">Lowest Goal</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {showFilters && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="category-filter-label">Category</InputLabel>
                    <Select
                      labelId="category-filter-label"
                      value={categoryFilter}
                      onChange={handleCategoryChange}
                      label="Category"
                    >
                      {categories.map(category => (
                        <MenuItem key={category} value={category}>{category}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="status-filter-label">Status</InputLabel>
                    <Select
                      labelId="status-filter-label"
                      value={statusFilter}
                      onChange={handleStatusChange}
                      label="Status"
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="SeekingFunding">Seeking Funding</MenuItem>
                      <MenuItem value="PartiallyFunded">Partially Funded</MenuItem>
                      <MenuItem value="FullyFunded">Fully Funded</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : currentProjects.length === 0 ? (
          <Box sx={{ textAlign: 'center', my: 8 }}>
            <Typography variant="h5" color="text.secondary" gutterBottom>
              No projects found
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Try adjusting your search or filter criteria
            </Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3}>
              {currentProjects.map((project) => (
                <Grid item xs={12} sm={6} md={4} key={project.id}>
                  <Card
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 12px 20px rgba(0, 0, 0, 0.2)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        position: 'relative',
                        height: 180,
                        backgroundColor: 'rgba(0, 0, 0, 0.2)',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          width: '100%',
                          background: 'linear-gradient(transparent, rgba(0, 0, 0, 0.7))',
                          p: 1,
                          zIndex: 1,
                        }}
                      >
                        <Chip
                          label={getFormattedStatus(project.status)}
                          size="small"
                          sx={{
                            backgroundColor: getStatusColor(project.status),
                            color: 'white',
                            textTransform: 'capitalize',
                          }}
                        />
                      </Box>
                    </Box>
                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                      <Typography variant="h6" gutterBottom>
                        {project.title}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Business fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {project.category}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{
                          mb: 2,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {project.description}
                      </Typography>
                      
                      <Box sx={{ mt: 'auto' }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Funding Progress
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {Math.round(getFundingProgress(project.currentFunding, project.fundingGoal))}%
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            width: '100%',
                            height: 8,
                            bgcolor: 'rgba(255, 255, 255, 0.1)',
                            borderRadius: 1,
                            mb: 2,
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              top: 0,
                              height: '100%',
                              width: `${getFundingProgress(project.currentFunding, project.fundingGoal)}%`,
                              borderRadius: 1,
                              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2" fontWeight="medium">
                            ${(project.currentFunding || 0).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            of ${project.fundingGoal.toLocaleString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            fullWidth
                            startIcon={<Visibility />}
                            onClick={() => handleProjectClick(project.id)}
                          >
                            Details
                          </Button>
                          {user?.role === 'Investor' && project.status !== 'FullyFunded' && (
                            <Button
                              variant="contained"
                              color="secondary"
                              fullWidth
                              startIcon={<AttachMoney />}
                              onClick={() => handleProjectClick(project.id)}
                            >
                              Invest
                            </Button>
                          )}
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
            
            {sortedProjects.length > projectsPerPage && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={Math.ceil(sortedProjects.length / projectsPerPage)}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </AppLayout>
  );
};

export default Projects;