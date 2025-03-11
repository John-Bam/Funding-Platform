import express from 'express';
import { body } from 'express-validator';
import { validateRequest } from '../middleware/validate-request';
import authController from '../controllers/auth.controller';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long'),
    body('full_name').notEmpty().withMessage('Full name is required'),
    body('role').isIn(['Innovator', 'Investor']).withMessage('Role must be either Innovator or Investor'),
    validateRequest
  ],
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login user and return JWT token
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest
  ],
  authController.login
);

export default router;