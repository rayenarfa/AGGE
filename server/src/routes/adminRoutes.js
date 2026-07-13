import express from 'express';
import { getStats, getUsers, updateUserRole, getAuditLogs, getAdminEvents } from '../controllers/adminController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication and are restricted to ADMIN / SUPER_ADMIN roles
router.use(authenticateToken);
router.use(requireRole(['ADMIN', 'SUPER_ADMIN']));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/audit-logs', getAuditLogs);
router.get('/events', getAdminEvents);

export default router;
