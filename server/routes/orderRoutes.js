
// Cart and Order Routes
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

// Cart routes - now support guest users
orderRouter.route('/cart')
  .get(getCart) // Remove protect to allow guest access
  .post(addToCart) // Remove protect to allow guest access
  .delete(removeFromCart); // Remove protect to allow guest access

orderRouter.route('/')
  .post(protect, placeOrder)
  .get(protect, getUserOrders);

orderRouter.route('/all')
  .get(protect, authorizeRoles('admin','seller'), getAllOrders);

orderRouter.route('/:id/status')
  .put(protect, authorizeRoles('admin','seller'), updateOrderStatus);

// New route for admin to confirm payment
orderRouter.route('/:id/confirm-payment')
  .put(protect, authorizeRoles('admin','seller'), confirmOrderPayment);

export default orderRouter;
