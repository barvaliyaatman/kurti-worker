import { prisma } from '../prisma/prisma.js';
import { ApiResponse } from '../utils/apiResponse.js';

export const getNotifications = async (req, res, next) => {
  try {
    const { is_read, priority, search, page = 1, limit = 50 } = req.query;
    const userRole = req.user?.role || 'ALL';

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 50;
    const skip = (pageNum - 1) * limitNum;

    const whereClause = {
      OR: [{ user_role: 'ALL' }, { user_role: userRole }],
    };

    if (is_read !== undefined && is_read !== '') {
      whereClause.is_read = is_read === 'true';
    }

    if (priority && priority !== 'ALL') {
      whereClause.priority = priority;
    }

    if (search && search.trim() !== '') {
      const term = search.trim().toLowerCase();
      whereClause.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { message: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: whereClause,
        orderBy: { created_at: 'desc' },
        skip,
        take: limitNum,
      }),
      prisma.notification.count({ where: whereClause }),
    ]);

    const unreadCount = await prisma.notification.count({
      where: {
        OR: [{ user_role: 'ALL' }, { user_role: userRole }],
        is_read: false,
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Notifications retrieved successfully.',
      data: {
        notifications,
        unread_count: unreadCount,
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

export const getUnreadCount = async (req, res, next) => {
  try {
    const userRole = req.user?.role || 'ALL';

    const count = await prisma.notification.count({
      where: {
        OR: [{ user_role: 'ALL' }, { user_role: userRole }],
        is_read: false,
      },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Unread notifications count retrieved.',
      data: { unread_count: count },
    });
  } catch (error) {
    return next(error);
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.body;

    if (!id) {
      return ApiResponse.error({
        res,
        statusCode: 400,
        message: 'Notification ID is required.',
      });
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: { is_read: true },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Notification marked as read.',
      data: { notification },
    });
  } catch (error) {
    return next(error);
  }
};

export const markAllAsRead = async (req, res, next) => {
  try {
    const userRole = req.user?.role || 'ALL';

    await prisma.notification.updateMany({
      where: {
        OR: [{ user_role: 'ALL' }, { user_role: userRole }],
        is_read: false,
      },
      data: { is_read: true },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'All notifications marked as read.',
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteNotification = async (req, res, next) => {
  try {
    const { id } = req.params;

    await prisma.notification.delete({
      where: { id },
    });

    return ApiResponse.success({
      res,
      statusCode: 200,
      message: 'Notification deleted successfully.',
    });
  } catch (error) {
    return next(error);
  }
};
