import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';
import nodemailer from 'nodemailer';

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'byiringirourban20@gmail.com',
    pass: 'zljw hslg rxpb mqpu'
  }
});

// Send order confirmation email
const sendOrderConfirmationEmail = async (email, orderData) => {
  try {
    const mailOptions = {
      from: 'byiringirourban20@gmail.com',
      to: email,
      subject: `Order Confirmation #${orderData.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Order Confirmation</h2>
          <p>Thank you for your order! Here are the details:</p>
          
          <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order #${orderData.id}</h3>
            <p><strong>Total Amount:</strong> ${orderData.totalPrice.toLocaleString()} Rwf</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod}</p>
            <p><strong>Shipping Address:</strong> ${orderData.shippingAddress}</p>
            <p><strong>Order Date:</strong> ${new Date(orderData.createdAt).toLocaleDateString()}</p>
          </div>

          <div style="margin: 20px 0;">
            <h3>Order Items:</h3>
            ${orderData.items.map(item => `
              <div style="border-bottom: 1px solid #e5e7eb; padding: 10px 0;">
                <p><strong>${item.product.name}</strong></p>
                <p>Quantity: ${item.quantity} | Price: ${item.price.toLocaleString()} Rwf</p>
              </div>
            `).join('')}
          </div>

          ${orderData.paymentMethod === 'MTN' ? `
            <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #d97706;">MTN MoMo Payment</h3>
              <p><strong>Payment Code:</strong> 078374886</p>
              <p>Please use this code to complete your payment via MTN MoMo.</p>
            </div>
          ` : ''}

          <p>Thank you for shopping with us!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Order confirmation email sent to:', email);
  } catch (error) {
    console.error('❌ Error sending email:', error);
  }
};

// Get or create cart for user
export const getCart = asyncHandler(async (req, res) => {
  const { cartId } = req.query;
  const userId = req.user?.id;
  
  console.log('🛒 getCart called - userId:', userId, 'cartId:', cartId);

  try {
    let cart;

    if (userId) {
      // For authenticated users
      cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  coverImage: true
                }
              }
            }
          }
        }
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId },
          include: {
            items: {
              include: {
                product: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    coverImage: true
                  }
                }
              }
            }
          }
        });
        console.log('🆕 Created new cart for user:', userId);
      }
    } else if (cartId) {
      // For anonymous users with existing cart
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
                  coverImage: true
                }
              }
            }
          }
        }
      });
    }

    if (!cart) {
      // Create anonymous cart
      cart = await prisma.cart.create({
        data: { userId: null },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  coverImage: true
                }
              }
            }
          }
        }
      });
      console.log('🆕 Created new anonymous cart:', cart.id);
    }

    console.log('📦 Returning cart with items:', cart.items.length);
    res.json({ data: cart });
  } catch (error) {
    console.error('❌ Error getting cart:', error);
    res.status(500).json({ message: 'Failed to get cart' });
  }
});

// Add item to cart
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1, cartId } = req.body;
  const userId = req.user?.id;
  
  console.log('➕ addToCart called:', { userId, productId, quantity, cartId });

  try {
    let cart;

    if (userId) {
      // For authenticated users
      cart = await prisma.cart.findFirst({
        where: { userId }
      });

      if (!cart) {
        cart = await prisma.cart.create({
          data: { userId }
        });
      }
    } else if (cartId) {
      // For anonymous users with existing cart
      cart = await prisma.cart.findUnique({
        where: { id: parseInt(cartId) }
      });
    }

    if (!cart) {
      // Create new anonymous cart
      cart = await prisma.cart.create({
        data: { userId: null }
      });
    }

    // Check if item already exists in cart
    const existingItem = await prisma.cartItem.findFirst({
      where: {
        cartId: cart.id,
        productId: parseInt(productId)
      }
    });

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + parseInt(quantity) }
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: parseInt(quantity)
        }
      });
    }

    console.log('✅ Item added to cart:', cart.id);
    res.json({ 
      message: 'Item added to cart',
      cartId: cart.id
    });
  } catch (error) {
    console.error('❌ Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add item to cart' });
  }
});

// Remove item from cart
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, cartId } = req.body;
  const userId = req.user?.id;
  
  console.log('➖ removeFromCart called:', { userId, productId, cartId });

  try {
    let cart;

    if (userId) {
      cart = await prisma.cart.findFirst({
        where: { userId }
      });
    } else if (cartId) {
      cart = await prisma.cart.findUnique({
        where: { id: parseInt(cartId) }
      });
    }

    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    await prisma.cartItem.deleteMany({
      where: {
        cartId: cart.id,
        productId: parseInt(productId)
      }
    });

    console.log('✅ Item removed from cart');
    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('❌ Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove item from cart' });
  }
});

// Place order (works for both authenticated and anonymous users)
export const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, customerEmail, customerName } = req.body;
  const userId = req.user?.id;
  
  console.log('📝 placeOrder called:', { userId, shippingAddress, paymentMethod, customerEmail });

  try {
    let cart;

    if (userId) {
      cart = await prisma.cart.findFirst({
        where: { userId },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
    } else {
      // For anonymous users, get cart from session/localStorage
      const { cartId } = req.body;
      if (cartId) {
        cart = await prisma.cart.findUnique({
          where: { id: parseInt(cartId) },
          include: {
            items: {
              include: {
                product: true
              }
            }
          }
        });
      }
    }

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Calculate total price
    const totalPrice = cart.items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: userId || null,
        shippingAddress,
        paymentMethod,
        totalPrice,
        isPaid: false,
        isDelivered: false,
        customerEmail: customerEmail || req.user?.email,
        customerName: customerName || req.user?.name,
        items: {
          create: cart.items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price
          }))
        }
      },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true
      }
    });

    // Clear cart after order
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id }
    });

    // Send confirmation email
    const emailAddress = customerEmail || req.user?.email;
    if (emailAddress) {
      await sendOrderConfirmationEmail(emailAddress, order);
    }

    // Notify admin
    await notify({
      userId: null,
      message: `New order #${order.id} placed by ${order.customerName || 'Anonymous'}`,
      recipientRole: 'ADMIN',
      relatedOrderId: order.id,
    });

    console.log('✅ Order placed successfully:', order.id);
    res.status(201).json(order);
  } catch (error) {
    console.error('❌ Error placing order:', error);
    res.status(500).json({ message: 'Failed to place order' });
  }
});

export const createOrder = asyncHandler(async (req, res) => {
  const { userId, shippingAddress, paymentMethod, items, totalPrice } = req.body;
  
  const order = await prisma.order.create({
    data: {
      userId: parseInt(userId),
      shippingAddress,
      paymentMethod,
      totalPrice: parseFloat(totalPrice),
      isPaid: false,
      isDelivered: false,
      items: {
        create: items.map(item => ({
          productId: parseInt(item.productId),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price)
        }))
      }
    },
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true
    }
  });

  await notify({
    userId: parseInt(userId),
    message: `Order #${order.id} has been created by admin`,
    recipientRole: 'BUYER',
    relatedOrderId: order.id,
  });

  res.status(201).json(order);
});

export const getUserOrders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  res.json(orders);
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const userRole = req.user.role.toLowerCase();
  const userId = req.user.id;
  
  console.log('🔍 getAllOrders - Role:', userRole, 'UserId:', userId);
  
  try {
    let orders;
    
    if (userRole === 'admin') {
      // Admin sees all orders
      orders = await prisma.order.findMany({
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          items: {
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else if (userRole === 'seller') {
      // Seller sees only orders containing their products
      orders = await prisma.order.findMany({
        where: {
          items: {
            some: {
              product: {
                createdById: userId
              }
            }
          }
        },
        include: {
          user: {
            select: { id: true, name: true, email: true }
          },
          items: {
            where: {
              product: {
                createdById: userId
              }
            },
            include: {
              product: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    console.log('📋 Orders found:', orders.length);
    res.json(orders);
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
});

export const getOrderById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const userRole = req.user.role.toLowerCase();
  const userId = req.user.id;
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }
  
  try {
    let whereClause = { id };
    
    // If seller, only show orders containing their products
    if (userRole === 'seller') {
      whereClause = {
        id,
        items: {
          some: {
            product: {
              createdById: userId
            }
          }
        }
      };
    }
    
    const order = await prisma.order.findFirst({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          ...(userRole === 'seller' && {
            where: {
              product: {
                createdById: userId
              }
            }
          }),
          include: {
            product: true
          }
        }
      }
    });

    if (!order) {
      res.status(404);
      throw new Error('Order not found');
    }

    res.json({ data: order });
  } catch (error) {
    console.error('Error fetching order by ID:', error);
    res.status(500);
    throw new Error('Failed to fetch order');
  }
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { isPaid, isDelivered } = req.body;
  const userRole = req.user.role.toLowerCase();
  const userId = req.user.id;
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }
  
  try {
    // Check if seller has access to this order
    if (userRole === 'seller') {
      const orderCheck = await prisma.order.findFirst({
        where: {
          id,
          items: {
            some: {
              product: {
                createdById: userId
              }
            }
          }
        }
      });
      
      if (!orderCheck) {
        res.status(403);
        throw new Error('Access denied to this order');
      }
    }
    
    const updateData = {};
    if (typeof isPaid === 'boolean') {
      updateData.isPaid = isPaid;
      updateData.paidAt = isPaid ? new Date() : null;
    }
    if (typeof isDelivered === 'boolean') {
      updateData.isDelivered = isDelivered;
      updateData.deliveredAt = isDelivered ? new Date() : null;
    }
    
    const order = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        },
        items: {
          include: {
            product: true
          }
        }
      }
    });

    await notify({
      userId: order.userId,
      message: `Order #${order.id} status updated`,
      recipientRole: 'BUYER',
      relatedOrderId: order.id,
    });

    res.json(order);
  } catch (error) {
    console.error('Error updating order status:', error);
    res.status(500);
    throw new Error('Failed to update order status');
  }
});

export const updateOrder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const updates = req.body;
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }
  
  const order = await prisma.order.update({
    where: { id },
    data: updates,
    include: {
      items: {
        include: {
          product: true
        }
      },
      user: true
    }
  });
  
  res.json(order);
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }
  
  await prisma.orderItem.deleteMany({ where: { orderId: id } });
  await prisma.order.delete({ where: { id } });
  
  res.json({ message: 'Order deleted successfully' });
});

export const confirmOrderPayment = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  
  if (isNaN(id)) {
    res.status(400);
    throw new Error('Invalid order ID');
  }
  
  const order = await prisma.order.update({
    where: { id },
    data: {
      isPaid: true,
      paidAt: new Date(),
      isConfirmedByAdmin: true,
      confirmedAt: new Date()
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      items: {
        include: {
          product: true
        }
      }
    }
  });

  await notify({
    userId: order.userId,
    message: `Payment confirmed for order #${order.id}`,
    recipientRole: 'BUYER',
    relatedOrderId: order.id,
  });

  res.json(order);
});
