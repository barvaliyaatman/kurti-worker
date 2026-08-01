import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { invalidateConfigCache } from '../utils/configHelper.js';
import { numberSeriesService } from '../services/numberSeriesService.js';

export const DEFAULT_SETTINGS = [
  // 1. Company Settings
  { key: 'company_name', value: 'Kurti Manufacturing Factory', category: 'COMPANY' },
  { key: 'factory_name', value: 'Factory Main Unit - Jaipur', category: 'COMPANY' },
  { key: 'gst_number', value: '08AAAAA0000A1Z5', category: 'COMPANY' },
  { key: 'phone', value: '+91 98765 43210', category: 'COMPANY' },
  { key: 'email', value: 'owner@factory.com', category: 'COMPANY' },
  { key: 'website', value: 'https://kurtierp.factory.com', category: 'COMPANY' },
  { key: 'address', value: 'Industrial Area Phase 2, Jaipur, Rajasthan 302013', category: 'COMPANY' },
  { key: 'currency', value: '₹ INR', category: 'COMPANY' },
  { key: 'timezone', value: 'Asia/Kolkata', category: 'COMPANY' },
  { key: 'language', value: 'en', category: 'COMPANY' },

  // 2. Factory Settings
  { key: 'working_hours', value: '09:00 AM - 07:00 PM', category: 'FACTORY' },
  { key: 'working_days', value: 'Monday - Saturday', category: 'FACTORY' },
  { key: 'holiday_list', value: 'Sunday, National Holidays', category: 'FACTORY' },
  { key: 'default_shift', value: 'General Day Shift (09:00 - 19:00)', category: 'FACTORY' },
  { key: 'default_working_hours', value: '10', category: 'FACTORY' },

  // 3. Employee Settings
  { key: 'employee_prefix', value: 'EMP', category: 'EMPLOYEE' },
  { key: 'auto_employee_number', value: 'true', category: 'EMPLOYEE' },
  { key: 'default_employee_status', value: 'ACTIVE', category: 'EMPLOYEE' },
  { key: 'default_joining_date_today', value: 'true', category: 'EMPLOYEE' },

  // 4. Job Card Settings
  { key: 'job_card_prefix', value: 'JC', category: 'JOB_CARD' },
  { key: 'auto_jc_number', value: 'true', category: 'JOB_CARD' },
  { key: 'default_priority', value: 'NORMAL', category: 'JOB_CARD' },
  { key: 'default_due_days', value: '7', category: 'JOB_CARD' },
  { key: 'default_stitching_rate', value: '110.0', category: 'JOB_CARD' },
  { key: 'default_notes', value: '', category: 'JOB_CARD' },

  // 5. Bundle Settings
  { key: 'bundle_prefix', value: 'BND', category: 'BUNDLE' },
  { key: 'auto_bundle_number', value: 'true', category: 'BUNDLE' },
  { key: 'default_bundle_status', value: 'READY_FOR_ASSIGNMENT', category: 'BUNDLE' },

  // 6. Salary Settings
  { key: 'salary_cycle', value: 'Monthly', category: 'SALARY' },
  { key: 'default_payment_mode', value: 'CASH', category: 'SALARY' },
  { key: 'salary_lock_day', value: 'Last Day of Month', category: 'SALARY' },
  { key: 'payment_methods', value: 'CASH,UPI,BANK_TRANSFER,CHEQUE', category: 'SALARY' },

  // 7. Notification Settings
  { key: 'enable_notifications', value: 'true', category: 'NOTIFICATION' },
  { key: 'enable_dashboard_alerts', value: 'true', category: 'NOTIFICATION' },
  { key: 'enable_critical_alerts', value: 'true', category: 'NOTIFICATION' },
  { key: 'notification_retention_days', value: '30', category: 'NOTIFICATION' },

  // 8. Application Preferences
  { key: 'theme', value: 'Light', category: 'PREFERENCES' },
  { key: 'primary_color', value: '#384CF0', category: 'PREFERENCES' },
  { key: 'table_page_size', value: '50', category: 'PREFERENCES' },
  { key: 'default_language', value: 'en', category: 'PREFERENCES' },

  // 9. Number Series
  { key: 'advance_prefix', value: 'ADV', category: 'NUMBER_SERIES' },
  { key: 'payment_prefix', value: 'PAY', category: 'NUMBER_SERIES' },

  // 10. Default Values
  { key: 'default_status', value: 'ACTIVE', category: 'DEFAULTS' },
];

export const getSettings = async (req, res, next) => {
  try {
    let settings = await prisma.systemSetting.findMany({});

    // Seed defaults if empty
    if (settings.length === 0) {
      await prisma.systemSetting.createMany({
        data: DEFAULT_SETTINGS,
        skipDuplicates: true,
      });
      settings = await prisma.systemSetting.findMany({});
    }

    const settingsMap = {};
    const categoryMap = {};

    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
      if (!categoryMap[s.category]) {
        categoryMap[s.category] = {};
      }
      categoryMap[s.category][s.key] = s.value;
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'System settings retrieved successfully.',
      data: {
        settings: settingsMap,
        categories: categoryMap,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Invalid settings payload.',
      });
    }

    // Sequential loop to prevent Supabase connection pool exhaustion
    for (const [key, value] of Object.entries(settings)) {
      await prisma.systemSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value), category: 'GENERAL' },
      });
    }

    invalidateConfigCache();

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'System settings updated successfully.',
    });
  } catch (error) {
    return next(error);
  }
};

export const resetSettings = async (req, res, next) => {
  try {
    await prisma.systemSetting.deleteMany({});
    await prisma.systemSetting.createMany({
      data: DEFAULT_SETTINGS,
    });

    invalidateConfigCache();

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'System settings reset to default factory configurations.',
    });
  } catch (error) {
    return next(error);
  }
};

export const getNextNumberSeries = async (req, res, next) => {
  try {
    const { type } = req.params;

    let nextNumber = '';
    if (type === 'job-card') {
      nextNumber = await numberSeriesService.generateJobCardNumber();
    } else if (type === 'employee') {
      nextNumber = await numberSeriesService.generateEmployeeCode();
    } else if (type === 'advance') {
      nextNumber = await numberSeriesService.generateAdvanceRefNumber();
    } else if (type === 'payment') {
      nextNumber = await numberSeriesService.generatePaymentRefNumber();
    } else {
      nextNumber = `REF-${Date.now()}`;
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Next number generated for ${type}`,
      data: { number: nextNumber },
    });
  } catch (error) {
    return next(error);
  }
};

export const getCompanyProfile = async (req, res, next) => {
  try {
    const settings = await prisma.systemSetting.findMany({
      where: { category: 'COMPANY' },
    });

    const company = {};
    settings.forEach((s) => {
      company[s.key] = s.value;
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Company profile retrieved successfully.',
      data: { company },
    });
  } catch (error) {
    return next(error);
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  try {
    const { company_name, factory_name, gst_number, phone, email, website, address } = req.body;

    const companyFields = {
      company_name,
      factory_name,
      gst_number,
      phone,
      email,
      website,
      address,
    };

    for (const [key, val] of Object.entries(companyFields)) {
      if (val !== undefined) {
        await prisma.systemSetting.upsert({
          where: { key },
          update: { value: String(val) },
          create: { key, value: String(val), category: 'COMPANY' },
        });
      }
    }

    invalidateConfigCache();

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Company profile updated successfully.',
    });
  } catch (error) {
    return next(error);
  }
};

export const getRolePermissions = async (req, res, next) => {
  try {
    const roleMatrix = {
      OWNER: {
        title: 'Factory Owner',
        description: 'Full Access across all modules, User management & Settings',
        permissions: ['ALL_ACCESS', 'USER_MANAGEMENT', 'SYSTEM_SETTINGS', 'SALARY_PAYMENT', 'ADVANCE_APPROVAL'],
      },
      MANAGER: {
        title: 'Factory Manager',
        description: 'Assignment, Production, Salary, Advances & Reports Management',
        permissions: ['JOB_CARD_CREATE', 'CUTTING_QUEUE', 'BUNDLE_ASSIGNMENT', 'SALARY_CALCULATION', 'ADVANCE_ISSUE', 'REPORTS'],
      },
      CUTTING_MASTER: {
        title: 'Cutting Master',
        description: 'Cutting Queue, Component Checklist & Color/Size Bundle Generation Only',
        permissions: ['CUTTING_QUEUE', 'START_CUTTING', 'COMPONENT_CHECKLIST', 'BUNDLE_GENERATION'],
      },
    };

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Roles & permissions matrix retrieved successfully.',
      data: { roles: roleMatrix },
    });
  } catch (error) {
    return next(error);
  }
};

export const downloadBackup = async (req, res, next) => {
  try {
    const [users, employees, jobCards, bundles, assignments, advances, payments, settings] =
      await Promise.all([
        prisma.user.findMany({ select: { id: true, full_name: true, email: true, role: true, status: true } }),
        prisma.employee.findMany({}),
        prisma.jobCard.findMany({ include: { items: true, cutting_progress: true } }),
        prisma.bundle.findMany({}),
        prisma.assignment.findMany({}),
        prisma.employeeAdvance.findMany({}),
        prisma.employeePayment.findMany({}),
        prisma.systemSetting.findMany({}),
      ]);

    const backupSnapshot = {
      app: 'Kurti Manufacturing ERP',
      version: '1.0.0',
      exported_at: new Date().toISOString(),
      data: {
        users,
        employees,
        jobCards,
        bundles,
        assignments,
        advances,
        payments,
        settings,
      },
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=kurti_erp_backup_${Date.now()}.json`);
    return res.status(200).send(JSON.stringify(backupSnapshot, null, 2));
  } catch (error) {
    return next(error);
  }
};
