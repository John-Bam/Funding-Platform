import express from 'express';
const router = express.Router();

// Placeholder route
router.get('/', (req, res) => {
  res.status(200).json({ message: 'Milestone routes are working' });
});

export default router;