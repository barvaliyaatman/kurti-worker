import { Router } from 'express';
import { getDashboardData } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route GET /api/dashboard
 * @desc Get factory production dashboard statistics & activities
 * @access Protected
 */
router.get('/', authenticate, getDashboardData);

export default router;
