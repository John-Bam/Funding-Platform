// index.ts (updated)
// Export all services for easy imports
export { default as MilestoneService } from './MilestoneService';
export { default as ProjectService } from './ProjectService';
export { default as DocumentService } from './DocumentService';
export { default as DashboardService } from './DashboardService';
export { default as AdminService } from './AdminService';
export { default as EscrowService } from './EscrowService';
export { default as UserService } from './UserService';
export { default as InvestmentService } from './InvestmentService';
export { default as MessageService } from './MessageService';
export { default as NotificationService } from './NotificationService';

// Export types for reuse
export type { MilestoneData } from './MilestoneService';
export type { ProjectData } from './ProjectService';
export type { DocumentData } from './DocumentService';