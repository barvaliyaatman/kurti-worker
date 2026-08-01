import { Router } from 'express';
import {
  getPayrollDashboard,
  getEmployeeSalaryDetails,
  disburseSalaryPayment,
  getSalaryHistory,
  getPayrollReports,
} from '../controllers/salary.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

// Apply JWT authentication middleware to all salary routes
router.use(authenticate);

/**
 * @route GET /api/salary
 * @desc Get factory-wide payroll dashboard summary & employee table
 * @access Owner, Manager
 */
router.get(
  '/',
  authorizeRoles('OWNER', 'MANAGER'),
  getPayrollDashboard
);

/**
 * @route GET /api/salary/history
 * @desc Get monthly salary payment history
 * @access Owner, Manager
 */
router.get(
  '/history',
  authorizeRoles('OWNER', 'MANAGER'),
  getSalaryHistory
);

/**
 * @route GET /api/salary/reports
 * @desc Get exportable payroll summary reports
 * @access Owner, Manager
 */
router.get(
  '/reports',
  authorizeRoles('OWNER', 'MANAGER'),
  getPayrollReports
);

/**
 * @route GET /api/salary/:employeeId
 * @desc Get granular salary workspace details for single employee
 * @access Owner, Manager
 */
router.get(
  '/:employeeId',
  authorizeRoles('OWNER', 'MANAGER'),
  getEmployeeSalaryDetails
);

/**
 * @route POST /api/salary/pay
 * @desc Disburse salary payment (Full or Partial)
 * @access Owner, Manager
 */
router.post(
  '/pay',
  authorizeRoles('OWNER', 'MANAGER'),
  disburseSalaryPayment
);

export default router;
