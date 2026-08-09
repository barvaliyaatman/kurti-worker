import { Router } from 'express';
import {
  getCuttingQueue,
  getCuttingDetails,
  startCutting,
  updateComponentStatus,
  completeColorAndGenerateBundle,
} from '../controllers/cutting.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { requireWorkflowStage } from '../middleware/workflow.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  startCuttingSchema,
  updateComponentStatusSchema,
  completeColorAndGenerateBundleSchema,
} from '../validators/cutting.validator.js';

const router = Router();

// Apply JWT authentication middleware & company workflow protection to all cutting routes
router.use(authenticate);
router.use(requireWorkflowStage('cutting'));

/**
 * @route GET /api/cutting
 * @desc Get cutting queue job cards
 * @access Owner, Manager, Cutting Master
 */
router.get(
  '/',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  getCuttingQueue
);

/**
 * @route GET /api/cutting/:id
 * @desc Get cutting progress matrix & breakdown
 * @access Owner, Manager, Cutting Master
 */
router.get(
  '/:id',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  getCuttingDetails
);

/**
 * @route POST /api/cutting/start
 * @desc Start cutting for a Job Card (status = CUTTING_IN_PROGRESS)
 * @access Owner, Manager, Cutting Master
 */
router.post(
  '/start',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  validate(startCuttingSchema),
  startCutting
);

/**
 * @route POST /api/cutting/component
 * @desc Update status of a single component (PENDING, IN_PROGRESS, COMPLETED)
 * @access Owner, Manager, Cutting Master
 */
router.post(
  '/component',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  validate(updateComponentStatusSchema),
  updateComponentStatus
);

/**
 * @route POST /api/cutting/complete
 * @desc Complete component cutting & generate Color+Size bundles
 * @access Owner, Manager, Cutting Master
 */
router.post(
  '/complete',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  validate(completeColorAndGenerateBundleSchema),
  completeColorAndGenerateBundle
);

export default router;
