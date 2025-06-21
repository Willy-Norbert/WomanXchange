
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';  // Import notify

export const createProduct = asyncHandler(async (req, res) => {
  const { name, description, price, stock, categoryId, coverImage } = req.body;
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
    },
  });

  // Notify admins about the new product
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
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || (product.createdById !== req.user.id && req.user.role !== 'admin')) {
    res.status(403);
    throw new Error('Not authorized or product not found');
  }

  const updated = await prisma.product.update({
    where: { id },
    data: {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      stock: req.body.stock,
      coverImage: req.body.coverImage,
      categoryId: req.body.categoryId,
    },
  });

  // Notify admins about product update
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
  const product = await prisma.product.findUnique({ where: { id } });

  if (!product || (product.createdById !== req.user.id && req.user.role !== 'admin')) {
    res.status(403);
    throw new Error('Not authorized or product not found');
  }

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
