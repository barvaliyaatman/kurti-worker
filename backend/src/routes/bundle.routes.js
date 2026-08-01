import { Router } from 'express';
import { getBundles } from '../controllers/bundle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

// Apply JWT authentication middleware to all bundle routes
router.use(authenticate);

/**
 * @route GET /api/bundles
 * @desc Get list of generated production bundles
 * @access Owner, Manager, Cutting Master
 */
router.get(
  '/',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  getBundles
);

export default router;
