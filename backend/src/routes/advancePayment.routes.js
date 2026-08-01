import { Router } from 'express';
import {
  getAdvancesOverview,
  createAdvance,
  updateAdvance,
  getPaymentsOverview,
  createPayment,
  getPaymentHistory,
  getAdvancePaymentReports,
} from '../controllers/advancePayment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

// Apply JWT authentication middleware to all advance & payment routes
router.use(authenticate);

/**
 * @route GET /api/advances
 * @desc Get employee advances overview & summary metrics
 * @access Owner, Manager
 */
router.get(
  '/advances',
  authorizeRoles('OWNER', 'MANAGER'),
  getAdvancesOverview
);

/**
 * @route POST /api/advances
 * @desc Issue new employee salary advance loan
 * @access Owner, Manager
 */
router.post(
  '/advances',
  authorizeRoles('OWNER', 'MANAGER'),
  createAdvance
);

/**
 * @route PUT /api/advances/:id
 * @desc Edit advance loan entry
 * @access Owner, Manager
 */
router.put(
  '/advances/:id',
  authorizeRoles('OWNER', 'MANAGER'),
  updateAdvance
);

/**
 * @route GET /api/payments
 * @desc Get employee payments list overview
 * @access Owner, Manager
 */
router.get(
  '/payments',
  authorizeRoles('OWNER', 'MANAGER'),
  getPaymentsOverview
);

/**
 * @route POST /api/payments
 * @desc Disburse salary payment
 * @access Owner, Manager
 */
router.post(
  '/payments',
  authorizeRoles('OWNER', 'MANAGER'),
  createPayment
);

/**
 * @route GET /api/payments/history
 * @desc Get payment transaction history audit log
 * @access Owner, Manager
 */
router.get(
  '/payments/history',
  authorizeRoles('OWNER', 'MANAGER'),
  getPaymentHistory
);

/**
 * @route GET /api/payments/reports
 * @desc Get consolidated advance & payment reports
 * @access Owner, Manager
 */
router.get(
  '/payments/reports',
  authorizeRoles('OWNER', 'MANAGER'),
  getAdvancePaymentReports
);

export default router;
