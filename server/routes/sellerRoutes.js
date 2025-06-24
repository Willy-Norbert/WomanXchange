
import express from 'express';
import {
  submitSellerRequest,
  getPendingSellers,
  updateSellerStatus,
  getSellerProducts,
  getSellerCustomers,
  getSellerOrders,
  getSellerStats
} from '../controllers/sellerController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get seller statistics
const getSellerStats = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  console.log('Getting seller stats for:', sellerId);
  
  // Get seller's products
  const products = await prisma.product.findMany({
    where: { createdById: sellerId }
  });
  
  // Get orders for seller's products
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            createdById: sellerId
          }
        }
      }
    },
    include: {
      items: {
        where: {
          product: {
            createdById: sellerId
          }
        },
        include: {
          product: true
        }
      }
    }
  });
  
  const totalRevenue = orders.reduce((sum, order) => {
    const sellerItems = order.items.filter(item => item.product.createdById === sellerId);
    return sum + sellerItems.reduce((itemSum, item) => itemSum + (item.price * item.quantity), 0);
  }, 0);
  
  // Get unique customers who bought from this seller
  const customers = await prisma.user.findMany({
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
    },
    select: { id: true, name: true, email: true }
  });
  
  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    totalRevenue,
    totalCustomers: customers.length
  };
  
  console.log('Seller stats:', stats);
  res.json(stats);
});

// Get seller's orders
const getSellerOrders = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  console.log('Getting orders for seller:', sellerId);
  
  const orders = await prisma.order.findMany({
    where: {
      items: {
        some: {
          product: {
            createdById: sellerId
          }
        }
      }
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        where: {
          product: {
            createdById: sellerId
          }
        },
        include: {
          product: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('Seller orders found:', orders.length);
  res.json(orders);
});

// Get seller's products
const getSellerProducts = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  console.log('Getting products for seller:', sellerId);
  
  const products = await prisma.product.findMany({
    where: { createdById: sellerId },
    include: {
      category: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          businessName: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('Seller products found:', products.length);
  res.json(products);
});

// Get seller's customers
const getSellerCustomers = asyncHandler(async (req, res) => {
  const sellerId = req.user.id;
  
  console.log('Getting customers for seller:', sellerId);
  
  const customers = await prisma.user.findMany({
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
    },
    select: { id: true, name: true, email: true, createdAt: true }
  });
  
  console.log('Seller customers found:', customers.length);
  res.json(customers);
});

// Routes
sellerRouter.get('/my-stats', protect, authorizeRoles('seller'), getSellerStats);
sellerRouter.get('/my-orders', protect, authorizeRoles('seller'), getSellerOrders);
sellerRouter.get('/my-products', protect, authorizeRoles('seller'), getSellerProducts);
sellerRouter.get('/my-customers', protect, authorizeRoles('seller'), getSellerCustomers);

export default router;