import React, { useState } from 'react';
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

// Styled components
const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

// Sample data for projects
const sampleProjects = [
  {
    id: 'proj_001',
    title: 'Smart Agriculture System',
    description: 'Sustainable farming using IoT sensors and AI for crop optimization',
    category: 'AgriTech',
    funding_goal: 50000,
    current_funding: 10000,
    status: 'seeking_funding',
    innovator: 'John Doe',
    creation_date: '2025-02-15',
    image: '/static/images/projects/agriculture.jpg',
    sdgs: ['SDG 2', 'SDG 12'],
  },
  {
    id: 'proj_002',
    title: 'Clean Water Initiative',
    description: 'Water purification technology for rural communities using renewable energy',
    category: 'CleanTech',
    funding_goal: 75000,
    current_funding: 56250,
    status: 'partially_funded',
    innovator: 'Sarah Johnson',
    creation_date: '2025-01-20',
    image: '/static/images/projects/water.jpg',
    sdgs: ['SDG 6', 'SDG 7'],
  },
  {
    id: 'proj_003',
    title: 'Solar Micro-Grids',
    description: 'Decentralized solar power solutions for off-grid communities',
    category: 'Energy',
    funding_goal: 120000,
    current_funding: 120000,
    status: 'fully_funded',
    innovator: 'Michael Brown',
    creation_date: '2025-01-05',
    image: '/static/images/projects/solar.jpg',
    sdgs: ['SDG 7', 'SDG 13'],
  },
  {
    id: 'proj_004',
    title: 'Healthcare AI Diagnostics',
    description: 'Machine learning platform for early disease detection in low-resource settings',
    category: 'HealthTech',
    funding_goal: 200000,
    current_funding: 80000,
    status: 'partially_funded',
    innovator: 'Emily Chen',
    creation_date: '2025-02-28',
    image: '/static/images/projects/healthcare.jpg',
    sdgs: ['SDG 3', 'SDG 10'],
  },
  {
    id: 'proj_005',
    title: 'Waste to Energy Converter',
    description: 'Technology that transforms organic waste into biogas for cooking and electricity',
    category: 'CleanTech',
    funding_goal: 90000,
    current_funding: 27000,
    status: 'seeking_funding',
    innovator: 'Robert Miller',
    creation_date: '2025-03-01',
    image: '/static/images/projects/waste.jpg',
    sdgs: ['SDG 7', 'SDG 12'],
  },
  {
    id: 'proj_006',
    title: 'Digital Education Platform',
    description: 'Offline-capable learning software for schools without reliable internet',
    category: 'EdTech',
    funding_goal: 65000,
    current_funding: 65000,
    status: 'fully_funded',
    innovator: 'Jessica Williams',
    creation_date: '2025-01-10',
    image: '/static/images/projects/education.jpg',
    sdgs: ['SDG 4', 'SDG 10'],
  },
];

const Projects: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  
  const projectsPerPage = 6;

  // Get unique categories from sample data
  const categories = ['All', ...Array.from(new Set(sampleProjects.map(project => project.category)))];
  
  // Filter and sort projects
  const filteredProjects = sampleProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        project.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || project.category === categoryFilter;
    const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });
  
  const sortedProjects = [...filteredProjects].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.creation_date).getTime() - new Date(a.creation_date).getTime();
      case 'oldest':
        return new Date(a.creation_date).getTime() - new Date(b.creation_date).getTime();
      case 'most_funded':
        return (b.current_funding / b.funding_goal) - (a.current_funding / a.funding_goal);
      case 'least_funded':
        return (a.current_funding / a.funding_goal) - (b.current_funding / b.funding_goal);
      case 'highest_goal':
        return b.funding_goal - a.funding_goal;
      case 'lowest_goal':
        return a.funding_goal - b.funding_goal;
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
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'seeking_funding':
        return theme.palette.primary.main;
      case 'partially_funded':
        return theme.palette.warning.main;
      case 'fully_funded':
        return theme.palette.success.main;
      default:
        return theme.palette.grey[500];
    }
  };
  
  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
  };
  
  const getFundingProgress = (current: number, goal: number) => {
    return (current / goal) * 100;
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
                  onChange={(e) => setSortBy(e.target.value)}
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
                      onChange={(e) => setCategoryFilter(e.target.value)}
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
                      onChange={(e) => setStatusFilter(e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="All">All</MenuItem>
                      <MenuItem value="seeking_funding">Seeking Funding</MenuItem>
                      <MenuItem value="partially_funded">Partially Funded</MenuItem>
                      <MenuItem value="fully_funded">Fully Funded</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
        
        {currentProjects.length === 0 ? (
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
                          label={project.status.replace('_', ' ')}
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
                            {Math.round(getFundingProgress(project.current_funding, project.funding_goal))}%
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
                              width: `${getFundingProgress(project.current_funding, project.funding_goal)}%`,
                              borderRadius: 1,
                              background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                          <Typography variant="body2" fontWeight="medium">
                            ${project.current_funding.toLocaleString()}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            of ${project.funding_goal.toLocaleString()}
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
                          {user?.role === 'Investor' && project.status !== 'fully_funded' && (
                            <Button
                              variant="contained"
                              color="secondary"
                              fullWidth
                              startIcon={<AttachMoney />}
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