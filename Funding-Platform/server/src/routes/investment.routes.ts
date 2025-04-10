// src/routes/investment.routes.ts
import express from 'express';
import { body, param } from 'express-validator';
import InvestmentController from '../controllers/investment.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get current user's investments
router.get(
  '/my-investments',
  authenticate,
  authorize(['Investor']),
  InvestmentController.getInvestorInvestments
);

// Get investments for a project
router.get(
  '/project/:projectId',
  authenticate,
  param('projectId').isUUID().withMessage('Invalid project ID'),
  validateRequest,
  InvestmentController.getProjectInvestments
);

// Make a new investment
router.post(
  '/project/:projectId',
  authenticate,
  authorize(['Investor']),
  param('projectId').isUUID().withMessage('Invalid project ID'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  validateRequest,
  InvestmentController.makeInvestment
);

// Simulate investment
router.post(
  '/project/:projectId/simulate',
  authenticate,
  param('projectId').isUUID().withMessage('Invalid project ID'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  validateRequest,
  InvestmentController.simulateInvestment
);

export default router;