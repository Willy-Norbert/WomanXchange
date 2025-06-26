
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

// Update Order Status (Admin/Seller)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { isPaid, isDelivered } = req.body;

  console.log('Updating order status:', orderId, { isPaid, isDelivered });

  let whereClause = { id: orderId };
  
  // If seller, only update orders for their products
  if (req.user.role.toLowerCase() === 'seller') {
    whereClause = {
      id: orderId,
      items: {
        some: {
          product: {
            createdById: req.user.id
          }
        }
      }
    };
  }

  const order = await prisma.order.findFirst({
    where: whereClause,
    include: { user: true }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }

  const updateData = {};
  if (typeof isPaid === 'boolean') {
    updateData.isPaid = isPaid;
    if (isPaid) updateData.paidAt = new Date();
  }
  if (typeof isDelivered === 'boolean') {
    updateData.isDelivered = isDelivered;
    if (isDelivered) updateData.deliveredAt = new Date();
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } }
    }
  });

  console.log('Order status updated successfully');

  // Notify user of status change
  await notify({
    userId: req.user.id,
    message: `Order #${orderId} status updated.`,
    recipientRole: 'BUYER',
    relatedOrderId: orderId,
  });

  res.json(updatedOrder);
});

// Confirm Order Payment (Admin)
export const confirmOrderPayment = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);

  console.log('Confirming payment for order:', orderId);

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { user: true }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: {
      isPaid: true,
      paidAt: new Date(),
      isConfirmedByAdmin: true,
      confirmedAt: new Date()
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } }
    }
  });

  console.log('Payment confirmed successfully');

  // Clear user's cart after payment confirmation
  const userCart = await prisma.cart.findUnique({ where: { userId: order.userId } });
  if (userCart) {
    await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
  }

  // Notify user of payment confirmation
  await notify({
    userId: req.user.id,
    message: `Your payment for Order #${orderId} has been confirmed by admin.`,
    recipientRole: 'BUYER',
    relatedOrderId: orderId,
  });

  res.json(updatedOrder);
});
