import { Router } from 'express';
import {
  getJobCards,
  getJobCardById,
  createJobCard,
  updateJobCard,
  sendToCutting,
  deleteJobCard,
} from '../controllers/jobCard.controller.js';
import {
  getJobCardsForAssignment,
  getJobCardBundlesWorkspace,
} from '../controllers/jobCardAssignment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createJobCardSchema,
  updateJobCardSchema,
} from '../validators/jobCard.validator.js';

const router = Router();

// Apply JWT authentication middleware to all job card routes
router.use(authenticate);

/**
 * @route GET /api/job-cards/assignment-queue
 * @desc Get Job Cards ready for worker assignment
 * @access Owner, Manager
 */
router.get(
  '/assignment-queue',
  authorizeRoles('OWNER', 'MANAGER'),
  getJobCardsForAssignment
);

/**
 * @route GET /api/job-cards/:id/assignment-workspace
 * @desc Get Job Card assignment workspace details, bundles & history
 * @access Owner, Manager
 */
router.get(
  '/:id/assignment-workspace',
  authorizeRoles('OWNER', 'MANAGER'),
  getJobCardBundlesWorkspace
);

/**
 * @route GET /api/job-cards
 * @desc Get search/filtered list of job cards
 * @access Owner, Manager, Cutting Master
 */
router.get(
  '/',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  getJobCards
);

/**
 * @route GET /api/job-cards/:id
 * @desc Get single job card profile & breakdown items
 * @access Owner, Manager, Cutting Master
 */
router.get(
  '/:id',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  getJobCardById
);

/**
 * @route POST /api/job-cards
 * @desc Create new production Job Card
 * @access Owner only
 */
router.post(
  '/',
  authorizeRoles('OWNER'),
  validate(createJobCardSchema),
  createJobCard
);

/**
 * @route PUT /api/job-cards/:id
 * @desc Update Job Card
 * @access Owner only
 */
router.put(
  '/:id',
  authorizeRoles('OWNER'),
  validate(updateJobCardSchema),
  updateJobCard
);

/**
 * @route POST /api/job-cards/:id/send-cutting
 * @desc Send Job Card to Cutting queue (status = READY_FOR_CUTTING)
 * @access Owner, Manager
 */
router.post(
  '/:id/send-cutting',
  authorizeRoles('OWNER', 'MANAGER'),
  sendToCutting
);

/**
 * @route POST /api/job-cards/:id/send-to-cutting
 * @desc Send Job Card to Cutting queue (status = READY_FOR_CUTTING)
 * @access Owner, Manager
 */
router.post(
  '/:id/send-to-cutting',
  authorizeRoles('OWNER', 'MANAGER'),
  sendToCutting
);

/**
 * @route PATCH /api/job-cards/:id/status
 * @desc Transition Job Card status (e.g. READY_FOR_CUTTING)
 * @access Owner, Manager
 */
router.patch(
  '/:id/status',
  authorizeRoles('OWNER', 'MANAGER'),
  sendToCutting
);

/**
 * @route DELETE /api/job-cards/:id
 * @desc Soft delete / Archive Job Card (Allowed only if status = CREATED)
 * @access Owner, Manager
 */
router.delete(
  '/:id',
  authorizeRoles('OWNER', 'MANAGER'),
  deleteJobCard
);

export default router;
