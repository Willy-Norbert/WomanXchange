
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

// Helper function to generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

// Place an Order (from Cart) - now supports both authenticated and guest users
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, guestInfo } = req.body;
  
  let userId = null;
  let cart = null;
  
  // Handle authenticated users
  if (req.user) {
    userId = req.user.id;
    console.log('Placing order for authenticated user:', userId);
    
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } }
    });
  } else {
    // Handle guest users
    console.log('Placing order for guest user with info:', guestInfo);
    
    if (!guestInfo || !guestInfo.email || !guestInfo.firstName || !guestInfo.lastName) {
      res.status(400);
      throw new Error('Guest information is required for guest checkout');
    }
    
    // For guest users, we need to find the most recent cart without a userId
    // or get cart from session/cookie if available
    const { cartId } = req.body;
    if (cartId) {
      cart = await prisma.cart.findUnique({
        where: { id: cartId },
        include: { items: { include: { product: true } } }
      });
    }
  }

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

  const orderNumber = generateOrderNumber();

  // Create order data
  const orderData = {
    orderNumber,
    shippingAddress: typeof shippingAddress === 'string' ? { address: shippingAddress } : shippingAddress,
    paymentMethod,
    totalPrice,
    isPaid: false,
    items: {
      create: orderItemsData
    }
  };

  // Add user ID for authenticated users or guest info for guest users
  if (userId) {
    orderData.userId = userId;
  } else {
    // Store guest information in the order
    orderData.guestInfo = guestInfo;
    orderData.guestEmail = guestInfo.email;
  }

  const order = await prisma.order.create({
    data: orderData,
    include: {
      items: { include: { product: true } },
      user: userId ? { select: { id: true, name: true, email: true } } : undefined
    }
  });

  // Clear the cart after order creation
  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  console.log('Order created successfully:', order.id, 'for', userId ? `user ${userId}` : `guest ${guestInfo.email}`);

  // Notify admin about new order
  await notify({
    userId: userId || null,
    message: `New order placed by ${userId ? req.user.name : `guest ${guestInfo.firstName} ${guestInfo.lastName}`}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: order.id,
  });

  res.status(201).json(order);
});

// Get User Orders
export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  console.log('Getting orders for user:', userId);

  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('User orders found:', orders.length);
  res.json(orders);
});
