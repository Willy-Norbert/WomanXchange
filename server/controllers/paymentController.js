
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

// Generate MoMo payment code (now returns static code)
export const generateMoMoPaymentCode = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user.id;

  console.log('💳 Generating MoMo code for order:', orderId, 'user:', userId);

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order or if it's an anonymous order
    if (order.userId && order.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Return static MoMo code as requested
    const paymentCode = '078374886';

    console.log('✅ MoMo payment code generated:', paymentCode);

    res.json({
      message: 'MoMo payment code generated successfully',
      paymentCode: paymentCode,
      orderId: order.id,
      totalAmount: order.totalPrice
    });
  } catch (error) {
    console.error('❌ Error generating MoMo code:', error);
    res.status(500).json({ message: 'Failed to generate payment code' });
  }
});

// Client confirms payment (user says they've paid)
export const confirmClientPayment = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user?.id;

  console.log('✅ Client confirming payment for order:', orderId);

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: true
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns this order (for authenticated users)
    if (order.userId && userId && order.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Update order to show client has confirmed payment
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        clientConfirmedPayment: true,
        clientConfirmedAt: new Date()
      }
    });

    // Notify admin about payment confirmation
    await notify({
      userId: null,
      message: `Payment confirmation submitted for order #${orderId}. Please verify and confirm.`,
      recipientRole: 'ADMIN',
      relatedOrderId: parseInt(orderId),
    });

    console.log('✅ Client payment confirmation recorded');

    res.json({
      message: 'Payment confirmation submitted. Admin will verify and confirm your payment.',
      order: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error confirming client payment:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});

// Admin confirms payment (final confirmation)
export const confirmPaymentByAdmin = asyncHandler(async (req, res) => {
  const { orderId } = req.params;

  console.log('🔐 Admin confirming payment for order:', orderId);

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(orderId) },
      include: {
        user: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Admin confirms the payment
    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(orderId) },
      data: {
        isPaid: true,
        paidAt: new Date(),
        isConfirmedByAdmin: true,
        confirmedAt: new Date()
      }
    });

    // Notify customer about payment confirmation
    if (order.userId) {
      await notify({
        userId: order.userId,
        message: `Your payment for order #${orderId} has been confirmed. Your order is being processed.`,
        recipientRole: 'BUYER',
        relatedOrderId: parseInt(orderId),
      });
    }

    console.log('✅ Admin payment confirmation completed');

    res.json({
      message: 'Payment confirmed successfully by admin',
      order: updatedOrder
    });
  } catch (error) {
    console.error('❌ Error confirming payment by admin:', error);
    res.status(500).json({ message: 'Failed to confirm payment' });
  }
});
