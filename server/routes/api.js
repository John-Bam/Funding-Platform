// server/routes/api.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Import controllers
const userController = require('../controllers/userController');
const projectController = require('../controllers/projectController');
const investorController = require('../controllers/investorController');
const walletController = require('../controllers/walletController');
const messageController = require('../controllers/messageController');
const notificationController = require('../controllers/notificationController');
const authController = require('../controllers/authController');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueId = uuidv4();
    cb(null, uniqueId + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// Auth routes
router.post('/auth/login', authController.login);
router.post('/auth/register', authController.register);
router.get('/auth/me', auth, authController.getCurrentUser);

// User routes
router.get('/users/profile', auth, userController.getUserProfile);
router.put('/users/profile', auth, userController.updateUserProfile);
router.post('/users/change-password', auth, userController.changePassword);
router.get('/users/stats', auth, userController.getUserStats);

// Project routes
router.get('/projects', auth, projectController.getProjects);
router.get('/projects/:id', auth, projectController.getProjectById);
router.post('/projects', auth, projectController.createProject);
router.get('/projects/:id/milestones', auth, projectController.getProjectMilestones);

// Investor routes
router.get('/investors/profile', auth, investorController.getInvestorProfile);
router.get('/investors/investments', auth, investorController.getInvestments);
router.post('/investors/invest', auth, investorController.investInProject);

// Wallet routes
router.get('/wallet/balance', auth, walletController.getWalletBalance);
router.get('/wallet/transactions', auth, walletController.getTransactions);
router.post('/wallet/deposit', auth, walletController.createDeposit);
router.post('/wallet/transactions/:id/proof', auth, upload.single('file'), walletController.uploadProofOfPayment);

// Message routes
router.get('/messages', auth, messageController.getMessages);
router.post('/messages', auth, messageController.sendMessage);
router.put('/messages/:id/read', auth, messageController.markAsRead);

// Notification routes
router.get('/notifications', auth, notificationController.getNotifications);
router.put('/notifications/:id/read', auth, notificationController.markAsRead);

module.exports = router;