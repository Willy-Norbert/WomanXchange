
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

const sellerRouter = express.Router();

// Public route for seller registration
sellerRouter.post('/request', submitSellerRequest);

// Admin routes for managing sellers
sellerRouter.get('/pending', protect, authorizeRoles('admin'), getPendingSellers);
sellerRouter.put('/:sellerId/status', protect, authorizeRoles('admin'), updateSellerStatus);

// Seller-specific routes
sellerRouter.get('/my-stats', protect, authorizeRoles('seller'), getSellerStats);
sellerRouter.get('/my-orders', protect, authorizeRoles('seller'), getSellerOrders);
sellerRouter.get('/my-products', protect, authorizeRoles('seller'), getSellerProducts);
sellerRouter.get('/my-customers', protect, authorizeRoles('seller'), getSellerCustomers);

export default sellerRouter;
