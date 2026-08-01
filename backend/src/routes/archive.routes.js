import { Router } from 'express';
import {
  getArchivedRecords,
  restoreRecord,
  permanentDeleteRecord,
} from '../controllers/archive.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

router.use(authenticate);

/**
 * @route GET /api/archive
 * @desc Get all soft-deleted records in Trash
 * @access Owner only
 */
router.get('/', authorizeRoles('OWNER'), getArchivedRecords);

/**
 * @route POST /api/archive/:type/:id/restore
 * @desc Restore a soft-deleted record
 * @access Owner only
 */
router.post('/:type/:id/restore', authorizeRoles('OWNER'), restoreRecord);

/**
 * @route DELETE /api/archive/:type/:id/permanent
 * @desc Permanently delete record (Owner only)
 * @access Owner only
 */
router.delete('/:type/:id/permanent', authorizeRoles('OWNER'), permanentDeleteRecord);

export default router;
