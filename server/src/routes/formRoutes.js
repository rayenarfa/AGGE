import express from 'express';
import {
  getFormDefinition,
  submitForm,
  submitContactMessage,
  getSubmissions,
  updateSubmissionStatus,
  getContactMessages,
  updateContactMessageStatus,
} from '../controllers/formController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/definitions/:key', getFormDefinition);
router.post('/submit/:key', submitForm);
router.post('/contact', submitContactMessage);

// Admin-only routes
router.get('/admin/submissions', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), getSubmissions);
router.patch('/admin/submissions/:id/status', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), updateSubmissionStatus);
router.get('/admin/messages', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), getContactMessages);
router.patch('/admin/messages/:id/status', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN']), updateContactMessageStatus);

export default router;
