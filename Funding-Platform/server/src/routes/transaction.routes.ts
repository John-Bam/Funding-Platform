// src/routes/transaction.routes.ts
import express from 'express';
import { body, param } from 'express-validator';
import TransactionController from '../controllers/transaction.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get user's transactions
router.get(
  '/',
  authenticate,
  TransactionController.getUserTransactions
);

// Create deposit
router.post(
  '/deposit',
  authenticate,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('payment_method').isString().withMessage('Payment method is required'),
  validateRequest,
  TransactionController.createDeposit
);

// Create withdrawal
router.post(
  '/withdraw',
  authenticate,
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('payment_method').isString().withMessage('Payment method is required'),
  validateRequest,
  TransactionController.createWithdrawal
);

// Verify transaction (Admin only)
router.put(
  '/:transactionId/verify',
  authenticate,
  authorize(['Admin', 'EscrowManager']),
  param('transactionId').isUUID().withMessage('Invalid transaction ID'),
  body('approved').isBoolean().withMessage('Approved must be a boolean value'),
  validateRequest,
  TransactionController.verifyTransaction
);

export default router;