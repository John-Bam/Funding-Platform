import express from 'express';
import { body, param } from 'express-validator';
import UserController from '../controllers/user.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

/**
 * @route GET /api/users/me
 * @desc Get current user profile
 * @access Private
 */
router.get(
  '/me',
  authenticate,
  UserController.getCurrentUser
);

/**
 * @route GET /api/users
 * @desc Get all users (Admin only)
 * @access Private/Admin
 */
router.get(
  '/',
  authenticate,
  authorize(['Admin', 'EscrowManager']),
  UserController.getAllUsers
);

/**
 * @route GET /api/users/pending
 * @desc Get all pending approval users (Admin only)
 * @access Private/Admin
 */
router.get(
  '/pending',
  authenticate,
  authorize(['Admin']),
  UserController.getPendingUsers
);

/**
 * @route GET /api/users/:userId
 * @desc Get user by ID
 * @access Private/Admin
 */
router.get(
  '/:userId',
  authenticate,
  authorize(['Admin', 'EscrowManager']),
  param('userId').isUUID().withMessage('Invalid user ID'),
  validateRequest,
  UserController.getUserById
);

/**
 * @route PUT /api/users/:userId/verify
 * @desc Verify a user (Admin only)
 * @access Private/Admin
 */
router.put(
  '/:userId/verify',
  authenticate,
  authorize(['Admin']),
  param('userId').isUUID().withMessage('Invalid user ID'),
  validateRequest,
  UserController.verifyUser
);

/**
 * @route PUT /api/users/:userId/reject
 * @desc Reject a user (Admin only)
 * @access Private/Admin
 */
router.put(
  '/:userId/reject',
  authenticate,
  authorize(['Admin']),
  param('userId').isUUID().withMessage('Invalid user ID'),
  body('reason').optional().isString().trim(),
  validateRequest,
  UserController.rejectUser
);

/**
 * @route PUT /api/users/:userId/suspend
 * @desc Suspend a user (Admin only)
 * @access Private/Admin
 */
router.put(
  '/:userId/suspend',
  authenticate,
  authorize(['Admin']),
  param('userId').isUUID().withMessage('Invalid user ID'),
  body('reason').isString().trim().notEmpty().withMessage('Reason is required'),
  validateRequest,
  UserController.suspendUser
);

/**
 * @route PUT /api/users/profile
 * @desc Update current user profile
 * @access Private
 */
router.put(
  '/profile',
  authenticate,
  body('full_name').optional().trim().notEmpty().withMessage('Full name cannot be empty'),
  body('phone_number').optional().isMobilePhone('any').withMessage('Please enter a valid phone number'),
  body('address').optional().trim(),
  validateRequest,
  UserController.updateProfile
);

/**
 * @route PUT /api/users/password
 * @desc Change password
 * @access Private
 */
router.put(
  '/password',
  authenticate,
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/\d/)
    .withMessage('Password must contain a number')
    .matches(/[A-Z]/)
    .withMessage('Password must contain an uppercase letter'),
  validateRequest,
  UserController.changePassword
);

export default router;