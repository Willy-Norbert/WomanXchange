import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { generatePaymentCode } from '../utils/paymentUtils.js';
import { notify } from '../utils/notify.js';

// Generate MoMo Payment Code
export const generateMoMoPaymentCode = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order || order.userId !== req.user.id) {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }

  const paymentCode = generatePaymentCode();
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { paymentCode },
  });

  // Notify admin about generated payment code
  await notify({
    userId: req.user.id,
    message: `Payment code generated for Order ID ${orderId}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: orderId,
  });

  res.json({ message: 'Payment code generated', paymentCode: updated.paymentCode });
});

// Confirm Client Payment
export const confirmClientPayment = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order || order.userId !== req.user.id) {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }

  if (!order.paymentCode) {
    res.status(400);
    throw new Error('Payment code not generated');
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      isPaid: true,
      paidAt: new Date(),
    },
  });

  // Notify admin that client confirmed payment
  await notify({
    userId: req.user.id,
    message: `Client confirmed payment for Order ID ${orderId}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: orderId,
  });

  res.json({ message: 'Payment marked as completed. Awaiting admin confirmation.' });
});

// Admin Confirms Payment
export const confirmPaymentByAdmin = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await prisma.order.findUnique({ where: { id: orderId } });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      isConfirmedByAdmin: true,
      confirmedAt: new Date(),
    },
  });

  // Notify buyer that admin confirmed payment
  await notify({
    userId: order.userId,
    message: `Admin confirmed your payment for Order ID ${orderId}.`,
    recipientRole: 'BUYER',
    relatedOrderId: orderId,
  });

  res.json({ message: 'Payment confirmed by admin' });
});
