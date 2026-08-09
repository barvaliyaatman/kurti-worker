import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  resetSettings,
  getNextNumberSeries,
  getCompanyProfile,
  updateCompanyProfile,
  getRolePermissions,
  downloadBackup,
} from '../controllers/setting.controller.js';
import {
  getWorkflowSettings,
  updateWorkflowSettings,
} from '../controllers/workflowSetting.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

// Apply JWT authentication middleware to all setting routes
router.use(authenticate);

/**
 * @route GET /api/settings
 * @desc Get all system settings
 * @access Owner, Manager
 */
router.get('/', authorizeRoles('OWNER', 'MANAGER'), getSettings);

/**
 * @route PUT /api/settings
 * @desc Update system settings key-value map
 * @access Owner
 */
router.put('/', authorizeRoles('OWNER'), updateSettings);

/**
 * @route POST /api/settings/reset
 * @desc Reset system settings to default factory configurations
 * @access Owner
 */
router.post('/reset', authorizeRoles('OWNER'), resetSettings);

/**
 * @route GET /api/settings/number-series/:type
 * @desc Generate next auto-sequence number series for job-card, employee, advance, payment
 * @access Owner, Manager, Cutting Master
 */
router.get('/number-series/:type', authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'), getNextNumberSeries);

/**
 * @route GET /api/company
 * @desc Get company profile settings
 * @access Owner, Manager
 */
router.get('/company', authorizeRoles('OWNER', 'MANAGER'), getCompanyProfile);

/**
 * @route PUT /api/company
 * @desc Update company profile
 * @access Owner
 */
router.put('/company', authorizeRoles('OWNER'), updateCompanyProfile);

/**
 * @route GET /api/roles
 * @desc Get role & permission matrix
 * @access Owner, Manager
 */
router.get('/roles', authorizeRoles('OWNER', 'MANAGER'), getRolePermissions);

/**
 * @route GET /api/settings/backup
 * @desc Download JSON system database backup
 * @access Owner
 */
router.get('/backup', authorizeRoles('OWNER'), downloadBackup);

/**
 * @route GET /api/settings/workflow
 * @desc Get company production workflow settings
 * @access Owner, Manager, Cutting Master
 */
router.get('/workflow', authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'), getWorkflowSettings);

/**
 * @route PUT /api/settings/workflow
 * @desc Update company production workflow settings
 * @access Owner
 */
router.put('/workflow', authorizeRoles('OWNER'), updateWorkflowSettings);

export default router;
