
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

// Cart routes (public access for guest users)
orderRouter.route('/cart')
  .get(getCart)
  .post(addToCart)
  .delete(removeFromCart);

// Order routes (require authentication)
orderRouter.route('/')
  .post(protect, placeOrder)
  .get(protect, getUserOrders);

// Admin routes
orderRouter.get('/all', protect, authorizeRoles('admin', 'seller'), getAllOrders);
orderRouter.put('/:id/status', protect, authorizeRoles('admin', 'seller'), updateOrderStatus);
orderRouter.put('/:id/confirm-payment', protect, authorizeRoles('admin'), confirmOrderPayment);

export default orderRouter;
