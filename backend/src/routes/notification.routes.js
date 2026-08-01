import { Router } from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from '../controllers/notification.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Apply JWT authentication middleware to all notification routes
router.use(authenticate);

/**
 * @route GET /api/notifications
 * @desc Get list of notifications with search & filters
 */
router.get('/', getNotifications);

/**
 * @route GET /api/notifications/unread
 * @desc Get unread notification counter badge
 */
router.get('/unread', getUnreadCount);

/**
 * @route POST /api/notifications/read
 * @desc Mark a single notification as read
 */
router.post('/read', markAsRead);

/**
 * @route POST /api/notifications/read-all
 * @desc Mark all notifications as read
 */
router.post('/read-all', markAllAsRead);

/**
 * @route DELETE /api/notifications/:id
 * @desc Delete a notification entry
 */
router.delete('/:id', deleteNotification);

export default router;
