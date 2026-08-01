import { Router } from 'express';
import {
  getEmployeeWorkspace,
  getCurrentWork,
  getCompletedWork,
  getEmployeeSalary,
  getEmployeeAdvances,
  createEmployeeAdvance,
  getEmployeePayments,
  createEmployeePayment,
  getEmployeeTimeline,
} from '../controllers/employeeWorkspace.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router({ mergeParams: true });

// Apply JWT authentication middleware
router.use(authenticate);

/**
 * @route GET /api/employees/:id/workspace
 * @desc Get consolidated 360-degree employee workspace overview
 * @access Owner, Manager
 */
router.get(
  '/workspace',
  authorizeRoles('OWNER', 'MANAGER'),
  getEmployeeWorkspace
);

/**
 * @route GET /api/employees/:id/current-work
 * @desc Get employee active current work assignments
 * @access Owner, Manager
 */
router.get(
  '/current-work',
  authorizeRoles('OWNER', 'MANAGER'),
  getCurrentWork
);

/**
 * @route GET /api/employees/:id/completed-work
 * @desc Get employee completed work records
 * @access Owner, Manager
 */
router.get(
  '/completed-work',
  authorizeRoles('OWNER', 'MANAGER'),
  getCompletedWork
);

/**
 * @route GET /api/employees/:id/salary
 * @desc Get employee salary summary and calculation breakdown
 * @access Owner, Manager
 */
router.get(
  '/salary',
  authorizeRoles('OWNER', 'MANAGER'),
  getEmployeeSalary
);

/**
 * @route GET /api/employees/:id/advances
 * @desc Get employee advance loans list
 * @access Owner, Manager
 */
router.get(
  '/advances',
  authorizeRoles('OWNER', 'MANAGER'),
  getEmployeeAdvances
);

/**
 * @route POST /api/employees/:id/advances
 * @desc Issue salary advance loan to employee
 * @access Owner, Manager
 */
router.post(
  '/advances',
  authorizeRoles('OWNER', 'MANAGER'),
  createEmployeeAdvance
);

/**
 * @route GET /api/employees/:id/payments
 * @desc Get employee salary payment history
 * @access Owner, Manager
 */
router.get(
  '/payments',
  authorizeRoles('OWNER', 'MANAGER'),
  getEmployeePayments
);

/**
 * @route POST /api/employees/:id/payments
 * @desc Disburse salary payment to employee
 * @access Owner, Manager
 */
router.post(
  '/payments',
  authorizeRoles('OWNER', 'MANAGER'),
  createEmployeePayment
);

/**
 * @route GET /api/employees/:id/timeline
 * @desc Get employee activity timeline log
 * @access Owner, Manager
 */
router.get(
  '/timeline',
  authorizeRoles('OWNER', 'MANAGER'),
  getEmployeeTimeline
);

export default router;
