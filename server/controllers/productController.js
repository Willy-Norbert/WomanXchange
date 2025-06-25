
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, categoryId, coverImage, colors, sizes } = req.body;
  const productCoverImage = coverImage || 'https://aannet.org/global_graphics/default-store-350x350.jpg';
  
  const product = await prisma.product.create({
    data: {
      name,
      description,
      price,
      stock,
      categoryId,
      coverImage: productCoverImage,
      createdById: req.user.id,
      colors: colors || [],
      sizes: sizes || [],
    },
  });

  await notify({
    userId: req.user.id,
    message: `New product "${name}" has been created.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.status(201).json(product);
});

export const getProducts = asyncHandler(async (req, res) => {
  const products = await prisma.product.findMany({
    include: { category: true },
  });
  res.json(products);
});

export const getProductById = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

export const updateProduct = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  
  console.log('Update Product Debug:');
  console.log('Product ID:', id);
  console.log('User ID:', req.user.id);
  console.log('User Role:', req.user.role);
  
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product) {
    console.log('Product not found');
    res.status(404);
    throw new Error('Product not found');
  }

  console.log('Product createdById:', product.createdById);
  console.log('User owns product?', product.createdById === req.user.id);
  console.log('User is admin?', req.user.role.toLowerCase() === 'admin');

  const userOwnsProduct = product.createdById === req.user.id;
  const userIsAdmin = req.user.role.toLowerCase() === 'admin';
  
  if (!userOwnsProduct && !userIsAdmin) {
    console.log('Authorization failed - user does not own product and is not admin');
    res.status(403);
    throw new Error('Not authorized to update this product');
  }

  console.log('Authorization passed, updating product');

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      coverImage: req.body.coverImage,
      categoryId: req.body.categoryId,
      colors: req.body.colors || [],
      sizes: req.body.sizes || [],
    },
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
  
  const product = await prisma.product.findUnique({ where: { id } });

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

  // Notify admins about product deletion
  await notify({
    userId: req.user.id,
    message: `Product "${product.name}" has been deleted.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.json({ message: 'Product deleted' });
});
