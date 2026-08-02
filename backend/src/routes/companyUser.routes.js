import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { authorizeRoles } from '../middleware/role.middleware.js';
import { requireCompany } from '../middleware/tenancy.middleware.js';
import {
  getCompanyUsers,
  createCompanyUser,
  updateCompanyUser,
  resetCompanyUserPassword,
  toggleCompanyUserStatus,
  deleteCompanyUser,
} from '../controllers/companyUser.controller.js';

const router = express.Router();

// All routes require: authenticated + company-assigned + OWNER role
router.use(authenticate);
router.use(requireCompany);
router.use(authorizeRoles('OWNER'));


// GET  /api/company-users            – list all managers/cutting masters for own company
router.get('/', getCompanyUsers);

// POST /api/company-users            – create new manager or cutting master
router.post('/', createCompanyUser);

// PUT  /api/company-users/:id        – update user profile (name, phone)
router.put('/:id', updateCompanyUser);

// POST /api/company-users/:id/reset-password – reset password + force change
router.post('/:id/reset-password', resetCompanyUserPassword);

// PATCH /api/company-users/:id/status – activate / deactivate user
router.patch('/:id/status', toggleCompanyUserStatus);

// DELETE /api/company-users/:id      – soft delete user
router.delete('/:id', deleteCompanyUser);

export default router;
