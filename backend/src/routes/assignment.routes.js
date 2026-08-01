import { Router } from 'express';
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  updateProgress,
  completeAssignment,
  cancelAssignment,
} from '../controllers/assignment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createAssignmentSchema,
  updateAssignmentSchema,
  updateAssignmentProgressSchema,
} from '../validators/assignment.validator.js';

const router = Router();

// Apply JWT authentication middleware
router.use(authenticate);

/**
 * @route GET /api/assignments
 * @desc Get list of work assignments
 * @access Owner, Manager, Cutting Master
 */
router.get(
  '/',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  getAssignments
);

/**
 * @route GET /api/assignments/:id
 * @desc Get assignment details with history log
 * @access Owner, Manager, Cutting Master
 */
router.get(
  '/:id',
  authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'),
  getAssignmentById
);

/**
 * @route POST /api/assignments
 * @desc Create new work assignment from bundle
 * @access Owner, Manager
 */
router.post(
  '/',
  authorizeRoles('OWNER', 'MANAGER'),
  validate(createAssignmentSchema),
  createAssignment
);

/**
 * @route PUT /api/assignments/:id
 * @desc Edit assigned sets for an assignment
 * @access Owner, Manager
 */
router.put(
  '/:id',
  authorizeRoles('OWNER', 'MANAGER'),
  validate(updateAssignmentSchema),
  updateAssignment
);

/**
 * @route PATCH /api/assignments/:id/progress
 * @desc Update completed quantity for an assignment
 * @access Owner, Manager
 */
router.patch(
  '/:id/progress',
  authorizeRoles('OWNER', 'MANAGER'),
  validate(updateAssignmentProgressSchema),
  updateProgress
);

/**
 * @route PATCH /api/assignments/:id/complete
 * @desc Mark assignment as COMPLETED
 * @access Owner, Manager
 */
router.patch(
  '/:id/complete',
  authorizeRoles('OWNER', 'MANAGER'),
  completeAssignment
);

/**
 * @route DELETE /api/assignments/:id
 * @desc Cancel assignment and restore bundle remaining sets
 * @access Owner, Manager
 */
router.delete(
  '/:id',
  authorizeRoles('OWNER', 'MANAGER'),
  cancelAssignment
);

router.patch(
  '/:id/cancel',
  authorizeRoles('OWNER', 'MANAGER'),
  cancelAssignment
);

export default router;
