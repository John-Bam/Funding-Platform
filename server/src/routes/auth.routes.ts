import express from 'express';
import { body } from 'express-validator';
import AuthController from '../controllers/auth.controller';
import { validateRequest } from '../middleware/validate-request';

const router = express.Router();

/**
 * @route POST /api/auth/register
 * @desc Register a new user
 * @access Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter'),
    body('full_name').trim().notEmpty().withMessage('Full name is required'),
    body('phone_number').optional().isMobilePhone('any').withMessage('Please enter a valid phone number'),
    body('date_of_birth').isDate().withMessage('Please enter a valid date of birth'),
    body('role')
      .isIn(['Innovator', 'Investor'])
      .withMessage('Role must be either Innovator or Investor'),
    validateRequest,
  ],
  AuthController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login a user
 * @access Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  AuthController.login
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Request password reset
 * @access Public
 */
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please enter a valid email'),
    validateRequest,
  ],
  AuthController.forgotPassword
);

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long')
      .matches(/\d/)
      .withMessage('Password must contain a number')
      .matches(/[A-Z]/)
      .withMessage('Password must contain an uppercase letter'),
    validateRequest,
  ],
  AuthController.resetPassword
);

export default router;