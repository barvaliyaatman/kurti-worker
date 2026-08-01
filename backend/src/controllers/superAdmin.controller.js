import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import bcrypt from 'bcryptjs';

// Audit Log Helper
const logAuditAction = async (req, targetUser, action) => {
  try {
    const adminName = req.user?.full_name || 'System Super Admin';
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

    await prisma.auditLog.create({
      data: {
        admin_name: adminName,
        target_user: targetUser,
        action: action,
        ip_address: ipAddress,
      },
    });
  } catch (error) {
    console.error('❌ Failed to save audit log entry:', error);
  }
};

// GET /api/companies
export const getCompanies = async (req, res, next) => {
  try {
    const { search, status } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (search) {
      where.OR = [
        { company_name: { contains: search, mode: 'insensitive' } },
        { company_code: { contains: search, mode: 'insensitive' } },
        { owner_name: { contains: search, mode: 'insensitive' } },
      ];
    }

    const companies = await prisma.company.findMany({
      where,
      orderBy: { created_at: 'desc' },
      include: {
        _count: {
          select: {
            users: true,
            employees: true,
            job_cards: true,
          },
        },
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Companies retrieved successfully.',
      data: { companies },
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/companies
export const createCompany = async (req, res, next) => {
  try {
    const { company_code, company_name, owner_name, phone, email, address, logo, status } = req.body;

    if (!company_code || !company_name || !owner_name || !email || !phone) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Company code, name, owner name, email, and phone are required.',
      });
    }

    // Check code duplication
    const existing = await prisma.company.findUnique({
      where: { company_code },
    });
    if (existing) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: `Company with code '${company_code}' already exists.`,
      });
    }

    const company = await prisma.company.create({
      data: {
        company_code,
        company_name,
        owner_name,
        phone,
        email,
        address: address || null,
        logo: logo || null,
        status: status || 'ACTIVE',
      },
    });

    await logAuditAction(req, company_name, `REGISTERED_COMPANY: ${company_code}`);

    return ApiResponse.success({
      res,
      statusCode: 201,
      message: 'Company registered successfully.',
      data: { company },
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/companies/:id
export const updateCompany = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { company_name, owner_name, phone, email, address, logo, status } = req.body;

    const company = await prisma.company.findUnique({ where: { id } });
    if (!company) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Company not found.',
      });
    }

    const updated = await prisma.company.update({
      where: { id },
      data: {
        company_name: company_name !== undefined ? company_name : company.company_name,
        owner_name: owner_name !== undefined ? owner_name : company.owner_name,
        phone: phone !== undefined ? phone : company.phone,
        email: email !== undefined ? email : company.email,
        address: address !== undefined ? address : company.address,
        logo: logo !== undefined ? logo : company.logo,
        status: status !== undefined ? status : company.status,
      },
    });

    if (status && status !== company.status) {
      await logAuditAction(req, company.company_name, `SET_COMPANY_STATUS: ${status}`);
    } else {
      await logAuditAction(req, company.company_name, 'UPDATED_COMPANY_DETAILS');
    }

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Company updated successfully.',
      data: { company: updated },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/owners
export const getOwners = async (req, res, next) => {
  try {
    const owners = await prisma.user.findMany({
      where: { role: 'OWNER' },
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        password_reset_required: true,
        last_login: true,
        created_at: true,
        updated_at: true,
        company: {
          select: {
            company_name: true,
            company_code: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Owners retrieved successfully.',
      data: { owners },
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/owners
export const createOwner = async (req, res, next) => {
  try {
    const { full_name, email, password, company_id, phone } = req.body;

    if (!full_name || !email || !password || !company_id) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Owner name, email, password, and company selection are required.',
      });
    }

    // Verify company
    const company = await prisma.company.findUnique({ where: { id: company_id } });
    if (!company) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'Selected company does not exist.',
      });
    }

    // Check duplicate user
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'A user with this email address already exists.',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const owner = await prisma.user.create({
      data: {
        full_name,
        email,
        password_hash,
        phone: phone || null,
        role: 'OWNER',
        company_id,
        status: 'ACTIVE',
      },
    });

    // Also update company owner_name just in case
    await prisma.company.update({
      where: { id: company_id },
      data: { owner_name: full_name, email },
    });

    await logAuditAction(req, `${full_name} (${email})`, `CREATED_OWNER_ACCOUNT for company ${company.company_name}`);

    return ApiResponse.success({
      res,
      statusCode: 201,
      message: 'Owner account created successfully.',
      data: {
        owner: {
          id: owner.id,
          full_name: owner.full_name,
          email: owner.email,
          role: owner.role,
          company_id: owner.company_id,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/system/dashboard
export const getSystemDashboard = async (req, res, next) => {
  try {
    const [
      totalCompanies,
      activeCompanies,
      suspendedCompanies,
      totalOwners,
      totalManagers,
      totalCuttingMasters,
      totalEmployees,
      totalJobCards,
      recentCompanies,
    ] = await Promise.all([
      prisma.company.count(),
      prisma.company.count({ where: { status: 'ACTIVE' } }),
      prisma.company.count({ where: { status: { in: ['SUSPENDED', 'INACTIVE'] } } }),
      prisma.user.count({ where: { role: 'OWNER' } }),
      prisma.user.count({ where: { role: 'MANAGER' } }),
      prisma.user.count({ where: { role: 'CUTTING_MASTER' } }),
      prisma.employee.count({ where: { is_deleted: false } }),
      prisma.jobCard.count({ where: { is_deleted: false } }),
      prisma.company.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
      }),
    ]);

    // Today's completed pieces
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const [todayCompleted, monthCompleted] = await Promise.all([
      prisma.assignment.aggregate({
        _sum: { completed_sets: true },
        where: {
          is_deleted: false,
          status: 'COMPLETED',
          updated_at: { gte: startOfToday, lte: endOfToday },
        },
      }),
      prisma.assignment.aggregate({
        _sum: { completed_sets: true },
        where: {
          is_deleted: false,
          status: 'COMPLETED',
          updated_at: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
        },
      }),
    ]);

    // Platform Health indicators
    const dbStatus = 'ONLINE';
    const serverHealth = 'OK';

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'System-wide Super Admin dashboard statistics retrieved.',
      data: {
        metrics: {
          totalCompanies,
          activeCompanies,
          inactiveCompanies: suspendedCompanies,
          totalOwners,
          totalManagers,
          totalCuttingMasters,
          totalEmployees,
          totalJobCards,
          todayProduction: todayCompleted._sum.completed_sets || 0,
          monthlyProduction: monthCompleted._sum.completed_sets || 0,
        },
        recentCompanies,
        systemHealth: {
          server: serverHealth,
          database: dbStatus,
          apiUptime: '99.99%',
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/system/users
export const getSystemUsers = async (req, res, next) => {
  try {
    const { search, role, company_id } = req.query;

    const where = {};
    if (role) where.role = role;
    if (company_id) where.company_id = company_id;
    if (search) {
      where.OR = [
        { full_name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        full_name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        password_reset_required: true,
        last_login: true,
        created_at: true,
        updated_at: true,
        company: {
          select: {
            company_name: true,
            company_code: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'System users fetched successfully.',
      data: { users },
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/system/users/:id/status
export const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACTIVE, INACTIVE

    if (!['ACTIVE', 'INACTIVE'].includes(status)) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Status must be ACTIVE or INACTIVE.',
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'User account not found.',
      });
    }

    if (user.role === 'SUPER_ADMIN') {
      return ApiResponse.error({
        res,
        statusCode: 403,
        message: 'Super Admin account status cannot be altered.',
      });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        full_name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    const actionText = status === 'ACTIVE' ? 'ACTIVATED_ACCOUNT' : 'DEACTIVATED_ACCOUNT';
    await logAuditAction(req, `${user.full_name} (${user.email})`, actionText);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `User account has been successfully ${status === 'ACTIVE' ? 'activated' : 'locked'}.`,
      data: { user: updated },
    });
  } catch (error) {
    return next(error);
  }
};

// PUT /api/system/users/:id/reset-password
export const resetUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { password, forceReset } = req.body;

    if (!password || password.length < 6) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Password must be at least 6 characters long.',
      });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return ApiResponse.error({
        res,
        statusCode: 404,
        message: 'User account not found.',
      });
    }

    const password_hash = await bcrypt.hash(password, 10);
    await prisma.user.update({
      where: { id },
      data: { 
        password_hash,
        password_reset_required: forceReset === true,
      },
    });

    const actionText = forceReset ? 'PASSWORD_RESET_FORCED' : 'PASSWORD_RESET_COMPLETED';
    await logAuditAction(req, `${user.full_name} (${user.email})`, actionText);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Password reset successfully.',
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/system/audit-logs
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { created_at: 'desc' },
      take: 100, // Safe limit for dashboard size performance
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Audit logs retrieved successfully.',
      data: { logs },
    });
  } catch (error) {
    return next(error);
  }
};
