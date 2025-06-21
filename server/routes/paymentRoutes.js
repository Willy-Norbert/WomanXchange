// Payment Routes
import express from 'express';
import {
  generateMoMoPaymentCode,
  confirmClientPayment,
  confirmPaymentByAdmin
} from '../controllers/paymentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const paymentRouter = express.Router();
paymentRouter.post('/:orderId/generate-code', protect, generateMoMoPaymentCode);
paymentRouter.post('/:orderId/confirm-client', protect, confirmClientPayment);
paymentRouter.post('/:orderId/confirm-admin', protect, authorizeRoles('admin'), confirmPaymentByAdmin);
export default paymentRouter;