import { Router } from 'express';
import { getBundles, sendToBundle } from '../controllers/bundle.controller.js';
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

/**
 * @route POST /api/bundles/send-to-bundle
 * @desc Process Job Card into Bundle stage & generate Color+Size bundles
 * @access Owner, Manager, Cutting Master
 */
router.post(
  '/send-to-bundle',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  sendToBundle
);

export default router;
