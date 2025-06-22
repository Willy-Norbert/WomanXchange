
import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { getChatMessages, createChatMessage, deleteChatMessage } from '../controllers/chatController.js';

const router = express.Router();

// Community chat routes - only for admins and sellers
router.get('/messages', protect, authorizeRoles('admin', 'seller'), getChatMessages);
router.post('/messages', protect, authorizeRoles('admin', 'seller'), createChatMessage);
router.delete('/messages/:id', protect, authorizeRoles('admin', 'seller'), deleteChatMessage);

export default router;
