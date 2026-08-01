import { Router } from 'express';
import { login, logout, getCurrentUser, changePassword } from '../controllers/auth.controller.js';
import { validate } from '../middleware/validate.js';
import { loginSchema } from '../validators/auth.validator.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route POST /api/auth/login
 * @desc User authentication and JWT issuance
 * @access Public
 */
router.post('/login', validate(loginSchema), login);

/**
 * @route POST /api/auth/logout
 * @desc Terminate user session
 * @access Protected
 */
router.post('/logout', authenticate, logout);

/**
 * @route GET /api/auth/me
 * @desc Get authenticated user details
 * @access Protected
 */
router.get('/me', authenticate, getCurrentUser);

/**
 * @route POST /api/auth/change-password
 * @desc Enforce users to change password on reset required
 * @access Protected
 */
router.post('/change-password', authenticate, changePassword);

export default router;
