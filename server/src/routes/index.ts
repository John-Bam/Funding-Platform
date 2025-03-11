import express from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import projectRoutes from './project.routes';
import { authenticate } from '../middleware/auth';

const router = express.Router();

// Public routes
router.use('/auth', authRoutes);

// Protected routes (require authentication)
router.use('/users', authenticate, userRoutes);
router.use('/projects', authenticate, projectRoutes);

export default router;