// Cart and Order Routes
import express from 'express';
import {
  addToCart,
  removeFromCart,
  getCart,
  placeOrder,
  getUserOrders,
  getAllOrders,
  updateOrderStatus
} from '../controllers/orderController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const orderRouter = express.Router();
orderRouter.route('/cart')
  .get(protect, getCart)
  .post(protect, addToCart)
  .delete(protect, removeFromCart);
orderRouter.route('/')
  .post(protect, placeOrder)
  .get(protect, getUserOrders);
orderRouter.route('/all')
  .get(protect, authorizeRoles('admin','seller'), getAllOrders);
orderRouter.route('/:id/status')
  .put(protect, authorizeRoles('admin','seller'), updateOrderStatus);
export default orderRouter;