import { prisma } from '../prisma/prisma.js';

/**
 * Creates a system notification record in Supabase PostgreSQL
 */
export const createSystemNotification = async ({
  title,
  message,
  type = 'INFO',
  priority = 'MEDIUM',
  reference_type = null,
  reference_id = null,
  user_role = 'ALL',
}) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        title,
        message,
        type,
        priority,
        reference_type,
        reference_id,
        user_role,
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create system notification:', error);
    return null;
  }
};
