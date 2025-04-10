// src/routes/milestone.routes.ts
import express from 'express';
import { body, param } from 'express-validator';
import MilestoneController from '../controllers/milestone.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get all milestones for a project
router.get(
  '/project/:projectId',
  param('projectId').isUUID().withMessage('Invalid project ID'),
  validateRequest,
  MilestoneController.getProjectMilestones
);

// Get milestone by ID
router.get(
  '/:milestoneId',
  param('milestoneId').isUUID().withMessage('Invalid milestone ID'),
  validateRequest,
  MilestoneController.getMilestoneById
);

// Create a new milestone
router.post(
  '/project/:projectId',
  authenticate,
  authorize(['Innovator']),
  param('projectId').isUUID().withMessage('Invalid project ID'),
  body('title').isString().isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),
  body('description').isString().notEmpty().withMessage('Description is required'),
  body('funding_required').isNumeric().withMessage('Funding required must be a number'),
  validateRequest,
  MilestoneController.createMilestone
);

// Update a milestone
router.put(
  '/:milestoneId',
  authenticate,
  authorize(['Innovator']),
  param('milestoneId').isUUID().withMessage('Invalid milestone ID'),
  validateRequest,
  MilestoneController.updateMilestone
);

// Delete a milestone
router.delete(
  '/:milestoneId',
  authenticate,
  authorize(['Innovator']),
  param('milestoneId').isUUID().withMessage('Invalid milestone ID'),
  validateRequest,
  MilestoneController.deleteMilestone
);

// Mark milestone as completed
router.put(
  '/:milestoneId/complete',
  authenticate,
  authorize(['Innovator']),
  param('milestoneId').isUUID().withMessage('Invalid milestone ID'),
  validateRequest,
  MilestoneController.completeMilestone
);

// Submit milestone verification
router.post(
  '/:milestoneId/verification',
  authenticate,
  authorize(['Innovator']),
  param('milestoneId').isUUID().withMessage('Invalid milestone ID'),
  validateRequest,
  MilestoneController.submitVerification
);

export default router;