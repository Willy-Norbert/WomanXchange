
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, categoryId, coverImage } = req.body;
  const productCoverImage = coverImage || 'https://aannet.org/global_graphics/default-store-350x350.jpg';
  
  console.log('Creating product for user:', req.user.id, 'Role:', req.user.role);
  
  // Check if seller is active (only for sellers, admins can create freely)
  if (req.user.role.toLowerCase() === 'seller') {
    const seller = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { sellerStatus: true, isActive: true }
    });

    console.log('Seller status check:', seller);

    if (seller.sellerStatus !== 'ACTIVE' || !seller.isActive) {
      res.status(403);
      throw new Error('Your seller account is not active. Please contact admin.');
    }
  }
  
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId: parseInt(categoryId),
      coverImage: productCoverImage,
      createdById: req.user.id,
      isVisible: true,
    },
    include: {
      category: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          businessName: true
        }
      }
    }
  });

  console.log('Product created successfully:', product.id);

  await notify({
    userId: req.user.id,
    message: `New product "${name}" has been created.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.status(201).json(product);
});

export const getProducts = asyncHandler(async (req, res) => {
  // If it's a seller requesting, show only their products
  if (req.user && req.user.role.toLowerCase() === 'seller') {
    const products = await prisma.product.findMany({
      where: {
        createdById: req.user.id
      },
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
    return res.json(products);
  }

  // For public/admin access - only return visible products from active sellers
  const products = await prisma.product.findMany({
    where: {
      isVisible: true,
      createdBy: {
        sellerStatus: 'ACTIVE',
        isActive: true
      }
    },
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
  });
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { 
      category: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          businessName: true,
          sellerStatus: true,
          isActive: true
        }
      }
    },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // If user is the seller who owns this product, allow access regardless of visibility
  if (req.user && req.user.role.toLowerCase() === 'seller' && product.createdById === req.user.id) {
    return res.json(product);
  }

  // For other users, check if product should be visible
  if (!product.isVisible || 
      product.createdBy?.sellerStatus !== 'ACTIVE' || 
      !product.createdBy?.isActive) {
    res.status(404);
    throw new Error('Product not available');
  }

  res.json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  
  console.log('Update Product Debug:');
  console.log('Product ID:', id);
  console.log('User ID:', req.user.id);
  console.log('User Role:', req.user.role);
  
  const product = await prisma.product.findUnique({ 
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          sellerStatus: true,
          isActive: true
        }
      }
    }
  });

  if (!product) {
    console.log('Product not found');
    res.status(404);
    throw new Error('Product not found');
  }

  console.log('Product createdById:', product.createdById);
  console.log('User owns product?', product.createdById === req.user.id);
  console.log('User is admin?', req.user.role.toLowerCase() === 'admin');

  // Check if user owns the product OR is an admin
  const userOwnsProduct = product.createdById === req.user.id;
  const userIsAdmin = req.user.role.toLowerCase() === 'admin';
  
  if (!userOwnsProduct && !userIsAdmin) {
    console.log('Authorization failed - user does not own product and is not admin');
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  // Additional check for sellers - they must be active
  if (userOwnsProduct && req.user.role.toLowerCase() === 'seller') {
    if (product.createdBy?.sellerStatus !== 'ACTIVE' || !product.createdBy?.isActive) {
      res.status(403);
      throw new Error('Your seller account is not active. Cannot update products.');
    }
  }

  console.log('Authorization passed, updating product');

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: req.body.name,
      description: req.body.description,
      price: parseFloat(req.body.price),
      stock: parseInt(req.body.stock),
      coverImage: req.body.coverImage,
      categoryId: parseInt(req.body.categoryId),
    },
    include: {
      category: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          businessName: true
        }
      }
    }
  });

  await notify({
    userId: req.user.id,
    message: `Product "${updated.name}" has been updated.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.json(updated);
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  
  console.log('Delete Product Debug:');
  console.log('Product ID:', id);
  console.log('User ID:', req.user.id);
  console.log('User Role:', req.user.role);
  
  const product = await prisma.product.findUnique({ 
    where: { id },
    include: {
      createdBy: {
        select: {
          id: true,
          sellerStatus: true,
          isActive: true
        }
      }
    }
  });

  if (!product) {
    console.log('Product not found');
    res.status(404);
    throw new Error('Product not found');
  }

  console.log('Product createdById:', product.createdById);
  
  // Check if user owns the product OR is an admin
  const userOwnsProduct = product.createdById === req.user.id;
  const userIsAdmin = req.user.role.toLowerCase() === 'admin';
  
  if (!userOwnsProduct && !userIsAdmin) {
    console.log('Authorization failed - user does not own product and is not admin');
    res.status(403);
    throw new Error('Not authorized to delete this product');
  }

  console.log('Authorization passed, deleting product');

  await prisma.product.delete({ where: { id } });

  await notify({
    userId: req.user.id,
    message: `Product "${product.name}" has been deleted.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.json({ message: 'Product deleted' });
});
