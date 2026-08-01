import { Router } from 'express';
import {
  getGarmentSizes,
  createGarmentSize,
  updateGarmentSize,
  deleteGarmentSize,
} from '../controllers/garmentSize.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';

const router = Router();

// Apply JWT authentication middleware
router.use(authenticate);

/**
 * @route GET /api/garment-sizes
 * @desc Get all garment sizes (sorted by display order)
 * @access Owner, Manager, Cutting Master
 */
router.get('/', authorizeRoles('OWNER', 'MANAGER', 'CUTTING_MASTER'), getGarmentSizes);

/**
 * @route POST /api/garment-sizes
 * @desc Add a new garment size
 * @access Owner
 */
router.post('/', authorizeRoles('OWNER'), createGarmentSize);

/**
 * @route PUT /api/garment-sizes/:id
 * @desc Edit an existing garment size
 * @access Owner
 */
router.put('/:id', authorizeRoles('OWNER'), updateGarmentSize);

/**
 * @route DELETE /api/garment-sizes/:id
 * @desc Delete a garment size
 * @access Owner
 */
router.delete('/:id', authorizeRoles('OWNER'), deleteGarmentSize);

export default router;
