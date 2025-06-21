
import express from 'express';
import { registerUser, authUser, logoutUser, getAllUsers, verifyToken } from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', authUser);
authRouter.post('/logout', logoutUser);
authRouter.get('/users', getAllUsers);
authRouter.get('/verify-token', protect, verifyToken);

export default authRouter;
