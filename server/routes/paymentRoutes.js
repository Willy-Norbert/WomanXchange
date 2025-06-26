
// Payment Routes
import express from 'express';
import {
  generateMoMoPaymentCode,
  confirmClientPayment,
  confirmPaymentByAdmin
} from '../controllers/paymentController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const paymentRouter = express.Router();

// Allow guest users to generate payment codes (optional auth)
paymentRouter.post('/:orderId/generate-code', (req, res, next) => {
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
}, generateMoMoPaymentCode);

// Allow guest users to confirm payment (optional auth)
paymentRouter.post('/:orderId/confirm-client', (req, res, next) => {
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
}, confirmClientPayment);

paymentRouter.post('/:orderId/confirm-admin', protect, authorizeRoles('admin'), confirmPaymentByAdmin);

export default paymentRouter;
