import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { contextStorage } from '../utils/context.js';

const FALLBACK_USERS = {
  'user-owner-001': {
    id: 'user-owner-001',
    full_name: 'Factory Owner',
    email: 'owner@factory.com',
    role: 'OWNER',
    status: 'ACTIVE',
  },
  'user-manager-002': {
    id: 'user-manager-002',
    full_name: 'Factory Manager',
    email: 'manager@factory.com',
    role: 'MANAGER',
    status: 'ACTIVE',
  },
  'user-cutting-003': {
    id: 'user-cutting-003',
    full_name: 'Cutting Master',
    email: 'cutting@factory.com',
    role: 'CUTTING_MASTER',
    status: 'ACTIVE',
  },
};

export const authenticate = async (req, res, next) => {
  try {
    let token = null;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.headers['x-access-token']) {
      token = req.headers['x-access-token'];
    }

    if (!token) {
      return ApiResponse.error({
        res,
        statusCode: 401,
        message: 'Authentication token missing. Please log in.',
      });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET);
    } catch (err) {
      return ApiResponse.error({
        res,
        statusCode: 401,
        message: 'Token expired or invalid. Please log in again.',
        error: err.name,
      });
    }

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          full_name: true,
          email: true,
          role: true,
          status: true,
          company_id: true,
        },
      });
    } catch (_dbErr) {
      user = FALLBACK_USERS[decoded.id] || {
        id: decoded.id,
        full_name: decoded.role === 'OWNER' ? 'Factory Owner' : decoded.role === 'MANAGER' ? 'Factory Manager' : 'Cutting Master',
        email: decoded.email,
        role: decoded.role,
        status: 'ACTIVE',
        company_id: decoded.company_id || null,
      };
    }

    if (!user) {
      return ApiResponse.error({
        res,
        statusCode: 401,
        message: 'User account no longer exists.',
      });
    }

    if (user.status !== 'ACTIVE') {
      return ApiResponse.error({
        res,
        statusCode: 403,
        message: 'User account is inactive. Please contact administration.',
      });
    }

    req.user = user;
    const store = contextStorage.getStore();
    if (store) {
      store.set('user', user);
    }
    return next();
  } catch (error) {
    return next(error);
  }
};
