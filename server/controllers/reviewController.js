import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import { notify } from '../utils/notify.js';

export const createReview = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  const { rating, comment } = req.body;

  const existing = await prisma.review.findFirst({
    where: {
      productId,
      userId: req.user.id,
    },
  });

  if (existing) {
    res.status(400);
    throw new Error('You have already reviewed this product');
  }

  const review = await prisma.review.create({
    data: {
      rating,
      comment,
      productId,
      userId: req.user.id,
    },
  });

  const reviews = await prisma.review.findMany({ where: { productId } });
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: average,
      numReviews: reviews.length,
    },
  });

  // Notify admin of new review
  await notify({
    userId: req.user.id,
    message: `New review added to product ID ${productId}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.status(201).json(review);
});

export const getReviews = asyncHandler(async (req, res) => {
  const productId = Number(req.params.productId);
  const reviews = await prisma.review.findMany({
    where: { productId },
    include: { user: { select: { name: true } } },
  });
  res.json(reviews);
});

export const updateReview = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const { rating, comment } = req.body;

  const review = await prisma.review.findUnique({ where: { id } });

  if (!review || review.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized or review not found');
  }

  const updated = await prisma.review.update({
    where: { id },
    data: { rating, comment },
  });

  const reviews = await prisma.review.findMany({ where: { productId: review.productId } });
  const average = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      averageRating: average,
      numReviews: reviews.length,
    },
  });

  // Notify admin of review update
  await notify({
    userId: req.user.id,
    message: `Review ID ${id} updated on product ID ${review.productId}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.json(updated);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const id = Number(req.params.id);
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review || review.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized or review not found');
  }

  await prisma.review.delete({ where: { id } });

  const reviews = await prisma.review.findMany({ where: { productId: review.productId } });
  const average = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  await prisma.product.update({
    where: { id: review.productId },
    data: {
      averageRating: average,
      numReviews: reviews.length,
    },
  });

  // Notify admin of review deletion
  await notify({
    userId: req.user.id,
    message: `Review ID ${id} deleted from product ID ${review.productId}.`,
    recipientRole: 'ADMIN',
    relatedOrderId: null,
  });

  res.json({ message: 'Review deleted' });
});
