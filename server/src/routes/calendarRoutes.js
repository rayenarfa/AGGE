import express from 'express';
import { getCalendarItems } from '../controllers/calendarController.js';

const router = express.Router();

// Public calendar queries
router.get('/', getCalendarItems);

export default router;
