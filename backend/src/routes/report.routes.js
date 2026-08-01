import { Router } from 'express';
import {
  getReportsDashboard,
  getProductionReport,
  getEmployeeReport,
  getJobCardReport,
  getBundleReport,
  getSalaryReport,
  getAdvanceReport,
  getPaymentReport,
} from '../controllers/report.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

// Apply JWT authentication middleware to all report routes
router.use(authenticate);

/**
 * @route GET /api/reports/dashboard
 * @desc Get high-level reports summary metrics
 * @access Owner, Manager
 */
router.get(
  '/dashboard',
  authorizeRoles('OWNER', 'MANAGER'),
  getReportsDashboard
);

/**
 * @route GET /api/reports/production
 * @desc Get production analytics report
 * @access Owner, Manager
 */
router.get(
  '/production',
  authorizeRoles('OWNER', 'MANAGER'),
  getProductionReport
);

/**
 * @route GET /api/reports/employees
 * @desc Get employee performance report
 * @access Owner, Manager
 */
router.get(
  '/employees',
  authorizeRoles('OWNER', 'MANAGER'),
  getEmployeeReport
);

/**
 * @route GET /api/reports/job-cards
 * @desc Get Job Card analytics report
 * @access Owner, Manager
 */
router.get(
  '/job-cards',
  authorizeRoles('OWNER', 'MANAGER'),
  getJobCardReport
);

/**
 * @route GET /api/reports/bundles
 * @desc Get bundle progress report
 * @access Owner, Manager
 */
router.get(
  '/bundles',
  authorizeRoles('OWNER', 'MANAGER'),
  getBundleReport
);

/**
 * @route GET /api/reports/salary
 * @desc Get salary ledger report
 * @access Owner, Manager
 */
router.get(
  '/salary',
  authorizeRoles('OWNER', 'MANAGER'),
  getSalaryReport
);

/**
 * @route GET /api/reports/advances
 * @desc Get advance loans report
 * @access Owner, Manager
 */
router.get(
  '/advances',
  authorizeRoles('OWNER', 'MANAGER'),
  getAdvanceReport
);

/**
 * @route GET /api/reports/payments
 * @desc Get payment transaction audit report
 * @access Owner, Manager
 */
router.get(
  '/payments',
  authorizeRoles('OWNER', 'MANAGER'),
  getPaymentReport
);

export default router;
