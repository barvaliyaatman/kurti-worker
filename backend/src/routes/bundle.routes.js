import { Router } from 'express';
import { getBundles } from '../controllers/bundle.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { requireWorkflowStage } from '../middleware/workflow.middleware.js';

const router = Router();

// Apply JWT authentication middleware & company workflow protection to all bundle routes
router.use(authenticate);
router.use(requireWorkflowStage('bundle'));

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
