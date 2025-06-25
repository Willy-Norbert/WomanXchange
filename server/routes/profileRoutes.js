
import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  changePassword,
  getAllUserProfiles,
  updateAnyUserProfile,
  deleteUserProfile
} from '../controllers/profileController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// User profile routes (for authenticated users)
router.get('/me', protect, getUserProfile);
router.put('/me', protect, updateUserProfile);
router.put('/change-password', protect, changePassword);

// Admin only routes for managing all user profiles
router.get('/all', protect, authorizeRoles('admin'), getAllUserProfiles);
router.put('/:userId', protect, authorizeRoles('admin'), updateAnyUserProfile);
router.delete('/:userId', protect, authorizeRoles('admin'), deleteUserProfile);

export default router;
