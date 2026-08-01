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

// Secure all routes with Super Admin check
router.use(authenticate);
router.use(authorizeRoles('SUPER_ADMIN'));

// Company Routes
router.get('/companies', getCompanies);
router.post('/companies', createCompany);
router.put('/companies/:id', updateCompany);

// Owner Routes
router.get('/owners', getOwners);
router.post('/owners', createOwner);

// Dashboard Routes
router.get('/system/dashboard', getSystemDashboard);

// User Management Routes
router.get('/system/users', getSystemUsers);
router.put('/system/users/:id/status', updateUserStatus);
router.put('/system/users/:id/reset-password', resetUserPassword);

export default router;
