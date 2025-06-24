
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

// Create order by admin/seller
orderRouter.post('/create', protect, authorizeRoles('admin', 'seller'), createOrder);

// Admin routes
orderRouter.get('/all', protect, authorizeRoles('admin', 'seller'), getAllOrders);
orderRouter.route('/:id')
  .put(protect, authorizeRoles('admin', 'seller'), updateOrder)
  .delete(protect, authorizeRoles('admin'), deleteOrder);

orderRouter.put('/:id/status', protect, authorizeRoles('admin', 'seller'), updateOrderStatus);
orderRouter.put('/:id/confirm-payment', protect, authorizeRoles('admin'), confirmOrderPayment);

export default orderRouter;
