import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Stepper,
  Step,
  StepLabel,
  Button,
  Typography,
  Grid,
  TextField,
  MenuItem,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  FormHelperText,
  Chip,
  OutlinedInput,
  SelectChangeEvent,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  IconButton,
  styled,
  useTheme,
} from '@mui/material';
import { 
  ArrowBack, 
  ArrowForward, 
  Check,
  Add,
  Delete,
  AttachFile,
  UploadFile,
  Description,
  CloudUpload,
} from '@mui/icons-material';
import AppLayout from '../components/layout/AppLayout';
import { useAuth } from '../contexts/AuthContext';

// Styled components
const GradientDivider = styled(Divider)(({ theme }) => ({
  background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  height: 3,
  marginBottom: theme.spacing(2),
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const UploadContainer = styled(Box)(({ theme }) => ({
  border: `2px dashed ${theme.palette.divider}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  textAlign: 'center',
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
}));

// Step titles
const steps = ['Basic Information', 'Project Details', 'Funding & Milestones', 'Documents', 'Review & Submit'];

// Sustainable Development Goals (SDGs)
const sdgs = [
  'SDG 1: No Poverty',
  'SDG 2: Zero Hunger',
  'SDG 3: Good Health and Well-being',
  'SDG 4: Quality Education',
  'SDG 5: Gender Equality',
  'SDG 6: Clean Water and Sanitation',
  'SDG 7: Affordable and Clean Energy',
  'SDG 8: Decent Work and Economic Growth',
  'SDG 9: Industry, Innovation and Infrastructure',
  'SDG 10: Reduced Inequality',
  'SDG 11: Sustainable Cities and Communities',
  'SDG 12: Responsible Consumption and Production',
  'SDG 13: Climate Action',
  'SDG 14: Life Below Water',
  'SDG 15: Life on Land',
  'SDG 16: Peace, Justice and Strong Institutions',
  'SDG 17: Partnerships for the Goals',
];

// Project categories
const categories = [
  'AgriTech',
  'CleanTech',
  'Energy',
  'HealthTech',
  'EdTech',
  'FinTech',
  'WaterTech',
  'Infrastructure',
  'Conservation',
  'Other',
];

const CreateProject: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    short_description: '',
    full_description: '',
    impact_statement: '',
    target_location: '',
    duration_months: 12,
    selected_sdgs: [] as string[],
    funding_goal: 0,
    min_investment: 1000,
    milestones: [
      {
        title: '',
        description: '',
        expected_completion_date: '',
        funding_percentage: 0,
        verification_method: '',
      }
    ],
    documents: [] as File[],
    team_members: [
      {
        name: '',
        role: '',
        bio: '',
      }
    ],
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  
  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value,
    });
    
    // Clear validation error when field is edited
    if (formErrors[name as string]) {
      setFormErrors({
        ...formErrors,
        [name as string]: '',
      });
    }
  };
  
  // Handle select changes for category
  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    const { value } = event.target;
    setFormData({
      ...formData,
      category: value,
    });
    
    if (formErrors.category) {
      setFormErrors({
        ...formErrors,
        category: '',
      });
    }
  };
  
  // Handle SDG selection
  const handleSDGChange = (event: SelectChangeEvent<typeof formData.selected_sdgs>) => {
    const { target: { value } } = event;
    setFormData({
      ...formData,
      selected_sdgs: typeof value === 'string' ? value.split(',') : value,
    });
  };
  
  // Handle milestone changes
  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    };
    
    setFormData({
      ...formData,
      milestones: updatedMilestones,
    });
  };
  
  // Add a new milestone
  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [
        ...formData.milestones,
        {
          title: '',
          description: '',
          expected_completion_date: '',
          funding_percentage: 0,
          verification_method: '',
        }
      ],
    });
  };
  
  // Remove a milestone
  const removeMilestone = (index: number) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones.splice(index, 1);
    
    setFormData({
      ...formData,
      milestones: updatedMilestones,
    });
  };
  
  // Handle team member changes
  const handleTeamMemberChange = (index: number, field: string, value: string) => {
    const updatedTeamMembers = [...formData.team_members];
    updatedTeamMembers[index] = {
      ...updatedTeamMembers[index],
      [field]: value,
    };
    
    setFormData({
      ...formData,
      team_members: updatedTeamMembers,
    });
  };
  
  // Add a new team member
  const addTeamMember = () => {
    setFormData({
      ...formData,
      team_members: [
        ...formData.team_members,
        {
          name: '',
          role: '',
          bio: '',
        }
      ],
    });
  };
  
  // Remove a team member
  const removeTeamMember = (index: number) => {
    const updatedTeamMembers = [...formData.team_members];
    updatedTeamMembers.splice(index, 1);
    
    setFormData({
      ...formData,
      team_members: updatedTeamMembers,
    });
  };
  
  // Handle file uploads
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        documents: [...formData.documents, ...Array.from(e.target.files)],
      });
    }
  };
  
  // Remove a document
  const removeDocument = (index: number) => {
    const updatedDocuments = [...formData.documents];
    updatedDocuments.splice(index, 1);
    
    setFormData({
      ...formData,
      documents: updatedDocuments,
    });
  };
  
  // Validate the current step
  const validateStep = () => {
    const errors: Record<string, string> = {};
    
    switch (activeStep) {
      case 0: // Basic Information
        if (!formData.title.trim()) {
          errors.title = 'Project title is required';
        }
        if (!formData.category) {
          errors.category = 'Category is required';
        }
        if (!formData.short_description.trim()) {
          errors.short_description = 'Short description is required';
        } else if (formData.short_description.length > 200) {
          errors.short_description = 'Short description must be 200 characters or less';
        }
        break;
        
      case 1: // Project Details
        if (!formData.full_description.trim()) {
          errors.full_description = 'Full description is required';
        }
        if (!formData.impact_statement.trim()) {
          errors.impact_statement = 'Impact statement is required';
        }
        if (formData.selected_sdgs.length === 0) {
          errors.selected_sdgs = 'At least one SDG must be selected';
        }
        if (!formData.target_location.trim()) {
          errors.target_location = 'Target location is required';
        }
        break;
        
      case 2: // Funding & Milestones
        if (formData.funding_goal <= 0) {
          errors.funding_goal = 'Funding goal must be greater than 0';
        }
        if (formData.min_investment <= 0) {
          errors.min_investment = 'Minimum investment must be greater than 0';
        }
        if (formData.min_investment > formData.funding_goal) {
          errors.min_investment = 'Minimum investment cannot be greater than funding goal';
        }
        
        // Validate milestones
        let totalPercentage = 0;
        formData.milestones.forEach((milestone, index) => {
          if (!milestone.title.trim()) {
            errors[`milestone_${index}_title`] = 'Milestone title is required';
          }
          if (!milestone.description.trim()) {
            errors[`milestone_${index}_description`] = 'Milestone description is required';
          }
          if (!milestone.expected_completion_date) {
            errors[`milestone_${index}_date`] = 'Expected completion date is required';
          }
          if (milestone.funding_percentage <= 0) {
            errors[`milestone_${index}_percentage`] = 'Funding percentage must be greater than 0';
          }
          
          totalPercentage += milestone.funding_percentage;
        });
        
        if (totalPercentage !== 100) {
          errors.milestone_total = 'Total funding percentage must equal 100%';
        }
        break;
        
      case 3: // Documents
        if (formData.documents.length === 0) {
          errors.documents = 'At least one document is required';
        }
        break;
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle next step
  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };
  
  // Handle back step
  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };
  
  // Handle form submission
  const handleSubmit = async () => {
    if (validateStep()) {
      setSubmitting(true);
      
      try {
        // In a real app, this would call an API to submit the project
        console.log('Project data submitted:', formData);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Redirect to projects page on success
        navigate('/projects');
      } catch (error) {
        console.error('Error submitting project:', error);
      } finally {
        setSubmitting(false);
      }
    }
  };
  
  // Render step content
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Project Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={!!formErrors.title}
                helperText={formErrors.title}
                required
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!formErrors.category} required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  name="category"
                  value={formData.category}
                  onChange={handleCategoryChange}
                  label="Category"
                >
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.category && <FormHelperText>{formErrors.category}</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Project Duration (months)"
                name="duration_months"
                type="number"
                value={formData.duration_months}
                onChange={handleChange}
                InputProps={{
                  inputProps: { min: 1, max: 60 },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Short Description (200 characters max)"
                name="short_description"
                value={formData.short_description}
                onChange={handleChange}
                error={!!formErrors.short_description}
                helperText={formErrors.short_description || `${formData.short_description.length}/200`}
                required
                multiline
                rows={2}
                inputProps={{ maxLength: 200 }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              {formData.team_members.map((member, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        Team Member {index + 1}
                      </Typography>
                      {index > 0 && (
                        <IconButton color="error" onClick={() => removeTeamMember(index)}>
                          <Delete />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Name"
                        value={member.name}
                        onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                        required={index === 0}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Role"
                        value={member.role}
                        onChange={(e) => handleTeamMemberChange(index, 'role', e.target.value)}
                        required={index === 0}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Bio"
                        value={member.bio}
                        onChange={(e) => handleTeamMemberChange(index, 'bio', e.target.value)}
                        multiline
                        rows={2}
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              <Button
                startIcon={<Add />}
                onClick={addTeamMember}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Team Member
              </Button>
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Full Project Description"
                name="full_description"
                value={formData.full_description}
                onChange={handleChange}
                error={!!formErrors.full_description}
                helperText={formErrors.full_description}
                required
                multiline
                rows={6}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Impact Statement"
                name="impact_statement"
                value={formData.impact_statement}
                onChange={handleChange}
                error={!!formErrors.impact_statement}
                helperText={formErrors.impact_statement}
                required
                multiline
                rows={3}
                placeholder="Describe the social, environmental, or economic impact of your project"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Target Location/Region"
                name="target_location"
                value={formData.target_location}
                onChange={handleChange}
                error={!!formErrors.target_location}
                helperText={formErrors.target_location}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth error={!!formErrors.selected_sdgs} required>
                <InputLabel id="sdg-label">Sustainable Development Goals</InputLabel>
                <Select
                  labelId="sdg-label"
                  multiple
                  value={formData.selected_sdgs}
                  onChange={handleSDGChange}
                  input={<OutlinedInput label="Sustainable Development Goals" />}
                  renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {selected.map((value) => (
                        <Chip key={value} label={value.split(':')[0]} />
                      ))}
                    </Box>
                  )}
                >
                  {sdgs.map((sdg) => (
                    <MenuItem key={sdg} value={sdg}>
                      {sdg}
                    </MenuItem>
                  ))}
                </Select>
                {formErrors.selected_sdgs && <FormHelperText>{formErrors.selected_sdgs}</FormHelperText>}
              </FormControl>
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Funding Goal ($)"
                name="funding_goal"
                type="number"
                value={formData.funding_goal}
                onChange={handleChange}
                error={!!formErrors.funding_goal}
                helperText={formErrors.funding_goal}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 1000 },
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Minimum Investment ($)"
                name="min_investment"
                type="number"
                value={formData.min_investment}
                onChange={handleChange}
                error={!!formErrors.min_investment}
                helperText={formErrors.min_investment}
                required
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  inputProps: { min: 100 },
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Milestones
              </Typography>
              {formErrors.milestone_total && (
                <Typography color="error" variant="body2" sx={{ mb: 2 }}>
                  {formErrors.milestone_total}
                </Typography>
              )}
              
              {formData.milestones.map((milestone, index) => (
                <Paper key={index} sx={{ p: 2, mb: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        Milestone {index + 1}
                      </Typography>
                      {index > 0 && (
                        <IconButton color="error" onClick={() => removeMilestone(index)}>
                          <Delete />
                        </IconButton>
                      )}
                    </Grid>
                    <Grid item xs={12} sm={8}>
                      <TextField
                        fullWidth
                        label="Milestone Title"
                        value={milestone.title}
                        onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                        error={!!formErrors[`milestone_${index}_title`]}
                        helperText={formErrors[`milestone_${index}_title`]}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        label="Funding (%)"
                        type="number"
                        value={milestone.funding_percentage}
                        onChange={(e) => handleMilestoneChange(index, 'funding_percentage', Number(e.target.value))}
                        error={!!formErrors[`milestone_${index}_percentage`]}
                        helperText={formErrors[`milestone_${index}_percentage`]}
                        required
                        InputProps={{
                          endAdornment: <InputAdornment position="end">%</InputAdornment>,
                          inputProps: { min: 1, max: 100 },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Milestone Description"
                        value={milestone.description}
                        onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                        error={!!formErrors[`milestone_${index}_description`]}
                        helperText={formErrors[`milestone_${index}_description`]}
                        required
                        multiline
                        rows={2}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Expected Completion Date"
                        type="date"
                        value={milestone.expected_completion_date}
                        onChange={(e) => handleMilestoneChange(index, 'expected_completion_date', e.target.value)}
                        error={!!formErrors[`milestone_${index}_date`]}
                        helperText={formErrors[`milestone_${index}_date`]}
                        required
                        InputLabelProps={{
                          shrink: true,
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Verification Method"
                        value={milestone.verification_method}
                        onChange={(e) => handleMilestoneChange(index, 'verification_method', e.target.value)}
                        placeholder="How will this milestone be verified?"
                      />
                    </Grid>
                  </Grid>
                </Paper>
              ))}
              
              <Button
                startIcon={<Add />}
                onClick={addMilestone}
                variant="outlined"
                sx={{ mt: 1 }}
              >
                Add Milestone
              </Button>
            </Grid>
          </Grid>
        );
        
      case 3:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <UploadContainer>
                <Typography variant="h6" gutterBottom>
                  Upload Project Documents
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Upload business plan, technical specifications, or other supporting documents
                </Typography>
                
                <Button
                  component="label"
                  variant="contained"
                  startIcon={<CloudUpload />}
                  sx={{ mt: 2 }}
                >
                  Upload Files
                  <VisuallyHiddenInput
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                  />
                </Button>
                
                {formErrors.documents && (
                  <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                    {formErrors.documents}
                  </Typography>
                )}
              </UploadContainer>
            </Grid>
            
            {formData.documents.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Uploaded Documents
                </Typography>
                <List>
                  {formData.documents.map((doc, index) => (
                    <ListItem
                      key={index}
                      secondaryAction={
                        <IconButton edge="end" onClick={() => removeDocument(index)}>
                          <Delete />
                        </IconButton>
                      }
                      sx={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', mb: 1, borderRadius: 1 }}
                    >
                      <ListItemText
                        primary={doc.name}
                        secondary={`${(doc.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Grid>
            )}
          </Grid>
        );
        
      case 4:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Project Summary
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Project Title
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.title}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.category}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Short Description
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.short_description}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Funding Goal
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      ${formData.funding_goal.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Minimum Investment
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      ${formData.min_investment.toLocaleString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Target Location
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.target_location}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Project Duration
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {formData.duration_months} months
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      SDGs Alignment
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                      {formData.selected_sdgs.map((sdg) => (
                        <Chip key={sdg} label={sdg.split(':')[0]} size="small" />
                      ))}
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Team Members
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                {formData.team_members.map((member, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">
                      {member.name} - {member.role}
                    </Typography>
                    {member.bio && (
                      <Typography variant="body2" color="text.secondary">
                        {member.bio}
                      </Typography>
                    )}
                    {index < formData.team_members.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Milestones
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                {formData.milestones.map((milestone, index) => (
                  <Box key={index} sx={{ mb: 2 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1">
                        {milestone.title}
                      </Typography>
                      <Chip 
                        label={`${milestone.funding_percentage}%`} 
                        color="primary" 
                        size="small" 
                      />
                    </Box>
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      {milestone.description}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      Expected completion: {milestone.expected_completion_date ? new Date(milestone.expected_completion_date).toLocaleDateString() : 'Not set'}
                    </Typography>
                    {index < formData.milestones.length - 1 && <Divider sx={{ my: 1 }} />}
                  </Box>
                ))}
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Documents
              </Typography>
              <Paper sx={{ p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                <List dense>
                  {formData.documents.map((doc, index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={doc.name}
                        secondary={`${(doc.size / 1024).toFixed(2)} KB`}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                By submitting this project, you agree to our terms and conditions. Your project will be reviewed by our team before being published.
              </Typography>
            </Grid>
          </Grid>
        );
        
      default:
        return 'Unknown step';
    }
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
        Create New Project
      </Typography>
      
      <GradientDivider />
      
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>
      
      <Paper sx={{ p: 3, mb: 3 }}>
        {getStepContent(activeStep)}
      </Paper>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="outlined"
          disabled={activeStep === 0}
          onClick={handleBack}
          startIcon={<ArrowBack />}
        >
          Back
        </Button>
        {activeStep === steps.length - 1 ? (
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            endIcon={<Check />}
            disabled={submitting}
          >
            {submitting ? 'Submitting...' : 'Submit Project'}
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            onClick={handleNext}
            endIcon={<ArrowForward />}
          >
            Next
          </Button>
        )}
      </Box>
    </AppLayout>
  );
};

export default CreateProject;