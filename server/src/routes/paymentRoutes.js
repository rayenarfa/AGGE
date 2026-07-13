import express from 'express';
import {
  getMembershipPlans,
  createCheckoutSession,
  simulatedWebhook,
  getAdminPayments,
  updateMembershipPlan,
  getPaymentSession,
} from '../controllers/paymentController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/plans', getMembershipPlans);
router.post('/webhook', simulatedWebhook);
router.get('/session/:id', getPaymentSession);

// User Protected routes
router.post('/checkout-session', authenticateToken, createCheckoutSession);

// Admin-only routes
router.get('/admin/payments', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), getAdminPayments);
router.patch('/admin/plans/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), updateMembershipPlan);

export default router;
