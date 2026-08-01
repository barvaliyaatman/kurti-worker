import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import employeeRoutes from './employee.routes.js';
import jobCardRoutes from './jobCard.routes.js';
import cuttingRoutes from './cutting.routes.js';
import bundleRoutes from './bundle.routes.js';
import assignmentRoutes from './assignment.routes.js';
import salaryRoutes from './salary.routes.js';
import advancePaymentRoutes from './advancePayment.routes.js';
import reportRoutes from './report.routes.js';
import notificationRoutes from './notification.routes.js';
import settingRoutes from './setting.routes.js';
import garmentSizeRoutes from './garmentSize.routes.js';
import archiveRoutes from './archive.routes.js';

const router = Router();

// Health Check API
router.use('/health', healthRoutes);

// Auth APIs (/api/auth/*)
router.use('/auth', authRoutes);

// Dashboard APIs (/api/dashboard/*)
router.use('/dashboard', dashboardRoutes);

// Employee APIs (/api/employees/*)
router.use('/employees', employeeRoutes);

// Job Card APIs (/api/job-cards/*)
router.use('/job-cards', jobCardRoutes);

// Cutting APIs (/api/cutting/*)
router.use('/cutting', cuttingRoutes);

// Bundle APIs (/api/bundles/*)
router.use('/bundles', bundleRoutes);

// Assignment APIs (/api/assignments/*)
router.use('/assignments', assignmentRoutes);

// Salary APIs (/api/salary/*)
router.use('/salary', salaryRoutes);

// Reports APIs (/api/reports/*)
router.use('/reports', reportRoutes);

// Notification APIs (/api/notifications/*)
router.use('/notifications', notificationRoutes);

// Settings APIs (/api/settings/* & /api/company & /api/roles)
router.use('/settings', settingRoutes);
router.use('/', settingRoutes);

// Garment Size Master APIs (/api/garment-sizes/*)
router.use('/garment-sizes', garmentSizeRoutes);

// Trash / Archive APIs (/api/archive/*)
router.use('/archive', archiveRoutes);

// Advance & Payment APIs (/api/advances/* & /api/payments/*)
router.use('/', advancePaymentRoutes);

// v1 Alias (/api/v1/*)
router.use('/v1/health', healthRoutes);
router.use('/v1/auth', authRoutes);
router.use('/v1/dashboard', dashboardRoutes);
router.use('/v1/employees', employeeRoutes);
router.use('/v1/job-cards', jobCardRoutes);
router.use('/v1/cutting', cuttingRoutes);
router.use('/v1/bundles', bundleRoutes);
router.use('/v1/assignments', assignmentRoutes);
router.use('/v1/salary', salaryRoutes);
router.use('/v1/reports', reportRoutes);
router.use('/v1/notifications', notificationRoutes);
router.use('/v1/settings', settingRoutes);
router.use('/v1/garment-sizes', garmentSizeRoutes);
router.use('/v1/archive', archiveRoutes);
router.use('/v1', settingRoutes);
router.use('/v1', advancePaymentRoutes);

export default router;
