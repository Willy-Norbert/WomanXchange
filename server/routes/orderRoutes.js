
import express from 'express';
import {
  addToCart,
  removeFromCart,
  getCart,
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  confirmOrderPayment
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

// Optional authentication middleware for cart routes
const optionalAuth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    // If token exists, try to authenticate but don't fail if it doesn't work
    protect(req, res, (err) => {
      if (err) {
        console.log('Optional auth failed, continuing without user');
        req.user = null;
      }
      next();
    });
  } else {
    // No token, continue without authentication
    req.user = null;
    next();
  }
};

// Cart routes - no authentication required, but optionally use auth if available
orderRouter.route('/cart')
  .get(optionalAuth, getCart)
  .post(optionalAuth, addToCart)
  .delete(optionalAuth, removeFromCart);

// Order routes - authentication required for placing orders
orderRouter.route('/')
  .post(protect, placeOrder)
  .get(protect, getUserOrders);

orderRouter.route('/all')
  .get(protect, authorizeRoles('admin','seller'), getAllOrders);

orderRouter.route('/:id/status')
  .put(protect, authorizeRoles('admin','seller'), updateOrderStatus);

orderRouter.route('/:id/confirm-payment')
  .put(protect, authorizeRoles('admin','seller'), confirmOrderPayment);

export default orderRouter;
