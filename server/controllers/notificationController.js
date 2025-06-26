
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';

// Get notifications for the logged-in user based on role and userId
export const getNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  const notifications = await prisma.notification.findMany({
    where: {
      OR: [
        { userId: userId },           // notifications specifically for this user
        { recipientRole: role }       // notifications for this user's role (admin/seller)
      ]
    },
    orderBy: { createdAt: 'desc' }
  });

  res.json(notifications);
});

// Mark notification as read and auto-delete after marking
export const markNotificationRead = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.userId !== req.user.id && notification.recipientRole !== req.user.role) {
    res.status(403);
    throw new Error('Not authorized to mark this notification');
  }

  // Mark as read and set readAt timestamp
  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: { 
      isRead: true,
      readAt: new Date()
    }
  });

  // Auto-delete the notification after marking as read
  await prisma.notification.delete({
    where: { id: notificationId }
  });

  res.json({ message: 'Notification marked as read and removed' });
});

// Delete notification
export const deleteNotification = asyncHandler(async (req, res) => {
  const notificationId = Number(req.params.id);

  const notification = await prisma.notification.findUnique({
    where: { id: notificationId }
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.userId !== req.user.id && notification.recipientRole !== req.user.role) {
    res.status(403);
    throw new Error('Not authorized to delete this notification');
  }

  await prisma.notification.delete({
    where: { id: notificationId }
  });

  res.json({ message: 'Notification deleted successfully' });
});

// New endpoint to mark all notifications as viewed (auto-delete them)
export const markAllNotificationsViewed = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const role = req.user.role;

  // Delete all notifications for this user
  await prisma.notification.deleteMany({
    where: {
      OR: [
        { userId: userId },
        { recipientRole: role }
      ]
    }
  });

  res.json({ message: 'All notifications marked as viewed and removed' });
});
