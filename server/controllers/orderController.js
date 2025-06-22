import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

// Add or Update Product in Cart (no authentication required)
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  console.log('addToCart called with:', { productId, quantity, hasUser: !!req.user });
  
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
    console.log('Handling authenticated user cart for userId:', userId);
    cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
  } else {
    // No authentication required - create temporary cart
    console.log('Creating temporary cart for unauthenticated user');
    cart = await prisma.cart.create({ data: {} });
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId }
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    });
    console.log('Updated existing cart item quantity');
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity }
    });
    console.log('Created new cart item');
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { items: { include: { product: true } } }
  });

  console.log('Returning updated cart:', updatedCart);
  res.json({ data: updatedCart });
});

// Remove Product from Cart (no authentication required)
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  let cart;
  if (req.user) {
    const userId = req.user.id;
    cart = await prisma.cart.findUnique({ where: { userId } });
  } else {
    // For unauthenticated users, we'll need to find the most recent cart
    // This is a simplified approach - in production you might want session management
    cart = await prisma.cart.findFirst({
      where: { userId: null },
      orderBy: { updatedAt: 'desc' }
    });
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

  res.json({ data: updatedCart });
});

// Get User Cart (no authentication required)
export const getCart = asyncHandler(async (req, res) => {
  console.log('getCart called with hasUser:', !!req.user);
  
  let cart;
  if (req.user) {
    const userId = req.user.id;
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });
  } else {
    // For unauthenticated users, return the most recent cart or empty cart
    cart = await prisma.cart.findFirst({
      where: { userId: null },
      include: { items: { include: { product: true } } },
      orderBy: { updatedAt: 'desc' }
    });
  }

  console.log('Returning cart:', cart);
  res.json({ data: cart || { items: [] } });
});

// Place an Order (from Cart) - requires authentication
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
    },
    orderBy: { createdAt: 'desc' }
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

  await notify({
    userId: order.userId,
    message: `Order #${order.id} status updated by admin.`,
    recipientRole: 'BUYER',
    relatedOrderId: order.id,
  });

  res.json(updatedOrder);
});
