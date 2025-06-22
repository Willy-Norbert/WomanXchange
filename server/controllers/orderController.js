
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';

// Add or Update Product in Cart
export const addToCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart = await prisma.cart.findUnique({ where: { userId } });
  if (!cart) {
    cart = await prisma.cart.create({ data: { userId } });
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

  // NO ADMIN NOTIFICATION FOR CART ADDITIONS - This was removed as requested

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } }
  });

  res.json(updatedCart);
});

// Remove Product from Cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { productId } = req.body;

  const cart = await prisma.cart.findUnique({ where: { userId } });
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

// Get User Cart
export const getCart = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  });

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
    }
  });
  res.json(orders);
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
