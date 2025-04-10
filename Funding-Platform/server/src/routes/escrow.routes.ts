import express from 'express';
import { body, param } from 'express-validator';
import EscrowController from '../controllers/escrow.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

/**
 * @route GET /api/escrow
 * @desc Get all escrow accounts
 * @access Private/Admin/EscrowManager
 */
router.get(
  '/',
  authenticate,
  authorize(['Admin', 'EscrowManager']),
  EscrowController.getAllEscrowAccounts
);

/**
 * @route GET /api/escrow/:escrowId
 * @desc Get escrow account by ID
 * @access Private
 */
router.get(
  '/:escrowId',
  authenticate,
  param('escrowId').isUUID().withMessage('Invalid escrow ID'),
  validateRequest,
  EscrowController.getEscrowById
);

/**
 * @route GET /api/escrow/project/:projectId
 * @desc Get all escrow accounts for a project
 * @access Private
 */
router.get(
  '/project/:projectId',
  authenticate,
  param('projectId').isUUID().withMessage('Invalid project ID'),
  validateRequest,
  EscrowController.getProjectEscrowAccounts
);

/**
 * @route GET /api/escrow/milestone/:milestoneId
 * @desc Get escrow account for a milestone
 * @access Private
 */
router.get(
  '/milestone/:milestoneId',
  authenticate,
  param('milestoneId').isUUID().withMessage('Invalid milestone ID'),
  validateRequest,
  EscrowController.getMilestoneEscrow
);

/**
 * @route POST /api/escrow/milestone/:milestoneId
 * @desc Create an escrow account for a milestone
 * @access Private/Admin/EscrowManager
 */
router.post(
  '/milestone/:milestoneId',
  authenticate,
  authorize(['Admin', 'EscrowManager']),
  param('milestoneId').isUUID().withMessage('Invalid milestone ID'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  validateRequest,
  EscrowController.createEscrowAccount
);

/**
 * @route PUT /api/escrow/:escrowId/release
 * @desc Release funds from escrow
 * @access Private/EscrowManager
 */
router.put(
  '/:escrowId/release',
  authenticate,
  authorize(['EscrowManager']),
  param('escrowId').isUUID().withMessage('Invalid escrow ID'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  validateRequest,
  EscrowController.releaseFunds
);

/**
 * @route PUT /api/escrow/:escrowId/return
 * @desc Return funds from escrow to project funding pool
 * @access Private/EscrowManager
 */
router.put(
  '/:escrowId/return',
  authenticate,
  authorize(['EscrowManager']),
  param('escrowId').isUUID().withMessage('Invalid escrow ID'),
  body('reason').isString().withMessage('Reason for returning funds is required'),
  validateRequest,
  EscrowController.returnFunds
);

/**
 * @route POST /api/escrow/:escrowId/disputes
 * @desc Create a dispute for an escrow account
 * @access Private
 */
router.post(
  '/:escrowId/disputes',
  authenticate,
  param('escrowId').isUUID().withMessage('Invalid escrow ID'),
  body('reason').isString().withMessage('Dispute reason is required'),
  body('description').isString().withMessage('Dispute description is required'),
  validateRequest,
  EscrowController.createDispute
);

/**
 * @route GET /api/escrow/:escrowId/disputes
 * @desc Get all disputes for an escrow account
 * @access Private
 */
router.get(
  '/:escrowId/disputes',
  authenticate,
  param('escrowId').isUUID().withMessage('Invalid escrow ID'),
  validateRequest,
  EscrowController.getEscrowDisputes
);

/**
 * @route PUT /api/escrow/disputes/:disputeId/resolve
 * @desc Resolve a dispute
 * @access Private/EscrowManager
 */
router.put(
  '/disputes/:disputeId/resolve',
  authenticate,
  authorize(['EscrowManager']),
  param('disputeId').isUUID().withMessage('Invalid dispute ID'),
  body('resolution').isString().withMessage('Resolution description is required'),
  body('action').isIn(['release', 'return', 'partial_release']).withMessage('Action must be release, return, or partial_release'),
  body('amount').optional().isNumeric().withMessage('Amount must be a number'),
  validateRequest,
  EscrowController.resolveDispute
);

/**
 * @route GET /api/escrow/reports/summary
 * @desc Get summary report of all escrow accounts
 * @access Private/Admin/EscrowManager
 */
router.get(
  '/reports/summary',
  authenticate,
  authorize(['Admin', 'EscrowManager']),
  EscrowController.getEscrowSummaryReport
);

/**
 * @route GET /api/escrow/reports/project/:projectId
 * @desc Get detailed report of escrow accounts for a project
 * @access Private
 */
router.get(
  '/reports/project/:projectId',
  authenticate,
  param('projectId').isUUID().withMessage('Invalid project ID'),
  validateRequest,
  EscrowController.getProjectEscrowReport
);

export default router;