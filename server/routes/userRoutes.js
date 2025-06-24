
import express from 'express';
import { 
  registerUser, 
  authUser, 
  verifyToken, 
  getAllUsers, 
  deleteUser,
  updateUser,
  logoutUser, 
  getUserProfile, 
  updateUserProfile 
} from '../controllers/authController.js';
import { submitSellerRequest } from '../controllers/sellerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerUser);
router.post('/login', authUser);
router.post('/seller-request', submitSellerRequest);
router.post('/logout', logoutUser);

// Protected routes
router.get('/verify-token', protect, verifyToken);
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Admin only routes
router.get('/users', protect, authorizeRoles('admin'), getAllUsers);
router.delete('/users/:userId', protect, authorizeRoles('admin'), deleteUser);
router.put('/users/:userId', protect, authorizeRoles('admin'), updateUser);

export default router;
