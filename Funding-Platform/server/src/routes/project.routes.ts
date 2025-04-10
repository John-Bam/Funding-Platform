// src/routes/project.routes.ts
import express from 'express';
import { body, param, query } from 'express-validator';
import ProjectController from '../controllers/project.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get all projects
router.get(
  '/',
  query('category').optional().isString(),
  query('status').optional().isString(),
  query('innovator_id').optional().isUUID(),
  validateRequest,
  ProjectController.getAllProjects
);

// Get project by ID
router.get(
  '/:projectId',
  param('projectId').isUUID().withMessage('Invalid project ID'),
  validateRequest,
  ProjectController.getProjectById
);

// Create a new project
router.post(
  '/',
  authenticate,
  authorize(['Innovator']),
  body('title').isString().isLength({ min: 5, max: 255 }).withMessage('Title must be between 5 and 255 characters'),
  body('short_description').isString().isLength({ min: 10, max: 500 }).withMessage('Short description must be between 10 and 500 characters'),
  body('category').isString().notEmpty().withMessage('Category is required'),
  body('funding_goal').isNumeric().withMessage('Funding goal must be a number'),
  validateRequest,
  ProjectController.createProject
);

// Update a project
router.put(
  '/:projectId',
  authenticate,
  authorize(['Innovator']),
  param('projectId').isUUID().withMessage('Invalid project ID'),
  body('title').optional().isString().isLength({ min: 5, max: 255 }),
  body('short_description').optional().isString().isLength({ min: 10, max: 500 }),
  body('category').optional().isString(),
  body('funding_goal').optional().isNumeric(),
  validateRequest,
  ProjectController.updateProject
);

// Submit project for approval
router.put(
  '/:projectId/submit',
  authenticate,
  authorize(['Innovator']),
  param('projectId').isUUID().withMessage('Invalid project ID'),
  validateRequest,
  ProjectController.submitProject
);

// Delete a project
router.delete(
  '/:projectId',
  authenticate,
  authorize(['Innovator']),
  param('projectId').isUUID().withMessage('Invalid project ID'),
  validateRequest,
  ProjectController.deleteProject
);

export default router;