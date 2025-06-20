
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';

import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import productRoutes from './routes/productRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import { protect, authorizeRoles, errorHandler } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();

// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:8080',           // for local dev
  'https://your-frontend-domain.com' // replace with your deployed frontend domain
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// ✅ Middleware
app.use(express.json());

// ✅ Swagger docs
const swaggerDocument = YAML.load('./swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// ✅ Public routes
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);

// ✅ Protected role-based dashboards
app.get('/api/admin/dashboard', protect, authorizeRoles('admin'), (req, res) => {
  res.json({ message: `Welcome Admin ${req.user.name}` });
});

app.get('/api/seller/dashboard', protect, authorizeRoles('seller'), (req, res) => {
  res.json({ message: `Welcome Seller ${req.user.name}` });
});

app.get('/api/buyer/dashboard', protect, authorizeRoles('buyer'), (req, res) => {
  res.json({ message: `Welcome Buyer ${req.user.name}` });
});

// ✅ API routes
app.use('/api/categories', categoryRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/chat', chatRoutes);

// ✅ Error handling
app.use(errorHandler);

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
