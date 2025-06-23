
import express from 'express';
import { registerUser, authUser, verifyToken, getAllUsers, logoutUser, getUserProfile, updateUserProfile } from '../controllers/authController.js';
import { submitSellerRequest } from '../controllers/sellerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/seller-request', submitSellerRequest);
router.get('/verify-token', protect, verifyToken);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.post('/logout', logoutUser);

export default router;
