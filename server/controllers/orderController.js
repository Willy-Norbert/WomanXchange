
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// Add or Update Product in Cart (supports guest users)
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart;
  
  // Check if user is logged in
  if (req.user) {
    // Logged in user
    const userId = req.user.id;
    cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
  } else {
    // Guest user - use session or create temporary cart
    const guestId = req.body.guestId || `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    cart = await prisma.cart.findFirst({ where: { guestId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { guestId } });
    }
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId }
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity }
    });
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity }
    });
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } }
  });

  res.json({ ...updatedCart, guestId: cart.guestId });
});

// Remove Product from Cart (supports guest users)
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, guestId } = req.body;

  let cart;
  if (req.user) {
    const userId = req.user.id;
    cart = await prisma.cart.findUnique({ where: { userId } });
  } else if (guestId) {
    cart = await prisma.cart.findFirst({ where: { guestId } });
  }

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId }
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } }
  });

  res.json(updatedCart);
});

// Get User Cart (supports guest users)
export const getCart = asyncHandler(async (req, res) => {
  const { guestId } = req.query;
  
  let cart;
  if (req.user) {
    const userId = req.user.id;
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });
  } else if (guestId) {
    cart = await prisma.cart.findFirst({
      where: { guestId },
      include: { items: { include: { product: true } } }
    });
  }

  res.json(cart || { items: [] });
});

// Place an Order (from Cart)
export const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod } = req.body;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  });

  if (!cart || cart.items.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  const orderItemsData = cart.items.map(item => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.product.price,
  }));

  const totalPrice = orderItemsData.reduce(
    (acc, item) => acc + item.price * item.quantity, 0
  );

  const order = await prisma.order.create({
    data: {
      userId,
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: false,
      items: {
        create: orderItemsData
      }
    },
    include: {
      items: true,
    }
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  // Notify admin of new order
  await notify({
    userId,
    message: `New order placed by user ${req.user.name}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: order.id,
  });

  res.status(201).json(order);
});

// Get User Orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } }
    }
  });

  res.json(orders);
});

// Admin: Get All Orders
export const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
  res.json(orders);
});

// Admin: Confirm Order Payment
export const confirmOrderPayment = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.id);

  const order = await prisma.order.findUnique({ where: { id: orderId } });
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
  });

  // Notify buyer that admin confirmed payment
  await notify({
    userId: order.userId,
    message: `Your payment for Order #${order.id} has been confirmed by admin.`,
    recipientRole: 'BUYER',
    relatedOrderId: order.id,
  });

  res.json(updatedOrder);
});

// Admin: Update Order Status (paid, delivered)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const orderId = Number(req.params.id);
  const { isPaid, isDelivered } = req.body;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const dataToUpdate = {};
  if (typeof isPaid === 'boolean') {
    dataToUpdate.isPaid = isPaid;
    if (isPaid) dataToUpdate.paidAt = new Date();
  }
  if (typeof isDelivered === 'boolean') {
    dataToUpdate.isDelivered = isDelivered;
    if (isDelivered) dataToUpdate.deliveredAt = new Date();
  }

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: dataToUpdate,
  });

  // Notify buyer that order status was updated
  await notify({
    userId: order.userId,
    message: `Order #${order.id} status updated by admin.`,
    recipientRole: 'BUYER',
    relatedOrderId: order.id,
  });

  res.json(updatedOrder);
});
