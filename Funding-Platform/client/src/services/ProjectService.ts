// Add these methods to ProjectService.ts

/**
 * Update an existing project update
 */
export const updateProjectUpdate = async (
    projectId: string,
    updateId: string,
    updateData: { title: string; content: string },
    attachments?: File[]
  ) => {
    try {
      if (attachments && attachments.length > 0) {
        const formData = new FormData();
        formData.append('title', updateData.title);
        formData.append('content', updateData.content);
        
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
        
        const response = await axios.put(
          `${apiUrl}/api/projects/${projectId}/updates/${updateId}`,
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
        
        return response.data;
      } else {
        const response = await axios.put(
          `${apiUrl}/api/projects/${projectId}/updates/${updateId}`,
          updateData
        );
        return response.data;
      }
    } catch (error) {
      console.error(`Error updating project update ${updateId}:`, error);
      throw error;
    }
  };
  
  /**
   * Delete a project update
   */
  export const deleteProjectUpdate = async (projectId: string, updateId: string) => {
    try {
        const response = await axios.delete(
          `${apiUrl}/api/projects/${projectId}/updates/${updateId}`
        );
        return response.data;
      } catch (error) {
        console.error(`Error deleting project update ${updateId}:`, error);
        throw error;
      }
    };
    
    // Also add these to the exported default object
    export default {
      getProjects,
      getProjectById,
      createProject,
      updateProject,
      getProjectUpdates,
      addProjectUpdate,
      updateProjectUpdate,  // Add this
      deleteProjectUpdate   // Add this
    };