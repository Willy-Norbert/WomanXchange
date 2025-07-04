
import express from 'express';
import { getNotifications, markNotificationRead, deleteNotification, markAllNotificationsViewed } from '../controllers/notificationController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/', getNotifications);
router.put('/:id/read', markNotificationRead);
router.delete('/:id', deleteNotification);
router.post('/mark-all-viewed', markAllNotificationsViewed);

export default router;
