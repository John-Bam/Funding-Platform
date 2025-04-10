// src/routes/notification.routes.ts
import express from 'express';
import { body, param, query } from 'express-validator';
import NotificationController from '../controllers/notification.controller';
import { validateRequest } from '../middleware/validate-request';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Get user's notifications
router.get(
  '/',
  authenticate,
  query('limit').optional().isInt({ min: 1 }).withMessage('Limit must be a positive integer'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be a non-negative integer'),
  query('unreadOnly').optional().isBoolean().withMessage('unreadOnly must be a boolean'),
  validateRequest,
  NotificationController.getUserNotifications
);

// Get unread notification count
router.get(
  '/unread-count',
  authenticate,
  NotificationController.getUnreadCount
);

// Mark notification as read
router.put(
  '/:notificationId/read',
  authenticate,
  param('notificationId').isUUID().withMessage('Invalid notification ID'),
  validateRequest,
  NotificationController.markAsRead
);

// Mark all notifications as read
router.put(
  '/mark-all-read',
  authenticate,
  NotificationController.markAllAsRead
);

// Create a notification (admin only)
router.post(
  '/',
  authenticate,
  authorize(['Admin']),
  body('title').isString().notEmpty().withMessage('Title is required'),
  body('message').isString().notEmpty().withMessage('Message is required'),
  body('userId').optional().isUUID().withMessage('Invalid user ID'),
  body('targetRole').optional().isIn(['Admin', 'Investor', 'Innovator', 'EscrowManager']).withMessage('Invalid role'),
  validateRequest,
  NotificationController.createNotification
);

// Delete a notification
router.delete(
  '/:notificationId',
  authenticate,
  param('notificationId').isUUID().withMessage('Invalid notification ID'),
  validateRequest,
  NotificationController.deleteNotification
);

export default router;