interface StateTransition {
    entityId: string;
    entityType: 'user' | 'project' | 'milestone' | 'escrow';
    fromState: string;
    toState: string;
    reason?: string;
  }
  
  /**
   * Records a state transition in the system
   */
  export const recordStateTransition = async (
    entityId: string,
    entityType: 'user' | 'project' | 'milestone' | 'escrow',
    fromState: string,
    toState: string,
    reason?: string
  ): Promise<boolean> => {
    try {
      // For now, just log to console in a development environment
      console.log(`State transition: ${entityType} ${entityId} moved from ${fromState} to ${toState}`);
      
      // In a production environment, call the API
      if (process.env.NODE_ENV === 'production') {
        const response = await fetch('/api/admin/state-transitions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entityId,
            entityType,
            fromState,
            toState,
            reason
          }),
        });
        
        return response.ok;
      }
      
      return true;
    } catch (error) {
      console.error('Error recording state transition:', error);
      return false;
    }
  };
  
  /**
   * Fetches transition history for an entity
   */
  export const getTransitionHistory = async (
    entityId: string,
    entityType: 'user' | 'project' | 'milestone' | 'escrow'
  ): Promise<StateTransition[]> => {
    try {
      // In a production environment, call the API
      if (process.env.NODE_ENV === 'production') {
        const response = await fetch(
          `/api/admin/state-transitions?entityId=${entityId}&entityType=${entityType}`
        );
        
        if (response.ok) {
          return await response.json();
        }
      }
      
      // Mock data for development
      return [
        {
          entityId,
          entityType,
          fromState: 'PendingApproval',
          toState: 'Verified',
          reason: undefined
        },
        {
          entityId,
          entityType,
          fromState: 'Verified',
          toState: 'Active',
          reason: undefined
        }
      ];
    } catch (error) {
      console.error('Error fetching transition history:', error);
      return [];
    }
  };
  
  export default {
    recordStateTransition,
    getTransitionHistory
  };