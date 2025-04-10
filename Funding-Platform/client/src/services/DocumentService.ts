import axios from 'axios';

// Base API URL with fallback - matches the pattern in AuthContext.tsx
const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5050';

/**
 * Interface for document data
 */
export interface DocumentData {
  document_id?: string;
  name: string;
  description?: string;
  category: string;
  is_public: boolean;
  file_path?: string;
  file_size?: number;
  file_type?: string;
  upload_date?: string;
}

/**
 * Get all project documents
 */
export const getProjectDocuments = async (projectId: string, filters?: any) => {
  try {
    const response = await axios.get(`${apiUrl}/api/projects/${projectId}/documents`, {
      params: filters
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching project documents:', error);
    throw error;
  }
};

/**
 * Upload a document to a project
 */
export const uploadDocument = async (
  projectId: string,
  documentData: {
    name: string;
    description?: string;
    category: string;
    is_public: boolean;
  },
  file: File
) => {
  try {
    const formData = new FormData();
    formData.append('name', documentData.name);
    
    if (documentData.description) {
      formData.append('description', documentData.description);
    }
    
    formData.append('category', documentData.category);
    formData.append('is_public', String(documentData.is_public));
    formData.append('file', file);
    
    const response = await axios.post(
      `${apiUrl}/api/projects/${projectId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error;
  }
};

/**
 * Update document metadata
 */
export const updateDocument = async (
  projectId: string,
  documentId: string,
  documentData: Partial<DocumentData>
) => {
  try {
    const response = await axios.put(
      `${apiUrl}/api/projects/${projectId}/documents/${documentId}`,
      documentData
    );
    return response.data;
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (projectId: string, documentId: string) => {
  try {
    const response = await axios.delete(
      `${apiUrl}/api/projects/${projectId}/documents/${documentId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
};

/**
 * Toggle document visibility (public/private)
 */
export const toggleDocumentVisibility = async (
  projectId: string,
  documentId: string,
  isPublic: boolean
) => {
  try {
    const response = await axios.patch(
      `${apiUrl}/api/projects/${projectId}/documents/${documentId}/visibility`,
      { is_public: isPublic }
    );
    return response.data;
  } catch (error) {
    console.error('Error toggling document visibility:', error);
    throw error;
  }
};

/**
 * Get document categories
 */
export const getDocumentCategories = async () => {
  try {
    const response = await axios.get(`${apiUrl}/api/document-categories`);
    return response.data;
  } catch (error) {
    console.error('Error fetching document categories:', error);
    throw error;
  }
};

export default {
  getProjectDocuments,
  uploadDocument,
  updateDocument,
  deleteDocument,
  toggleDocumentVisibility,
  getDocumentCategories
};