import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

// Get Order by ID (Admin/Seller)
export const getOrderById = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);

  console.log('Getting order by ID:', orderId, 'for user role:', req.user?.role);

  let whereClause = { id: orderId };
  
  // If seller, only get orders for their products
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
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { 
        include: { 
          product: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  businessName: true
                }
              }
            }
          }
        } 
      }
    }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  console.log('Order found:', order.id);
  res.json(order);
});

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
    // Logged in user - find or create user cart
    const userId = req.user.id;
    console.log('Handling authenticated user cart for userId:', userId);
    cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
    }
  } else {
    // Unauthenticated user - create anonymous cart
    console.log('Creating anonymous cart for unauthenticated user');
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
    include: { 
      items: { 
        include: { 
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              coverImage: true,
              description: true,
              stock: true
            }
          }
        } 
      } 
    }
  });

  console.log('Returning updated cart with full product details');
  res.json({ data: updatedCart, cartId: cart.id });
});

// Remove Product from Cart (no authentication required)
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, cartId } = req.body;

  let cart;
  if (req.user) {
    // Authenticated user
    const userId = req.user.id;
    cart = await prisma.cart.findUnique({ where: { userId } });
  } else {
    // Unauthenticated user - use cartId from request
    if (!cartId) {
      res.status(400);
      throw new Error('Cart ID required for unauthenticated users');
    }
    cart = await prisma.cart.findUnique({ where: { id: cartId } });
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
    include: { 
      items: { 
        include: { 
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              coverImage: true,
              description: true,
              stock: true
            }
          }
        } 
      } 
    }
  });

  res.json({ data: updatedCart, cartId: cart.id });
});

// Get User Cart (no authentication required)
export const getCart = asyncHandler(async (req, res) => {
  const { cartId } = req.query;
  console.log('getCart called with hasUser:', !!req.user, 'cartId:', cartId);
  
  let cart;
  if (req.user) {
    // Authenticated user
    const userId = req.user.id;
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: { 
        items: { 
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                coverImage: true,
                description: true,
                stock: true
              }
            }
          } 
        } 
      }
    });
  } else {
    // Unauthenticated user
    if (cartId) {
      cart = await prisma.cart.findUnique({
        where: { id: parseInt(cartId) },
        include: { 
          items: { 
            include: { 
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  coverImage: true,
                  description: true,
                  stock: true
                }
              }
            } 
          } 
        }
      });
    }
  }

  console.log('Returning cart data');
  res.json({ data: cart || { items: [] }, cartId: cart?.id });
});

// Place an Order (from Cart) - requires authentication
export const placeOrder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { shippingAddress, paymentMethod } = req.body;

  console.log('Placing order for user:', userId);

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
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } }
    }
  });

  await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });

  console.log('Order created successfully:', order.id);

  await notify({
    userId,
    message: `New order placed by user ${req.user.name}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: order.id,
  });

  res.status(201).json(order);
});

// Create Order by Admin/Seller
export const createOrder = asyncHandler(async (req, res) => {
  const { userId, shippingAddress, paymentMethod, items, totalPrice } = req.body;

  console.log('Creating order for user:', userId, 'by:', req.user.role);

  // Validate user exists
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // If seller, validate they can only create orders with their products
  if (req.user.role.toLowerCase() === 'seller') {
    const productIds = items.map(item => item.productId);
    const products = await prisma.product.findMany({
      where: { 
        id: { in: productIds },
        createdById: req.user.id
      }
    });
    
    if (products.length !== productIds.length) {
      res.status(403);
      throw new Error('You can only create orders with your own products');
    }
  }

  const order = await prisma.order.create({
    data: {
      userId,
      shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: false,
      items: {
        create: items
      }
    },
    include: {
      items: { include: { product: true } },
      user: { select: { id: true, name: true, email: true } }
    }
  });

  console.log('Order created successfully by admin/seller:', order.id);

  await notify({
    userId: req.user.id,
    message: `Order #${order.id} created by ${req.user.role} for user ${user.name}.`,
    recipientRole: 'BUYER',
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

// Admin: Get All Orders
export const getAllOrders = asyncHandler(async (req, res) => {
  console.log('Getting all orders for admin/seller, user role:', req.user?.role);
  
  let whereClause = {};
  
  // If seller, only get orders for their products
  if (req.user.role.toLowerCase() === 'seller') {
    whereClause = {
      items: {
        some: {
          product: {
            createdById: req.user.id
          }
        }
      }
    };
  }
  
  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { 
        include: { 
          product: {
            include: {
              createdBy: {
                select: {
                  id: true,
                  name: true,
                  businessName: true
                }
              }
            }
          }
        } 
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('All orders found:', orders.length);
  res.json(orders);
});

// Update Order (Admin/Seller)
export const updateOrder = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);
  const { userId, shippingAddress, paymentMethod, items, totalPrice } = req.body;

  console.log('Updating order:', orderId);

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
    include: { user: true, items: true }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found or unauthorized');
  }

  // Update order details
  const updateData = {};
  if (userId) updateData.userId = userId;
  if (shippingAddress) updateData.shippingAddress = shippingAddress;
  if (paymentMethod) updateData.paymentMethod = paymentMethod;
  if (totalPrice) updateData.totalPrice = totalPrice;

  // Update order
  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: updateData,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: true } }
    }
  });
  // Clear user's cart after payment confirmation
  const userCart = await prisma.cart.findUnique({ where: { userId: order.userId } });
  if (userCart) {
    await prisma.cartItem.deleteMany({ where: { cartId: userCart.id } });
  }

  await notify({
    userId: order.userId,
    message: `Your payment for Order #${order.id} has been confirmed by admin.`,
    recipientRole: 'BUYER',
    relatedOrderId: order.id,
  });
  // Update items if provided
  if (items && items.length > 0) {
    // Delete existing items
    await prisma.orderItem.deleteMany({
      where: { orderId }
    });

    // Create new items
    await prisma.orderItem.createMany({
      data: items.map(item => ({
        orderId,
        productId: item.productId,
        quantity: item.quantity,
        price: item.price
      }))
    });
  }

  console.log('Order updated successfully');

  res.json(updatedOrder);
});

// Delete Order (Admin only)
export const deleteOrder = asyncHandler(async (req, res) => {
  const orderId = parseInt(req.params.id);

  console.log('Deleting order:', orderId);

  const order = await prisma.order.findUnique({
    where: { id: orderId }
  });

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Delete order items first
  await prisma.orderItem.deleteMany({
    where: { orderId }
  });

  // Delete order
  await prisma.order.delete({
    where: { id: orderId }
  });

  console.log('Order deleted successfully');
  res.json({ message: 'Order deleted successfully' });
});

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

  // Notify user of payment confirmation
  await notify({
    userId: req.user.id,
    message: `Payment confirmed for order #${orderId}.`,
    recipientRole: 'BUYER',
    relatedOrderId: orderId,
  });

  res.json(updatedOrder);
});
