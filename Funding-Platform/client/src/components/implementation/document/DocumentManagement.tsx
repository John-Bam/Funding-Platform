import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  FormHelperText,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Alert,
  CircularProgress,
  Menu,
  Tooltip,
  Divider,
  useTheme,
  SelectChangeEvent,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { DocumentService } from '../../services';

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
interface DocumentData {
  document_id?: string;
  name: string;
  description?: string;
  category: string;
  is_public: boolean;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  upload_date?: string;
  uploaded_by?: string;
}

// Sort fields type
type SortField = 'name' | 'upload_date' | 'file_size' | 'category';
type SortDirection = 'asc' | 'desc';

const DocumentManagement: React.FC = () => {
  const theme = useTheme();
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State variables
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filtering and sorting state
  const [filterText, setFilterText] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterVisibility, setFilterVisibility] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('upload_date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Document categories
  const [categories, setCategories] = useState<string[]>([]);
  
  // Dialog states
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentDocument, setCurrentDocument] = useState<DocumentData | null>(null);
  
  // Menu state
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDocumentId, setMenuDocumentId] = useState<string | null>(null);
  
  // Upload form state
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentCategory, setDocumentCategory] = useState('');
  const [documentIsPublic, setDocumentIsPublic] = useState(true);
  
  // Sort menu state
  const [sortMenuAnchorEl, setSortMenuAnchorEl] = useState<null | HTMLElement>(null);
  
  // Fetch documents and categories
  useEffect(() => {
    const fetchData = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Fetch document categories
        const categoriesData = await DocumentService.getDocumentCategories();
        setCategories(categoriesData);
        
        // Fetch documents
        const filters = {
          category: filterCategory !== 'all' ? filterCategory : undefined,
          isPublic: filterVisibility !== 'all' ? filterVisibility === 'true' : undefined,
          search: filterText || undefined,
        };
        
        const documentsData = await DocumentService.getProjectDocuments(projectId, filters);
        setDocuments(documentsData);
        
      } catch (err) {
        console.error('Error fetching documents data:', err);
        setError('Failed to load documents. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [projectId, filterCategory, filterVisibility, filterText]);
  
  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      setDocumentFile(file);
      
      // Auto-fill name field with file name (without extension)
      const fileName = file.name.replace(/\.[^/.]+$/, "").replace(/_/g, " ");
      setDocumentName(fileName);
    }
  };
  
  // Handle category filter change
  const handleCategoryFilterChange = (event: SelectChangeEvent) => {
    setFilterCategory(event.target.value);
    setPage(0); // Reset pagination
  };
  
  // Handle visibility filter change
  const handleVisibilityFilterChange = (event: SelectChangeEvent) => {
    setFilterVisibility(event.target.value);
    setPage(0); // Reset pagination
  };
  
  // Handle sort change
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field with default direction
      setSortField(field);
      setSortDirection('asc');
    }
    setSortMenuAnchorEl(null);
  };
  
  // Handle open document action menu
  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>, documentId: string) => {
    setMenuAnchorEl(event.currentTarget);
    setMenuDocumentId(documentId);
  };
  
  // Handle close document action menu
  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setMenuDocumentId(null);
  };
  
  // Handle open sort menu
  const handleOpenSortMenu = (event: React.MouseEvent<HTMLElement>) => {
    setSortMenuAnchorEl(event.currentTarget);
  };
  
  // Handle close sort menu
  const handleCloseSortMenu = () => {
    setSortMenuAnchorEl(null);
  };
  
  // Handle document upload dialog
  const handleOpenUploadDialog = () => {
    setDocumentFile(null);
    setDocumentName('');
    setDocumentDescription('');
    setDocumentCategory('');
    setDocumentIsPublic(true);
    setUploadDialogOpen(true);
  };
  
  // Handle document edit dialog
  const handleOpenEditDialog = (document: DocumentData) => {
    setCurrentDocument(document);
    setDocumentName(document.name);
    setDocumentDescription(document.description || '');
    setDocumentCategory(document.category);
    setDocumentIsPublic(document.is_public);
    setEditDialogOpen(true);
  };
  
  // Handle document delete dialog
  const handleOpenDeleteDialog = (document: DocumentData) => {
    setCurrentDocument(document);
    setDeleteDialogOpen(true);
  };
  
  // Upload new document
  const handleUploadDocument = async () => {
    if (!projectId || !documentFile || !documentName.trim() || !documentCategory) {
      setError('Please fill in all required fields and select a file.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call API to upload document
      const documentData = {
        name: documentName.trim(),
        description: documentDescription.trim(),
        category: documentCategory,
        is_public: documentIsPublic,
      };
      
      await DocumentService.uploadDocument(projectId, documentData, documentFile);
      
      // Refresh documents
      const filters = {
        category: filterCategory !== 'all' ? filterCategory : undefined,
        isPublic: filterVisibility !== 'all' ? filterVisibility === 'true' : undefined,
        search: filterText || undefined,
      };
      
      const documentsData = await DocumentService.getProjectDocuments(projectId, filters);
      setDocuments(documentsData);
      
      // Clear form and close dialog
      setUploadDialogOpen(false);
      setSuccess('Document uploaded successfully!');
      
      // Reset form state
      setDocumentFile(null);
      setDocumentName('');
      setDocumentDescription('');
      setDocumentCategory('');
      setDocumentIsPublic(true);
      
    } catch (err) {
      console.error('Error uploading document:', err);
      setError('Failed to upload document. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Update document
  const handleUpdateDocument = async () => {
    if (!projectId || !currentDocument?.document_id || !documentName.trim() || !documentCategory) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call API to update document
      const documentData = {
        name: documentName.trim(),
        description: documentDescription.trim(),
        category: documentCategory,
        is_public: documentIsPublic,
      };
      
      await DocumentService.updateDocument(projectId, currentDocument.document_id, documentData);
      
      // Refresh documents
      const filters = {
        category: filterCategory !== 'all' ? filterCategory : undefined,
        isPublic: filterVisibility !== 'all' ? filterVisibility === 'true' : undefined,
        search: filterText || undefined,
      };
      
      const documentsData = await DocumentService.getProjectDocuments(projectId, filters);
      setDocuments(documentsData);
      
      // Close dialog
      setEditDialogOpen(false);
      setSuccess('Document updated successfully!');
      
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Delete document
  const handleDeleteDocument = async () => {
    if (!projectId || !currentDocument?.document_id) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Call API to delete document
      await DocumentService.deleteDocument(projectId, currentDocument.document_id);
      
      // Refresh documents
      const filters = {
        category: filterCategory !== 'all' ? filterCategory : undefined,
        isPublic: filterVisibility !== 'all' ? filterVisibility === 'true' : undefined,
        search: filterText || undefined,
      };
      
      const documentsData = await DocumentService.getProjectDocuments(projectId, filters);
      setDocuments(documentsData);
      
      // Close dialog
      setDeleteDialogOpen(false);
      setSuccess('Document deleted successfully!');
      
    } catch (err) {
      console.error('Error deleting document:', err);
      setError('Failed to delete document. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Toggle document visibility
  const handleToggleVisibility = async (documentId: string, isPublic: boolean) => {
    if (!projectId) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Call API to toggle visibility
      await DocumentService.toggleDocumentVisibility(projectId, documentId, !isPublic);
      
      // Refresh documents
      const filters = {
        category: filterCategory !== 'all' ? filterCategory : undefined,
        isPublic: filterVisibility !== 'all' ? filterVisibility === 'true' : undefined,
        search: filterText || undefined,
      };
      
      const documentsData = await DocumentService.getProjectDocuments(projectId, filters);
      setDocuments(documentsData);
      
      setSuccess(`Document visibility changed to ${!isPublic ? 'public' : 'private'}.`);
      
    } catch (err) {
      console.error('Error toggling document visibility:', err);
      setError('Failed to change document visibility. Please try again.');
    } finally {
      setLoading(false);
      handleCloseMenu();
    }
  };
  
  // Handle document action menu item click
  const handleMenuAction = (action: 'edit' | 'delete' | 'toggleVisibility') => {
    const document = documents.find(d => d.document_id === menuDocumentId);
    if (!document) return;
    
    handleCloseMenu();
    
    switch (action) {
      case 'edit':
        handleOpenEditDialog(document);
        break;
      case 'delete':
        handleOpenDeleteDialog(document);
        break;
      case 'toggleVisibility':
        handleToggleVisibility(document.document_id!, document.is_public);
        break;
    }
  };
  
  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };
  
  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Format file size
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    
    if (bytes < 1024) return bytes + ' B';
    const kb = bytes / 1024;
    if (kb < 1024) return kb.toFixed(1) + ' KB';
    const mb = kb / 1024;
    if (mb < 1024) return mb.toFixed(1) + ' MB';
    const gb = mb / 1024;
    return gb.toFixed(1) + ' GB';
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    
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
  
  // Get file icon based on file type
  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <AttachFile />;
    
    if (fileType.includes('pdf')) {
      return <PictureAsPdf color="error" />;
    } else if (fileType.startsWith('image/')) {
      return <Image color="primary" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <Description color="info" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel')) {
      return <Description color="success" />;
    } else if (fileType.includes('presentation') || fileType.includes('powerpoint')) {
      return <Description color="warning" />;
    }
    
    return <AttachFile />;
  };
  
  // Sort and filter documents
  const getSortedAndFilteredDocuments = () => {
    let filtered = [...documents];
    
    // Apply client-side sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'upload_date':
          comparison = (a.upload_date || '') > (b.upload_date || '') ? 1 : -1;
          break;
        case 'file_size':
          comparison = (a.file_size || 0) - (b.file_size || 0);
          break;
        case 'category':
          comparison = a.category.localeCompare(b.category);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return filtered;
  };
  
  // Get documents for current page
  const paginatedDocuments = getSortedAndFilteredDocuments().slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );
  
  // Render loading state
  if (loading && documents.length === 0) {
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
          Document Management
        </Typography>
        
        <Button
          variant="contained"
          color="primary"
          startIcon={<Add />}
          onClick={handleOpenUploadDialog}
        >
          Upload Document
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
      
      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              placeholder="Search documents..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              size="small"
            />
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="category-filter-label">Category</InputLabel>
              <Select
                labelId="category-filter-label"
                value={filterCategory}
                onChange={handleCategoryFilterChange}
                label="Category"
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category} value={category}>{category}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="visibility-filter-label">Visibility</InputLabel>
              <Select
                labelId="visibility-filter-label"
                value={filterVisibility}
                onChange={handleVisibilityFilterChange}
                label="Visibility"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="true">Public</MenuItem>
                <MenuItem value="false">Private</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={2}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Sort />}
              onClick={handleOpenSortMenu}
            >
              Sort By
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {/* Document Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="documents table">
            <TableHead>
              <TableRow>
                <TableCell width="40px"></TableCell>
                <TableCell>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSortChange('name')}
                  >
                    Name
                    {sortField === 'name' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSortChange('category')}
                  >
                    Category
                    {sortField === 'category' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSortChange('upload_date')}
                  >
                    Upload Date
                    {sortField === 'upload_date' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>
                  <Box 
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleSortChange('file_size')}
                  >
                    Size
                    {sortField === 'file_size' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpward fontSize="small" sx={{ ml: 0.5 }} /> : 
                        <ArrowDownward fontSize="small" sx={{ ml: 0.5 }} />
                    )}
                  </Box>
                </TableCell>
                <TableCell>Visibility</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedDocuments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                    <Typography variant="body1" color="text.secondary">
                      No documents found.
                    </Typography>
                    <Button
                      variant="text"
                      color="primary"
                      startIcon={<Add />}
                      onClick={handleOpenUploadDialog}
                      sx={{ mt: 1 }}
                    >
                      Upload your first document
                    </Button>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedDocuments.map((document) => (
                  <TableRow key={document.document_id} hover>
                    <TableCell>
                      {getFileIcon(document.file_type)}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {document.name}
                      </Typography>
                      {document.description && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                          {document.description}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={document.category} 
                        size="small" 
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      {formatDate(document.upload_date)}
                    </TableCell>
                    <TableCell>
                      {formatFileSize(document.file_size)}
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={document.is_public ? <LockOpen fontSize="small" /> : <Lock fontSize="small" />}
                        label={document.is_public ? 'Public' : 'Private'}
                        color={document.is_public ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <Tooltip title="View Document">
                          <IconButton 
                            size="small"
                            onClick={() => document.file_path && window.open(document.file_path, '_blank')}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton 
                            size="small"
                            onClick={() => document.file_path && window.open(document.file_path, '_blank')}
                          >
                            <Download />
                          </IconButton>
                        </Tooltip>
                        <IconButton 
                          size="small"
                          onClick={(e) => document.document_id && handleOpenMenu(e, document.document_id)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={documents.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
      
      {/* Upload Document Dialog */}
      <Dialog
        open={uploadDialogOpen}
        onClose={() => setUploadDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Upload Document
          <IconButton
            aria-label="close"
            onClick={() => setUploadDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              border: `2px dashed ${theme.palette.divider}`,
              borderRadius: 1,
              p: 3,
              textAlign: 'center',
              mb: 3,
              bgcolor: 'rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'rgba(0, 0, 0, 0.05)',
              },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            onClick={() => document.getElementById('document-file')?.click()}
          >
            <input
              type="file"
              id="document-file"
              hidden
              onChange={handleFileSelect}
            />
            <CloudUpload fontSize="large" color="primary" sx={{ mb: 2 }} />
            <Typography variant="body1" gutterBottom>
              Select a file
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Drag files here or click to browse
            </Typography>
          </Box>
          
          {documentFile && (
            <Box sx={{ mb: 3, p: 2, border: `1px solid ${theme.palette.divider}`, borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Selected File:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {getFileIcon(documentFile.type)}
                <Box sx={{ ml: 2 }}>
                  <Typography variant="body1">
                    {documentFile.name}
                    <Typography variant="body2" color="text.secondary">
                    {formatFileSize(documentFile.size)}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                required
                error={!documentName.trim()}
                helperText={!documentName.trim() ? 'Name is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                multiline
                rows={3}
                placeholder="Optional description of the document"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!documentCategory}>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={documentCategory}
                  onChange={(e) => setDocumentCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="" disabled>Select a category</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
                {!documentCategory && <FormHelperText>Category is required</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="visibility-label">Visibility</InputLabel>
                <Select
                  labelId="visibility-label"
                  value={documentIsPublic ? 'public' : 'private'}
                  onChange={(e) => setDocumentIsPublic(e.target.value === 'public')}
                  label="Visibility"
                >
                  <MenuItem value="public">Public (Visible to investors)</MenuItem>
                  <MenuItem value="private">Private (Only visible to team)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUploadDocument} 
            variant="contained" 
            color="primary"
            disabled={loading || !documentFile || !documentName.trim() || !documentCategory}
          >
            {loading ? <CircularProgress size={24} /> : 'Upload Document'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Edit Document Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Edit Document
          <IconButton
            aria-label="close"
            onClick={() => setEditDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Document Name"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
                required
                error={!documentName.trim()}
                helperText={!documentName.trim() ? 'Name is required' : ''}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)}
                multiline
                rows={3}
                placeholder="Optional description of the document"
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth required error={!documentCategory}>
                <InputLabel id="edit-category-label">Category</InputLabel>
                <Select
                  labelId="edit-category-label"
                  value={documentCategory}
                  onChange={(e) => setDocumentCategory(e.target.value)}
                  label="Category"
                >
                  <MenuItem value="" disabled>Select a category</MenuItem>
                  {categories.map((category) => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
                {!documentCategory && <FormHelperText>Category is required</FormHelperText>}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel id="edit-visibility-label">Visibility</InputLabel>
                <Select
                  labelId="edit-visibility-label"
                  value={documentIsPublic ? 'public' : 'private'}
                  onChange={(e) => setDocumentIsPublic(e.target.value === 'public')}
                  label="Visibility"
                >
                  <MenuItem value="public">Public (Visible to investors)</MenuItem>
                  <MenuItem value="private">Private (Only visible to team)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateDocument} 
            variant="contained" 
            color="primary"
            disabled={loading || !documentName.trim() || !documentCategory}
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
            Are you sure you want to delete the document "{currentDocument?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleDeleteDocument} 
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Document Action Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleMenuAction('edit')}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit Document</ListItemText>
        </MenuItem>
        
        {menuDocumentId && (
          <MenuItem onClick={() => handleMenuAction('toggleVisibility')}>
            <ListItemIcon>
              {documents.find(d => d.document_id === menuDocumentId)?.is_public ? (
                <Lock fontSize="small" />
              ) : (
                <LockOpen fontSize="small" />
              )}
            </ListItemIcon>
            <ListItemText>
              {documents.find(d => d.document_id === menuDocumentId)?.is_public ? 
                'Make Private' : 
                'Make Public'
              }
            </ListItemText>
          </MenuItem>
        )}
        
        <MenuItem onClick={() => handleMenuAction('delete')}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Delete Document</ListItemText>
        </MenuItem>
      </Menu>
      
      {/* Sort Menu */}
      <Menu
        anchorEl={sortMenuAnchorEl}
        open={Boolean(sortMenuAnchorEl)}
        onClose={handleCloseSortMenu}
      >
        <MenuItem onClick={() => handleSortChange('name')}>
          <ListItemIcon>
            {sortField === 'name' && (
              sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>Name</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleSortChange('category')}>
          <ListItemIcon>
            {sortField === 'category' && (
              sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>Category</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleSortChange('upload_date')}>
          <ListItemIcon>
            {sortField === 'upload_date' && (
              sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>Upload Date</ListItemText>
        </MenuItem>
        
        <MenuItem onClick={() => handleSortChange('file_size')}>
          <ListItemIcon>
            {sortField === 'file_size' && (
              sortDirection === 'asc' ? <ArrowUpward fontSize="small" /> : <ArrowDownward fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>File Size</ListItemText>
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default DocumentManagement;