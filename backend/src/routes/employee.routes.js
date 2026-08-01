import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  toggleEmployeeStatus,
  deleteEmployee,
} from '../controllers/employee.controller.js';
import employeeWorkspaceRoutes from './employeeWorkspace.routes.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { validate } from '../middleware/validate.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  updateEmployeeStatusSchema,
} from '../validators/employee.validator.js';

const router = Router();

// Apply JWT authentication middleware to all employee routes
router.use(authenticate);

// Mount nested workspace routes: /api/employees/:id/workspace, /api/employees/:id/salary...
router.use('/:id', employeeWorkspaceRoutes);

/**
 * @route GET /api/employees
 * @desc Get search/filtered list of employees
 * @access Owner, Manager
 */
router.get('/', authorizeRoles('OWNER', 'MANAGER'), getEmployees);

/**
 * @route GET /api/employees/:id
 * @desc Get single employee profile
 * @access Owner, Manager
 */
router.get('/:id', authorizeRoles('OWNER', 'MANAGER'), getEmployeeById);

/**
 * @route POST /api/employees
 * @desc Create new worker
 * @access Owner only
 */
router.post(
  '/',
  authorizeRoles('OWNER'),
  validate(createEmployeeSchema),
  createEmployee
);

/**
 * @route PUT /api/employees/:id
 * @desc Update worker details
 * @access Owner only
 */
router.put(
  '/:id',
  authorizeRoles('OWNER'),
  validate(updateEmployeeSchema),
  updateEmployee
);

/**
 * @route PATCH /api/employees/:id/status
 * @desc Toggle employee active/inactive status
 * @access Owner, Manager
 */
router.patch(
  '/:id/status',
  authorizeRoles('OWNER', 'MANAGER'),
  validate(updateEmployeeStatusSchema),
  toggleEmployeeStatus
);

/**
 * @route DELETE /api/employees/:id
 * @desc Soft delete / Archive employee (Allowed only if 0 assignments)
 * @access Owner, Manager
 */
router.delete(
  '/:id',
  authorizeRoles('OWNER', 'MANAGER'),
  deleteEmployee
);

export default router;
