
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';
import { notify } from '../utils/notify.js';

// Submit seller request
export const submitSellerRequest = asyncHandler(async (req, res) => {
  const { name, email, password, phone, businessName, gender } = req.body;

  // Check if user already exists
  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Create seller with inactive status
  const seller = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'SELLER',
      phone,
      businessName,
      gender,
      sellerStatus: 'INACTIVE',
      isActive: false,
    }
  });

  // Notify admins about new seller request
  await notify({
    userId: null,
    message: `New seller request from ${seller.name} (${seller.businessName})`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.status(201).json({
    message: 'Seller request submitted successfully. Please wait for admin approval.',
    sellerId: seller.id
  });
});

// Get pending sellers (Admin only)
export const getPendingSellers = asyncHandler(async (req, res) => {
  const sellers = await prisma.user.findMany({
    where: { 
      role: 'SELLER'
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      businessName: true,
      gender: true,
      sellerStatus: true,
      isActive: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.json(sellers);
});

// Update seller status (Admin only)
export const updateSellerStatus = asyncHandler(async (req, res) => {
  const { sellerId } = req.params;
  const { status, isActive } = req.body;

  const seller = await prisma.user.findUnique({
    where: { id: parseInt(sellerId) },
    select: { id: true, role: true, name: true, businessName: true }
  });

  if (!seller || seller.role !== 'SELLER') {
    res.status(404);
    throw new Error('Seller not found');
  }

  // Update seller status
  const updatedSeller = await prisma.user.update({
    where: { id: parseInt(sellerId) },
    data: {
      sellerStatus: status,
      isActive: isActive
    }
  });

  // Update product visibility based on seller status
  await prisma.product.updateMany({
    where: { createdById: parseInt(sellerId) },
    data: { isVisible: isActive }
  });

  // Notify seller about status change
  await notify({
    userId: parseInt(sellerId),
    message: `Your seller account has been ${isActive ? 'approved and activated' : 'suspended'}`,
    recipientRole: 'SELLER',
    relatedOrderId: null,
  });

  res.json({
    message: `Seller ${isActive ? 'activated' : 'deactivated'} successfully`,
    seller: updatedSeller
  });
});

// Get seller's own products ONLY
export const getSellerProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  console.log('🔍 Getting products for seller:', sellerId);

  const products = await prisma.product.findMany({
    where: { 
      createdById: sellerId // ONLY seller's own products
    },
    include: { 
      category: true,
      _count: {
        select: {
          orderItems: {
            where: {
              order: {
                isPaid: true // Only count paid orders
              }
            }
          },
          reviews: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('📦 Seller products found:', products.length);
  res.json(products);
});

// Get seller's customers ONLY (users who bought their products)
export const getSellerCustomers = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  console.log('👥 Getting customers for seller:', sellerId);

  const customers = await prisma.user.findMany({
    where: {
      orders: {
        some: {
          items: {
            some: {
              product: {
                createdById: sellerId // ONLY customers who bought seller's products
              }
            }
          }
        }
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      _count: {
        select: {
          orders: {
            where: {
              items: {
                some: {
                  product: {
                    createdById: sellerId // ONLY orders containing seller's products
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('👥 Seller customers found:', customers.length);
  res.json(customers);
});

// Get seller's orders ONLY (orders containing their products)
export const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  console.log('📋 Getting orders for seller:', sellerId);

  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            createdById: sellerId // ONLY orders containing seller's products
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
            createdById: sellerId // ONLY items that are seller's products
          }
        },
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('📋 Seller orders found:', orders.length);
  res.json(orders);
});

// Get seller dashboard stats ONLY for their data
export const getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  console.log('📊 Getting stats for seller:', sellerId);

  // Get total products created by seller ONLY
  const totalProducts = await prisma.product.count({
    where: { createdById: sellerId }
  });

  // Get total orders containing seller's products ONLY
  const totalOrders = await prisma.order.count({
    where: {
      items: {
        some: {
          product: {
            createdById: sellerId
          }
        }
      }
    }
  });

  // Get total revenue from seller's products ONLY (paid orders)
  const revenueData = await prisma.orderItem.aggregate({
    where: {
      product: {
        createdById: sellerId
      },
      order: {
        isPaid: true
      }
    },
    _sum: {
      price: true
    }
  });

  // Get paid revenue separately for better tracking
  const paidRevenueData = await prisma.orderItem.aggregate({
    where: {
      product: {
        createdById: sellerId
      },
      order: {
        isPaid: true
      }
    },
    _sum: {
      price: true
    }
  });

  // Get total customers who bought from seller ONLY
  const uniqueCustomers = await prisma.user.count({
    where: {
      orders: {
        some: {
          items: {
            some: {
              product: {
                createdById: sellerId
              }
            }
          }
        }
      }
    }
  });

  const stats = {
    totalProducts,
    totalOrders,
    totalRevenue: revenueData._sum.price || 0,
    paidRevenue: paidRevenueData._sum.price || 0,
    totalCustomers: uniqueCustomers
  };

  console.log('📊 Seller stats (ONLY their data):', stats);
  res.json(stats);
});
