import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Card,
  CardContent,
  CardHeader,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Divider,
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  useTheme,
} from '@mui/material';
import {
  Add,
  Edit,
  Delete,
  Image,
  AttachFile,
  Send,
  Close,
  CloudUpload,
  MoreVert,
  CalendarToday,
  Person,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ProjectService } from '../../services';

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

// Define interfaces
interface ProjectUpdate {
  update_id?: string;
  title: string;
  content: string;
  created_at?: string;
  created_by?: {
    user_id?: string;
    full_name?: string;
  };
  attachments?: UpdateAttachment[];
}

interface UpdateAttachment {
  attachment_id?: string;
  name: string;
  file_type?: string;
  file_size?: number;
  file_path?: string;
}

const ProjectUpdates: React.FC = () => {
  const theme = useTheme();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State variables
  const [updates, setUpdates] = useState<ProjectUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Create/edit dialog state
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentUpdate, setCurrentUpdate] = useState<ProjectUpdate | null>(null);
  
  // Form state
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Fetch project updates
  useEffect(() => {
    const fetchUpdates = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const data = await ProjectService.getProjectUpdates(projectId);
        setUpdates(data);
        
      } catch (err) {
        console.error('Error fetching project updates:', err);
        setError('Failed to load project updates.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUpdates();
  }, [projectId]);
  
  // Handle opening create dialog
  const handleOpenCreateDialog = () => {
    setUpdateTitle('');
    setUpdateContent('');
    setAttachments([]);
    setCreateDialogOpen(true);
  };
  
  // Handle opening edit dialog
  const handleOpenEditDialog = (update: ProjectUpdate) => {
    setCurrentUpdate(update);
    setUpdateTitle(update.title);
    setUpdateContent(update.content);
    setAttachments([]);
    setEditDialogOpen(true);
  };
  
  // Handle opening delete dialog
  const handleOpenDeleteDialog = (update: ProjectUpdate) => {
    setCurrentUpdate(update);
    setDeleteDialogOpen(true);
  };
  
  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setAttachments(Array.from(event.target.files));
    }
  };
  
  // Remove attachment from the list
  const handleRemoveAttachment = (index: number) => {
    const newAttachments = [...attachments];
    newAttachments.splice(index, 1);
    setAttachments(newAttachments);
  };
  
  // Create new project update
  const handleCreateUpdate = async () => {
    if (!projectId || !updateTitle.trim() || !updateContent.trim()) {
      setError('Title and content are required.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call API to create update
      await ProjectService.addProjectUpdate(
        projectId,
        { title: updateTitle, content: updateContent },
        attachments.length > 0 ? attachments : undefined
      );
      
      // Refresh updates
      const updatedData = await ProjectService.getProjectUpdates(projectId);
      setUpdates(updatedData);
      
      // Clear form and close dialog
      setCreateDialogOpen(false);
      setSuccess('Update posted successfully!');
      
      // Reset form state
      setUpdateTitle('');
      setUpdateContent('');
      setAttachments([]);
      
    } catch (err) {
      console.error('Error creating project update:', err);
      setError('Failed to create update. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update existing project update
  const handleUpdateExisting = async () => {
    if (!projectId || !currentUpdate?.update_id || !updateTitle.trim() || !updateContent.trim()) {
      setError('Title and content are required.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call API to update
      await ProjectService.updateProjectUpdate(
        projectId,
        currentUpdate.update_id,
        { title: updateTitle, content: updateContent },
        attachments.length > 0 ? attachments : undefined
      );
      
      // Refresh updates
      const updatedData = await ProjectService.getProjectUpdates(projectId);
      setUpdates(updatedData);
      
      // Clear form and close dialog
      setEditDialogOpen(false);
      setSuccess('Update modified successfully!');
      
    } catch (err) {
      console.error('Error updating project update:', err);
      setError('Failed to modify update. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete project update
  const handleDeleteUpdate = async () => {
    if (!projectId || !currentUpdate?.update_id) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call API to delete
      await ProjectService.deleteProjectUpdate(projectId, currentUpdate.update_id);
      
      // Refresh updates
      const updatedData = await ProjectService.getProjectUpdates(projectId);
      setUpdates(updatedData);
      
      // Close dialog
      setDeleteDialogOpen(false);
      setSuccess('Update deleted successfully!');
      
    } catch (err) {
      console.error('Error deleting project update:', err);
      setError('Failed to delete update. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (e) {
      return dateString;
    }
  };
  
  // Determine file icon based on file type
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <AttachFile />;
    
    if (fileType.startsWith('image/')) {
      return <Image />;
    }
    
    return <AttachFile />;
  };
  
  // Render loading state
  if (loading && updates.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
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
          Project Updates
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenCreateDialog}
        >
          Post Update
        </Button>
      </Box>
      
      <StyledDivider />
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setError(null)}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ mb: 3 }}
          onClose={() => setSuccess(null)}
        >
          {success}
        </Alert>
      )}
      
      {/* Updates List */}
      {updates.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Updates Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Keep your investors informed by posting regular updates about your project progress.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<Add />}
            onClick={handleOpenCreateDialog}
          >
            Post Your First Update
          </Button>
        </Paper>
      ) : (
        <Box>
          {updates.map((update, index) => (
            <Card key={index} sx={{ mb: 3, overflow: 'visible' }}>
              <CardHeader
                title={update.title}
                action={
                  <IconButton onClick={() => handleOpenEditDialog(update)}>
                    <MoreVert />
                  </IconButton>
                }
                subheader={
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                    <CalendarToday fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      {formatDate(update.created_at)}
                    </Typography>
                    {update.created_by && (
                      <>
                        <Person fontSize="small" sx={{ mr: 0.5, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {update.created_by.full_name}
                        </Typography>
                      </>
                    )}
                  </Box>
                }
              />
              <CardContent>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line', mb: 3 }}>
                  {update.content}
                </Typography>
                
                {update.attachments && update.attachments.length > 0 && (
                  <Box>
                    <Typography variant="subtitle2" gutterBottom>
                      Attachments:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {update.attachments.map((attachment, attachmentIndex) => (
                        <Chip
                          key={attachmentIndex}
                          icon={getFileIcon(attachment.file_type)}
                          label={attachment.name}
                          variant="outlined"
                          onClick={() => window.open(attachment.file_path, '_blank')}
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Box>
                )}
                
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => handleOpenEditDialog(update)}
                    sx={{ mr: 1 }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    startIcon={<Delete />}
                    onClick={() => handleOpenDeleteDialog(update)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
      
      {/* Create Update Dialog */}
      <Dialog
        open={createDialogOpen}
        onClose={() => setCreateDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Post Project Update
          <IconButton
            aria-label="close"
            onClick={() => setCreateDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Update Title"
            fullWidth
            value={updateTitle}
            onChange={(e) => setUpdateTitle(e.target.value)}
            required
            error={updateTitle.trim() === ''}
            helperText={updateTitle.trim() === '' ? 'Title is required' : ''}
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Update Content"
            multiline
            rows={6}
            fullWidth
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            placeholder="Share project progress, achievements, challenges, or any news with your investors..."
            required
            error={updateContent.trim() === ''}
            helperText={updateContent.trim() === '' ? 'Content is required' : ''}
            sx={{ mb: 3 }}
          />
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Attachments (Optional)
            </Typography>
            
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
            >
              Upload Files
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
              />
            </Button>
            
            {attachments.length > 0 && (
              <List sx={{ mt: 2 }}>
                {attachments.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        {file.type.startsWith('image/') ? <Image /> : <AttachFile />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveAttachment(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleCreateUpdate} 
            variant="contained" 
            color="primary"
            disabled={loading || !updateTitle.trim() || !updateContent.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Post Update'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Update Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Project Update
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="normal"
            label="Update Title"
            fullWidth
            value={updateTitle}
            onChange={(e) => setUpdateTitle(e.target.value)}
            required
            error={updateTitle.trim() === ''}
            helperText={updateTitle.trim() === '' ? 'Title is required' : ''}
            sx={{ mb: 2 }}
          />
          
          <TextField
            label="Update Content"
            multiline
            rows={6}
            fullWidth
            value={updateContent}
            onChange={(e) => setUpdateContent(e.target.value)}
            required
            error={updateContent.trim() === ''}
            helperText={updateContent.trim() === '' ? 'Content is required' : ''}
            sx={{ mb: 3 }}
          />
          
          {currentUpdate?.attachments && currentUpdate.attachments.length > 0 && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Existing Attachments:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {currentUpdate.attachments.map((attachment, index) => (
                  <Chip
                    key={index}
                    icon={getFileIcon(attachment.file_type)}
                    label={attachment.name}
                    variant="outlined"
                    onClick={() => window.open(attachment.file_path, '_blank')}
                  />
                ))}
              </Box>
            </Box>
          )}
          
          <Box>
            <Typography variant="subtitle1" gutterBottom>
              Add New Attachments (Optional)
            </Typography>
            
            <Button
              component="label"
              variant="outlined"
              startIcon={<CloudUpload />}
            >
              Upload Files
              <input
                type="file"
                hidden
                multiple
                onChange={handleFileChange}
              />
            </Button>
            
            {attachments.length > 0 && (
              <List sx={{ mt: 2 }}>
                {attachments.map((file, index) => (
                  <ListItem key={index}>
                    <ListItemAvatar>
                      <Avatar>
                        {file.type.startsWith('image/') ? <Image /> : <AttachFile />}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={file.name}
                      secondary={`${(file.size / 1024).toFixed(1)} KB`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleRemoveAttachment(index)}>
                        <Delete />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateExisting} 
            variant="contained" 
            color="primary"
            disabled={loading || !updateTitle.trim() || !updateContent.trim()}
          >
            {loading ? <CircularProgress size={24} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this update? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button 
            onClick={handleDeleteUpdate} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ProjectUpdates;