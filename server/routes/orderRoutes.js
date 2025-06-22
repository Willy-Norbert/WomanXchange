
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

// Cart routes - no authentication required for cart operations
orderRouter.route('/cart')
  .get(getCart)
  .post(addToCart)
  .delete(removeFromCart);

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
