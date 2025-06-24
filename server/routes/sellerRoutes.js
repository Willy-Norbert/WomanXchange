
import express from 'express';
import {
  submitSellerRequest,
  getPendingSellers,
  updateSellerStatus,
  getSellerProducts,
  getSellerCustomers,
  getSellerOrders,
  getSellerStats
} from '../controllers/sellerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public route for seller requests
router.post('/request', submitSellerRequest);

// Admin routes for managing sellers
router.get('/pending', protect, authorizeRoles('admin'), getPendingSellers);
router.put('/:sellerId/status', protect, authorizeRoles('admin'), updateSellerStatus);

// Seller-specific routes - ONLY for active sellers
router.get('/my-products', protect, authorizeRoles('seller'), getSellerProducts);
router.get('/my-customers', protect, authorizeRoles('seller'), getSellerCustomers);
router.get('/my-orders', protect, authorizeRoles('seller'), getSellerOrders);
router.get('/my-stats', protect, authorizeRoles('seller'), getSellerStats);

export default router;
