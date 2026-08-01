import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import {
  getCompanies,
  createCompany,
  updateCompany,
  getOwners,
  createOwner,
  getSystemDashboard,
  getSystemUsers,
  updateUserStatus,
  resetUserPassword,
} from '../controllers/superAdmin.controller.js';

const router = Router();

// Company Routes
router.get('/companies', authenticate, authorizeRoles('SUPER_ADMIN'), getCompanies);
router.post('/companies', authenticate, authorizeRoles('SUPER_ADMIN'), createCompany);
router.put('/companies/:id', authenticate, authorizeRoles('SUPER_ADMIN'), updateCompany);

// Owner Routes
router.get('/owners', authenticate, authorizeRoles('SUPER_ADMIN'), getOwners);
router.post('/owners', authenticate, authorizeRoles('SUPER_ADMIN'), createOwner);

// Dashboard Routes
router.get('/system/dashboard', authenticate, authorizeRoles('SUPER_ADMIN'), getSystemDashboard);

// User Management Routes
router.get('/system/users', authenticate, authorizeRoles('SUPER_ADMIN'), getSystemUsers);
router.put('/system/users/:id/status', authenticate, authorizeRoles('SUPER_ADMIN'), updateUserStatus);
router.put('/system/users/:id/reset-password', authenticate, authorizeRoles('SUPER_ADMIN'), resetUserPassword);

export default router;
