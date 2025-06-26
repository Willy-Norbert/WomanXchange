
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

// Helper function to generate unique order number
const generateOrderNumber = () => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `ORD-${timestamp}-${random}`;
};

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

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      userId,
      orderNumber,
      shippingAddress: typeof shippingAddress === 'string' ? { address: shippingAddress } : shippingAddress,
      paymentMethod,
      totalPrice,
      isPaid: false,
      items: {
        create: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: parseFloat(item.price.toString())
        }))
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

// Admin: Get All Orders - Enhanced to include guest orders
export const getAllOrders = asyncHandler(async (req, res) => {
  console.log('🔍 getAllOrders called - user role:', req.user?.role, 'user ID:', req.user?.id);
  
  let whereClause = {};
  
  // If seller, only get orders for their products
  if (req.user.role.toLowerCase() === 'seller') {
    console.log('🏪 Seller filtering orders for their products');
    whereClause = {
      items: {
        some: {
          product: {
            createdById: req.user.id
          }
        }
      }
    };
  } else {
    console.log('👑 Admin getting all orders (including guest orders)');
  }
  
  try {
    console.log('📊 Prisma query whereClause:', JSON.stringify(whereClause, null, 2));
    
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
    
    // Enhance orders with guest information for display
    const enhancedOrders = orders.map(order => ({
      ...order,
      displayCustomer: order.user ? {
        id: order.user.id,
        name: order.user.name,
        email: order.user.email
      } : order.guestInfo ? {
        id: null,
        name: `${order.guestInfo.firstName} ${order.guestInfo.lastName}`,
        email: order.guestInfo.email || order.guestEmail
      } : {
        id: null,
        name: 'Guest User',
        email: order.guestEmail || 'No email provided'
      }
    }));
    
    console.log('✅ Orders found:', enhancedOrders.length);
    console.log('📋 Order IDs:', enhancedOrders.map(o => o.id));
    
    res.json(enhancedOrders);
  } catch (error) {
    console.error('❌ Error in getAllOrders:', error);
    throw error;
  }
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
  if (shippingAddress) updateData.shippingAddress = typeof shippingAddress === 'string' ? { address: shippingAddress } : shippingAddress;
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
