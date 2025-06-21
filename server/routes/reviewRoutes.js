import express from 'express';
import {
  createReview,
  getReviews,
  updateReview,
  deleteReview
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';

const reviewRouter = express.Router({ mergeParams: true });
reviewRouter.route('/')
  .get(getReviews)
  .post(protect, createReview);
reviewRouter.route('/:id')
  .put(protect, updateReview)
  .delete(protect, deleteReview);
export default reviewRouter;
// This file defines the routes for product reviews, allowing users to create, read, update, and delete reviews.
// It uses the `express.Router` to handle requests and applies authentication middleware to protect certain routes