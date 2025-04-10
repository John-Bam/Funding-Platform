import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Stepper,
  Step,
  StepLabel,
  Chip,
  LinearProgress,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  IconButton,
  Alert,
  Divider,
  Card,
  CardContent,
  InputAdornment,
  useTheme,
} from '@mui/material';
import {
  CheckCircle,
  Send,
  AttachFile,
  Edit,
  Cancel,
  Delete,
  Info,
  CloudUpload,
  ArrowBack,
  Close,
  Add,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { MilestoneService } from '../../services';

// Styled components using MUI system
const StyledDivider = (props) => {
  const theme = useTheme();
  return (
    <Divider
      sx={{
        background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        height: 3,
        marginBottom: theme.spacing(2),
      }}
      {...props}
    />
  );
};

// Milestone interface based on backend structure
interface MilestoneData {
  milestone_id?: string;
  title: string;
  description: string;
  expected_completion_date: string;
  actual_completion_date?: string;
  funding_percentage: number;
  verification_method: string;
  status?: string;
  display_order?: number;
  documents?: MilestoneDocument[];
}

interface MilestoneDocument {
  document_id?: string;
  name: string;
  size: number;
  upload_date?: string;
  file_path?: string;
}

const MilestoneManagement: React.FC = () => {
  const theme = useTheme();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // State variables
  const [milestones, setMilestones] = useState<MilestoneData[]>([]);
  const [originalMilestones, setOriginalMilestones] = useState<MilestoneData[]>([]);
  const [currentMilestone, setCurrentMilestone] = useState<MilestoneData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false);
  const [completionNotes, setCompletionNotes] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [documentDialogOpen, setDocumentDialogOpen] = useState(false);
  const [selectedMilestoneForDocs, setSelectedMilestoneForDocs] = useState<MilestoneData | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch milestones using the API service
  useEffect(() => {
    const fetchMilestones = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await MilestoneService.getMilestones(projectId);
        
        setMilestones(data);
        setOriginalMilestones([...data]);
        
        // Find active milestone
        const activeMilestone = data.find(m => m.status === 'Active');
        if (activeMilestone) {
          setCurrentMilestone(activeMilestone);
        }
        
      } catch (err) {
        console.error('Error fetching milestones:', err);
        setError('Failed to load milestones. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchMilestones();
  }, [projectId]);

  // Handle milestone changes
  const handleMilestoneChange = (index: number, field: string, value: any) => {
    const updatedMilestones = [...milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value,
    };
    
    setMilestones(updatedMilestones);
  };
  
  // Add a new milestone
  const addMilestone = () => {
    const newMilestone: MilestoneData = {
      title: '',
      description: '',
      expected_completion_date: '',
      funding_percentage: 0,
      verification_method: '',
      status: 'Planned',
    };
    
    setMilestones([...milestones, newMilestone]);
  };
  
  // Remove a milestone
  const removeMilestone = (index: number) => {
    // Only allow removing if not yet persisted to backend or if in Planned status
    const milestone = milestones[index];
    
    if (milestone.milestone_id && milestone.status !== 'Planned') {
      setError("Can only remove milestones in 'Planned' status");
      return;
    }
    
    const updatedMilestones = [...milestones];
    updatedMilestones.splice(index, 1);
    
    setMilestones(updatedMilestones);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setUploadedFiles(Array.from(event.target.files));
    }
  };

  // Open document dialog for a milestone
  const handleViewDocuments = (milestone: MilestoneData) => {
    setSelectedMilestoneForDocs(milestone);
    setDocumentDialogOpen(true);
  };

  // Open completion dialog for a milestone
  const handleCompleteMilestone = (milestone: MilestoneData) => {
    setCurrentMilestone(milestone);
    setCompletionDialogOpen(true);
  };

  // Submit milestone completion
  const handleSubmitCompletion = async () => {
    if (!projectId || !currentMilestone || !currentMilestone.milestone_id) {
      setError('Missing project or milestone information');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to mark milestone as completed
      await MilestoneService.completeMilestone(
        projectId,
        currentMilestone.milestone_id,
        { notes: completionNotes },
        uploadedFiles
      );
      
      // Refresh milestones to get updated data
      const updatedMilestones = await MilestoneService.getMilestones(projectId);
      setMilestones(updatedMilestones);
      setOriginalMilestones([...updatedMilestones]);
      
      // Update UI state
      setSuccessMessage('Milestone marked as completed successfully!');
      setCompletionDialogOpen(false);
      setCompletionNotes('');
      setUploadedFiles([]);
      
    } catch (err) {
      console.error('Error completing milestone:', err);
      setError('Failed to complete milestone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Submit milestone for verification
  const handleSubmitForVerification = (milestone: MilestoneData) => {
    setCurrentMilestone(milestone);
    setSubmitDialogOpen(true);
  };

  // Confirm verification submission
  const handleConfirmSubmission = async () => {
    if (!projectId || !currentMilestone || !currentMilestone.milestone_id) {
      setError('Missing project or milestone information');
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to submit for verification
      await MilestoneService.submitForVerification(projectId, currentMilestone.milestone_id);
      
      // Refresh milestones to get updated data
      const updatedMilestones = await MilestoneService.getMilestones(projectId);
      setMilestones(updatedMilestones);
      setOriginalMilestones([...updatedMilestones]);
      
      // Update UI state
      setSuccessMessage('Milestone submitted for verification successfully!');
      setSubmitDialogOpen(false);
      
    } catch (err) {
      console.error('Error submitting milestone for verification:', err);
      setError('Failed to submit milestone for verification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle edit mode
  const toggleEditMode = () => {
    if (editMode) {
      // Discard changes
      setMilestones([...originalMilestones]);
    }
    setEditMode(!editMode);
  };

  // Save milestone changes
  const saveMilestoneChanges = async () => {
    if (!projectId) {
      setError('Missing project information');
      return;
    }
    
    // Validate milestones
    let totalPercentage = 0;
    for (const milestone of milestones) {
      if (!milestone.title) {
        setError('All milestones must have a title');
        return;
      }
      if (!milestone.description) {
        setError('All milestones must have a description');
        return;
      }
      if (!milestone.expected_completion_date) {
        setError('All milestones must have an expected completion date');
        return;
      }
      if (milestone.funding_percentage <= 0) {
        setError('All milestones must have a funding percentage greater than 0');
        return;
      }
      totalPercentage += milestone.funding_percentage;
    }
    
    if (totalPercentage !== 100) {
      setError(`Total funding percentage must equal 100% (currently ${totalPercentage}%)`);
      return;
    }
    
    try {
      setLoading(true);
      
      // Call API to update milestones
      await MilestoneService.updateMilestones(projectId, milestones);
      
      // Refresh milestones to get updated data
      const updatedMilestones = await MilestoneService.getMilestones(projectId);
      setMilestones(updatedMilestones);
      setOriginalMilestones([...updatedMilestones]);
      
      // Update UI state
      setSuccessMessage('Milestones updated successfully!');
      setEditMode(false);
      
    } catch (err) {
      console.error('Error updating milestones:', err);
      setError('Failed to update milestones. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate progress
  const calculateProgress = () => {
    if (milestones.length === 0) return 0;
    
    const completed = milestones.filter(m => 
      m.status === 'Completed' || 
      m.status === 'PendingVerification' || 
      m.status === 'Approved'
    ).length;
    
    return (completed / milestones.length) * 100;
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not set';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };

  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Active':
        return 'primary';
      case 'Planned':
        return 'default';
      case 'PendingVerification':
        return 'warning';
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'default';
    }
  };

  // Render loading state
  if (loading && milestones.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <LinearProgress />
      </Box>
    );
  }

  // Render error state
  if (error && milestones.length === 0) {
    return (
      <Box sx={{ p: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          onClick={() => navigate(`/projects/${projectId}`)} 
          sx={{ mt: 2 }}
          startIcon={<ArrowBack />}
        >
          Back to Project
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Milestone Management
        </Typography>
        
        <Button
          variant={editMode ? "outlined" : "contained"}
          color={editMode ? "secondary" : "primary"}
          startIcon={editMode ? <Cancel /> : <Edit />}
          onClick={toggleEditMode}
        >
          {editMode ? 'Cancel' : 'Edit Milestones'}
        </Button>
      </Box>
      
      <StyledDivider />
      
      {successMessage && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccessMessage(null)}
        >
          {successMessage}
        </Alert>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {/* Project Progress */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Project Progress
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Overall Progress
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(calculateProgress())}%
            </Typography>
          </Box>
          <LinearProgress 
            variant="determinate" 
            value={calculateProgress()} 
            sx={{ height: 10, borderRadius: 5 }}
          />
        </Box>
        
        <Stepper activeStep={milestones.findIndex(m => m.status === 'Active')} alternativeLabel>
          {milestones.map((milestone, index) => (
            <Step 
              key={index} 
              completed={
                milestone.status === 'Completed' || 
                milestone.status === 'PendingVerification' || 
                milestone.status === 'Approved'
              }
            >
              <StepLabel>{milestone.title}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>
      
      {/* Current Active Milestone */}
      {currentMilestone && currentMilestone.status === 'Active' && (
        <Paper sx={{ p: 3, mb: 4, border: `1px solid ${theme.palette.primary.main}` }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Current Active Milestone
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="h5">{currentMilestone.title}</Typography>
              <Typography variant="body1" sx={{ mt: 1, mb: 2 }}>
                {currentMilestone.description}
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Expected Completion
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(currentMilestone.expected_completion_date)}
                  </Typography>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Funding Percentage
                  </Typography>
                  <Typography variant="body1">
                    {currentMilestone.funding_percentage}%
                  </Typography>
                </Grid>
                <Grid item xs={6} md={4}>
                  <Typography variant="body2" color="text.secondary">
                    Status
                  </Typography>
                  <Chip 
                    label={currentMilestone.status} 
                    color={getStatusColor(currentMilestone.status) as any}
                    size="small" 
                  />
                </Grid>
              </Grid>
              
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Verification Method:
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {currentMilestone.verification_method || 'Not specified'}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={4} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Box sx={{ textAlign: 'center' }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<CheckCircle />}
                  onClick={() => handleCompleteMilestone(currentMilestone)}
                  sx={{ mb: 2 }}
                  disabled={editMode || loading}
                >
                  Mark as Completed
                </Button>
                
                <Typography variant="body2" color="text.secondary">
                  Once completed, you'll need to submit this milestone for verification
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Milestones List */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h6">
            All Milestones
          </Typography>
          
          {editMode && (
            <Box>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={addMilestone}
                sx={{ mr: 2 }}
              >
                Add Milestone
              </Button>
              
              <Button
                variant="contained"
                color="primary"
                onClick={saveMilestoneChanges}
                disabled={loading}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Box>
        
        {/* Milestone Cards */}
        {milestones.map((milestone, index) => (
          <Card 
            key={index} 
            sx={{ 
              mb: 2, 
              border: milestone.status === 'Active' 
                ? `1px solid ${theme.palette.primary.main}`
                : 'none'
            }}
          >
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mr: 2 }}>
                      {editMode ? (
                        <TextField
                          value={milestone.title}
                          onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                          variant="standard"
                          error={!milestone.title}
                          helperText={!milestone.title ? "Title is required" : ""}
                          sx={{ minWidth: 300 }}
                        />
                      ) : (
                        milestone.title
                      )}
                    </Typography>
                    <Chip 
                      label={milestone.status} 
                      color={getStatusColor(milestone.status) as any}
                      size="small" 
                    />
                  </Box>
                  
                  {editMode && milestone.status === 'Planned' && index > 0 && (
                    <IconButton 
                      color="error" 
                      onClick={() => removeMilestone(index)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </Grid>
                
                <Grid item xs={12}>
                  {editMode ? (
                    <TextField
                      fullWidth
                      multiline
                      rows={2}
                      value={milestone.description}
                      onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                      error={!milestone.description}
                      helperText={!milestone.description ? "Description is required" : ""}
                    />
                  ) : (
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {milestone.description}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Expected Completion
                  </Typography>
                  {editMode ? (
                    <TextField
                      type="date"
                      value={milestone.expected_completion_date}
                      onChange={(e) => handleMilestoneChange(index, 'expected_completion_date', e.target.value)}
                      error={!milestone.expected_completion_date}
                      helperText={!milestone.expected_completion_date ? "Date is required" : ""}
                      InputLabelProps={{ shrink: true }}
                      fullWidth
                      size="small"
                      margin="dense"
                    />
                  ) : (
                    <Typography variant="body1">
                      {formatDate(milestone.expected_completion_date)}
                    </Typography>
                  )}
                </Grid>
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Funding Percentage
                  </Typography>
                  {editMode ? (
                    <TextField
                      type="number"
                      value={milestone.funding_percentage}
                      onChange={(e) => handleMilestoneChange(index, 'funding_percentage', Number(e.target.value))}
                      error={milestone.funding_percentage <= 0}
                      helperText={milestone.funding_percentage <= 0 ? "Must be greater than 0" : ""}
                      InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      }}
                      fullWidth
                      size="small"
                      margin="dense"
                    />
                  ) : (
                    <Typography variant="body1">
                      {milestone.funding_percentage}%
                    </Typography>
                  )}
                </Grid>
                
                {milestone.actual_completion_date && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Typography variant="body2" color="text.secondary">
                      Actual Completion
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(milestone.actual_completion_date)}
                    </Typography>
                  </Grid>
                )}
                
                <Grid item xs={12} sm={6} md={3}>
                  <Typography variant="body2" color="text.secondary">
                    Verification Method
                  </Typography>
                  {editMode ? (
                    <TextField
                      value={milestone.verification_method}
                      onChange={(e) => handleMilestoneChange(index, 'verification_method', e.target.value)}
                      fullWidth
                      size="small"
                      margin="dense"
                      multiline
                      rows={2}
                    />
                  ) : (
                    <Typography variant="body1">
                      {milestone.verification_method || 'Not specified'}
                    </Typography>
                  )}
                </Grid>
                
                {/* Documents section */}
                {milestone.documents && milestone.documents.length > 0 && (
                  <Grid item xs={12}>
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Documentation:
                      </Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {milestone.documents.slice(0, 3).map((doc, docIndex) => (
                          <Chip
                            key={docIndex}
                            label={doc.name}
                            size="small"
                            variant="outlined"
                            icon={<AttachFile />}
                            onClick={() => window.open(doc.file_path, '_blank')}
                          />
                        ))}
                        
                        {milestone.documents.length > 3 && (
                          <Chip
                            label={`+${milestone.documents.length - 3} more`}
                            size="small"
                            variant="outlined"
                            onClick={() => handleViewDocuments(milestone)}
                          />
                        )}
                      </Box>
                    </Box>
                  </Grid>
                )}
                
                {/* Actions */}
                {!editMode && (
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    {milestone.status === 'Active' && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<CheckCircle />}
                        onClick={() => handleCompleteMilestone(milestone)}
                      >
                        Mark as Completed
                      </Button>
                    )}
                    
                    {milestone.status === 'Completed' && (
                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<Send />}
                        onClick={() => handleSubmitForVerification(milestone)}
                      >
                        Submit for Verification
                      </Button>
                    )}
                    
                    {milestone.documents && milestone.documents.length > 0 && (
                      <Button
                        variant="outlined"
                        sx={{ ml: 2 }}
                        onClick={() => handleViewDocuments(milestone)}
                      >
                        View Documents
                      </Button>
                    )}
                  </Grid>
                )}
              </Grid>
            </CardContent>
          </Card>
        ))}
        
        {milestones.length === 0 && (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
            No milestones found for this project.
          </Typography>
        )}
      </Paper>
      
      {/* Milestone Completion Dialog */}
      <Dialog
        open={completionDialogOpen}
        onClose={() => setCompletionDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Mark Milestone as Completed
          <IconButton
            aria-label="close"
            onClick={() => setCompletionDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText paragraph>
            You're about to mark <strong>{currentMilestone?.title}</strong> as completed. 
            Please upload any relevant documentation that proves the milestone has been completed 
            according to the verification method: "{currentMilestone?.verification_method}".
          </DialogContentText>
          
          <TextField
            fullWidth
            label="Completion Notes"
            multiline
            rows={4}
            value={completionNotes}
            onChange={(e) => setCompletionNotes(e.target.value)}
            placeholder="Describe what you've accomplished and how you've met the milestone requirements..."
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle1" gutterBottom>
            Verification Documents
          </Typography>
          
          <Box
            sx={{
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              mb: 2,
              bgcolor: 'rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)',
              },
            }}
            onClick={() => document.getElementById('milestone-files')?.click()}
          >
            <input
              type="file"
              id="milestone-files"
              multiple
              style={{ display: 'none' }}
              onChange={handleFileUpload}
            />
            <CloudUpload fontSize="large" color="primary" sx={{ mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Upload Documentation
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag files here or click to browse
            </Typography>
          </Box>
          
          {uploadedFiles.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected Files:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {uploadedFiles.map((file, index) => (
                  <Chip
                    key={index}
                    label={`${file.name} (${(file.size / 1024).toFixed(1)} KB)`}
                    onDelete={() => {
                      const newFiles = [...uploadedFiles];
                      newFiles.splice(index, 1);
                      setUploadedFiles(newFiles);
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCompletionDialogOpen(false)} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmitCompletion} 
            variant="contained"
            color="primary"
            disabled={uploadedFiles.length === 0}
          >
            Mark as Completed
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Milestone Verification Dialog */}
      <Dialog
        open={submitDialogOpen}
        onClose={() => setSubmitDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Submit Milestone for Verification
          <IconButton
            aria-label="close"
            onClick={() => setSubmitDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You're about to submit the milestone <strong>{currentMilestone?.title}</strong> for verification.
            Once submitted, the platform administrators will review your documentation and 
            either approve or reject the milestone.
          </DialogContentText>
          
          {currentMilestone?.documents && currentMilestone.documents.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Uploaded Documentation:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currentMilestone.documents.map((doc, index) => (
                  <Chip
                    key={index}
                    label={doc.name}
                    size="small"
                    variant="outlined"
                    icon={<AttachFile />}
                    onClick={() => window.open(doc.file_path, '_blank')}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Alert severity="info" sx={{ mt: 3 }}>
            Upon approval, funds for this milestone will be released to your account from escrow.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setSubmitDialogOpen(false)} 
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleConfirmSubmission} 
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Submit for Verification
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Document Viewer Dialog */}
      <Dialog
        open={documentDialogOpen}
        onClose={() => setDocumentDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Documents for {selectedMilestoneForDocs?.title}
          <IconButton
            aria-label="close"
            onClick={() => setDocumentDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedMilestoneForDocs?.documents && selectedMilestoneForDocs.documents.length > 0 ? (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Milestone Documentation:
              </Typography>
              <Grid container spacing={2}>
                {selectedMilestoneForDocs.documents.map((doc, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Paper
                      sx={{ 
                        p: 2, 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        '&:hover': {
                          boxShadow: 4,
                          transform: 'translateY(-4px)'
                        }
                      }}
                      onClick={() => window.open(doc.file_path, '_blank')}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <AttachFile color="primary" sx={{ mr: 1 }} />
                        <Typography variant="subtitle2" noWrap>
                          {doc.name}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        Size: {(doc.size / 1024).toFixed(1)} KB
                      </Typography>
                      {doc.upload_date && (
                        <Typography variant="caption" color="text.secondary" display="block">
                          Uploaded: {formatDate(doc.upload_date)}
                        </Typography>
                      )}
                      <Button 
                        variant="outlined" 
                        size="small" 
                        sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                      >
                        View Document
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ) : (
            <Typography>No documents found for this milestone.</Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDocumentDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MilestoneManagement;