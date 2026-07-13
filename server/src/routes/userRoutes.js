import express from 'express';
import { updateProfile, updatePassword, getDashboardData } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes here require token authentication
router.use(authenticateToken);

router.put('/profile', updateProfile);
router.put('/profile/password', updatePassword);
router.get('/dashboard', getDashboardData);

export default router;
