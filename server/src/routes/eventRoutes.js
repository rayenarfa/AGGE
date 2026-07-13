import express from 'express';
import {
  getEvents,
  getCalendarEvents,
  getEventBySlug,
  registerForEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/calendar', getCalendarEvents);
router.get('/:slug', getEventBySlug);

// Protected routes (authenticated users only)
router.post('/:id/register', authenticateToken, registerForEvent);

// Admin / Event Manager only routes
router.post('/', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER']), createEvent);
router.patch('/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER']), updateEvent);
router.delete('/:id', authenticateToken, requireRole(['ADMIN', 'SUPER_ADMIN', 'EVENT_MANAGER']), deleteEvent);

export default router;
