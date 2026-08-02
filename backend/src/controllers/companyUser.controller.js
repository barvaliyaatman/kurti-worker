import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import bcrypt from 'bcryptjs';

// Roles an Owner is permitted to manage (cannot create OWNER or SUPER_ADMIN)
const MANAGEABLE_ROLES = ['MANAGER', 'CUTTING_MASTER'];

// Audit log helper (reused from superAdmin style, but company-scoped)
const logOwnerAction = async (req, targetUser, action) => {
  try {
    await prisma.auditLog.create({
      data: {
        admin_name: req.user?.full_name || 'Owner',
        target_user: targetUser,
        action,
        ip_address: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
        company_id: req.user?.company_id || null,
      },
    });
  } catch (err) {
    console.error('❌ Failed to log owner audit action:', err);
  }
};

/**
 * GET /api/company-users
 * Returns all MANAGER and CUTTING_MASTER users for the logged-in owner's company.
 */
export const getCompanyUsers = async (req, res, next) => {
  try {
    const { search, role, status, page = 1, limit = 20 } = req.query;
    const companyId = req.user.company_id;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const where = {
      company_id: companyId,
      is_deleted: false,
      role: { in: MANAGEABLE_ROLES },
    };

    if (role && role !== 'ALL' && MANAGEABLE_ROLES.includes(role)) {
      where.role = role;
    }

    if (status && status !== 'ALL') {
      where.status = status.toUpperCase();
    }

    if (search && search.trim() !== '') {
      const term = search.trim();
      where.OR = [
        { full_name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { phone: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
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
        },
      }),
      prisma.user.count({ where }),
    ]);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Company users retrieved successfully.',
      data: {
        users,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/company-users
 * Create a new MANAGER or CUTTING_MASTER user for the owner's company.
 */
export const createCompanyUser = async (req, res, next) => {
  try {
    const { full_name, email, phone, role, password } = req.body;
    const companyId = req.user.company_id;

    if (!full_name || !email || !role || !password) {
      return ApiResponse.error({ res, statusCode: 400, message: 'Full name, email, role, and password are required.' });
    }

    // Security: prevent Owner from creating OWNER or SUPER_ADMIN
    if (!MANAGEABLE_ROLES.includes(role.toUpperCase())) {
      return ApiResponse.error({ res, statusCode: 403, message: `You are not permitted to create a user with role '${role}'.` });
    }

    if (password.length < 6) {
      return ApiResponse.error({ res, statusCode: 400, message: 'Password must be at least 6 characters.' });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Check email uniqueness globally (email is always unique in the system)
    const existingEmail = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingEmail) {
      return ApiResponse.error({ res, statusCode: 409, message: `Email '${cleanEmail}' is already registered.` });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        full_name: full_name.trim(),
        email: cleanEmail,
        phone: phone ? phone.trim() : null,
        role: role.toUpperCase(),
        status: 'ACTIVE',
        password_hash,
        company_id: companyId,
        created_by: req.user.id,
      },
      select: {
        id: true, full_name: true, email: true, phone: true,
        role: true, status: true, created_at: true,
      },
    });

    await logOwnerAction(req, newUser.email, `CREATED_USER: ${newUser.role}`);

    return ApiResponse.success({
      res,
      statusCode: 201,
      message: `${newUser.role === 'MANAGER' ? 'Manager' : 'Cutting Master'} '${newUser.full_name}' created successfully.`,
      data: { user: newUser },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PUT /api/company-users/:id
 * Update a company user's name, email, or phone – only within own company.
 */
export const updateCompanyUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { full_name, phone } = req.body;
    const companyId = req.user.company_id;

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser || existingUser.is_deleted) {
      return ApiResponse.error({ res, statusCode: 404, message: 'User not found.' });
    }

    // Ownership check: must belong to same company
    if (existingUser.company_id !== companyId) {
      return ApiResponse.error({ res, statusCode: 404, message: 'User not found.' });
    }

    // Cannot modify OWNER or SUPER_ADMIN via this endpoint
    if (!MANAGEABLE_ROLES.includes(existingUser.role)) {
      return ApiResponse.error({ res, statusCode: 403, message: 'You cannot modify this user.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(full_name && { full_name: full_name.trim() }),
        ...(phone !== undefined && { phone: phone ? phone.trim() : null }),
      },
      select: {
        id: true, full_name: true, email: true, phone: true,
        role: true, status: true, updated_at: true,
      },
    });

    await logOwnerAction(req, updated.email, 'UPDATED_USER_PROFILE');

    return ApiResponse.success({ res, statusCode: 200, message: 'User updated successfully.', data: { user: updated } });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/company-users/:id/reset-password
 * Generate and set a temporary password; force password change on next login.
 */
export const resetCompanyUserPassword = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { new_password } = req.body;
    const companyId = req.user.company_id;

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser || existingUser.is_deleted) {
      return ApiResponse.error({ res, statusCode: 404, message: 'User not found.' });
    }

    if (existingUser.company_id !== companyId) {
      return ApiResponse.error({ res, statusCode: 404, message: 'User not found.' });
    }

    if (!MANAGEABLE_ROLES.includes(existingUser.role)) {
      return ApiResponse.error({ res, statusCode: 403, message: 'You cannot reset this user\'s password.' });
    }

    // Use provided password or generate a temporary one
    const tempPassword = new_password || `Temp@${Math.floor(1000 + Math.random() * 9000)}`;

    if (tempPassword.length < 6) {
      return ApiResponse.error({ res, statusCode: 400, message: 'New password must be at least 6 characters.' });
    }

    const password_hash = await bcrypt.hash(tempPassword, 10);

    await prisma.user.update({
      where: { id },
      data: {
        password_hash,
        password_reset_required: true,
      },
    });

    await logOwnerAction(req, existingUser.email, 'RESET_USER_PASSWORD');

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `Password reset for '${existingUser.full_name}'. They must change it on next login.`,
      data: {
        temporary_password: new_password ? null : tempPassword, // Only return auto-generated ones
        password_reset_required: true,
      },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * PATCH /api/company-users/:id/status
 * Activate or deactivate a user within the owner's company.
 */
export const toggleCompanyUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // ACTIVE or INACTIVE
    const companyId = req.user.company_id;

    if (!['ACTIVE', 'INACTIVE'].includes(status?.toUpperCase())) {
      return ApiResponse.error({ res, statusCode: 400, message: 'Status must be ACTIVE or INACTIVE.' });
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser || existingUser.is_deleted) {
      return ApiResponse.error({ res, statusCode: 404, message: 'User not found.' });
    }

    if (existingUser.company_id !== companyId) {
      return ApiResponse.error({ res, statusCode: 404, message: 'User not found.' });
    }

    if (!MANAGEABLE_ROLES.includes(existingUser.role)) {
      return ApiResponse.error({ res, statusCode: 403, message: 'You cannot change this user\'s status.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: status.toUpperCase() },
      select: { id: true, full_name: true, email: true, role: true, status: true },
    });

    await logOwnerAction(req, updated.email, `SET_STATUS_${status.toUpperCase()}`);

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: `User '${updated.full_name}' is now ${updated.status}.`,
      data: { user: updated },
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * DELETE /api/company-users/:id
 * Soft-delete a user (cannot delete OWNER or SUPER_ADMIN).
 */
export const deleteCompanyUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.company_id;

    const existingUser = await prisma.user.findUnique({ where: { id } });

    if (!existingUser || existingUser.is_deleted) {
      return ApiResponse.error({ res, statusCode: 404, message: 'User not found.' });
    }

    if (existingUser.company_id !== companyId) {
      return ApiResponse.error({ res, statusCode: 404, message: 'User not found.' });
    }

    if (!MANAGEABLE_ROLES.includes(existingUser.role)) {
      return ApiResponse.error({ res, statusCode: 403, message: 'You cannot delete this user.' });
    }

    await prisma.user.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
        status: 'INACTIVE',
      },
    });

    await logOwnerAction(req, existingUser.email, 'DELETED_USER');

    return ApiResponse.success({ res, statusCode: 200, message: `User '${existingUser.full_name}' has been removed.` });
  } catch (error) {
    return next(error);
  }
};
