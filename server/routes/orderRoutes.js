
import express from 'express';
import {
  addToCart,
  removeFromCart,
  getCart,
  placeOrder,
  createOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus,
  updateOrder,
  deleteOrder,
  confirmOrderPayment,
  getOrderById
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();

// Cart routes (public access for guest users)
orderRouter.route('/cart')
  .get((req, res, next) => {
    // Try to authenticate, but don't require it
    if (req.headers.authorization) {
      protect(req, res, (err) => {
        if (err) {
          // If auth fails, continue as guest
          req.user = null;
        }
        next();
      });
    } else {
      req.user = null;
      next();
    }
  }, getCart)
  .post((req, res, next) => {
    // Try to authenticate, but don't require it
    if (req.headers.authorization) {
      protect(req, res, (err) => {
        if (err) {
          // If auth fails, continue as guest
          req.user = null;
        }
        next();
      });
    } else {
      req.user = null;
      next();
    }
  }, addToCart)
  .delete((req, res, next) => {
    // Try to authenticate, but don't require it
    if (req.headers.authorization) {
      protect(req, res, (err) => {
        if (err) {
          // If auth fails, continue as guest
          req.user = null;
        }
        next();
      });
    } else {
      req.user = null;
      next();
    }
  }, removeFromCart);

// Order placement (supports both authenticated and guest users)
orderRouter.post('/', (req, res, next) => {
  // Try to authenticate, but don't require it
  if (req.headers.authorization) {
    protect(req, res, (err) => {
      if (err) {
        // If auth fails, continue as guest
        req.user = null;
      }
      next();
    });
  } else {
    req.user = null;
    next();
  }
}, placeOrder);

// User orders (require authentication)
orderRouter.get('/', protect, getUserOrders);

// Create order by admin/seller
orderRouter.post('/create', protect, authorizeRoles('admin', 'seller'), createOrder);

// Admin routes
orderRouter.get('/all', protect, authorizeRoles('admin', 'seller'), getAllOrders);

// Individual order operations
orderRouter.route('/:id')
  .get(protect, authorizeRoles('admin', 'seller'), getOrderById)
  .put(protect, authorizeRoles('admin', 'seller'), updateOrder)
  .delete(protect, authorizeRoles('admin'), deleteOrder);

orderRouter.put('/:id/status', protect, authorizeRoles('admin', 'seller'), updateOrderStatus);
orderRouter.put('/:id/confirm-payment', protect, authorizeRoles('admin'), confirmOrderPayment);

export default orderRouter;
