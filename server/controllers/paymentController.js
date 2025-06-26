
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: 'byiringirourban20@gmail.com',
    pass: 'zljw hslg rxpb mqpu',
  },
});

// Generate MoMo payment code (STATIC CODE AS REQUESTED)
export const generateMoMoPaymentCode = asyncHandler(async (req, res) => {
  const { orderId } = req.params;
  const userId = req.user?.id;

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
    if (order.userId && userId && order.userId !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Return STATIC MoMo code as requested: 078374886
    const paymentCode = '078374886';

    console.log('✅ MoMo payment code generated (STATIC):', paymentCode);

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
=======
// Generate MoMo Payment Code - now supports guest users
export const generateMoMoPaymentCode = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { user: true }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization - allow if user owns order OR if it's a guest order
  if (req.user && order.userId && order.userId !== req.user.id) {
    res.status(403);
    throw new Error('Unauthorized');
  }

  const paymentCode = generatePaymentCode();
  const updated = await prisma.order.update({
    where: { id: orderId },
    data: { paymentCode },
  });

  // Notify admin about generated payment code
  await notify({
    userId: req.user?.id || null,
    message: `Payment code generated for Order ID ${orderId}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: orderId,
  });

  res.json({ message: 'Payment code generated', paymentCode: updated.paymentCode });
});

// Confirm Client Payment - now supports guest users
export const confirmClientPayment = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { user: true }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Check authorization - allow if user owns order OR if it's a guest order
  if (req.user && order.userId && order.userId !== req.user.id) {
    res.status(403);
    throw new Error('Unauthorized');
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
    userId: req.user?.id || null,
    message: `Client confirmed payment for Order ID ${orderId}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: orderId,
  });

  res.json({ message: 'Payment marked as completed. Awaiting admin confirmation.' });
});

// Admin Confirms Payment - Enhanced with email notification
export const confirmPaymentByAdmin = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.orderId);
  const order = await prisma.order.findUnique({ 
    where: { id: orderId },
    include: { user: true }
  });

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

  // Send confirmation email
  const customerEmail = order.user?.email || order.guestEmail;
  const customerName = order.user?.name || (order.guestInfo ? `${order.guestInfo.firstName} ${order.guestInfo.lastName}` : 'Customer');

  if (customerEmail) {
    try {
      await transporter.sendMail({
        from: 'byiringirourban20@gmail.com',
        to: customerEmail,
        subject: 'Order Confirmation - Payment Received',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Order Confirmed!</h2>
            <p>Dear ${customerName},</p>
            <p>Your order #${orderId} has been confirmed! Thank you for shopping with us.</p>
            <p>Your payment has been received and your order is now being processed.</p>
            <p>Thank you for your business!</p>
            <hr style="margin: 20px 0;">
            <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply.</p>
          </div>
        `,
      });
      console.log('✅ Confirmation email sent to:', customerEmail);
    } catch (error) {
      console.error('❌ Failed to send confirmation email:', error);
    }
  }

  // Notify buyer that admin confirmed payment
  if (order.userId) {
    await notify({
      userId: order.userId,
      message: `Admin confirmed your payment for Order ID ${orderId}.`,
      recipientRole: 'BUYER',
      relatedOrderId: orderId,
    });
  }

  res.json({ message: 'Payment confirmed by admin and email sent' });
});
