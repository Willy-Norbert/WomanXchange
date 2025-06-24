import express from 'express';
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import reviewRoutes from './reviewRoutes.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const productRouter = express.Router();
productRouter.route('/')
  .get(getProducts)
  .post(protect, authorizeRoles('seller', 'admin'), createProduct);
productRouter.route('/:id')
  .get(getProductById)
  .put(protect, authorizeRoles('seller', 'admin'), updateProduct)
  .delete(protect, authorizeRoles('seller', 'admin'), deleteProduct);
productRouter.use('/:productId/reviews', reviewRoutes);
export default productRouter;
