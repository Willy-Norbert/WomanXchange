
import express from 'express';
import { registerUser, authUser, logoutUser, getAllUsers} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const authRouter = express.Router();
authRouter.post('/register', registerUser);
authRouter.post('/login', authUser);
authRouter.post('/logout', logoutUser);
// ✅ Only admins can fetch all users
authRouter.get('/users',  getAllUsers);
// ✅ Token verification endpoint
authRouter.get('/verify-token', protect, (req, res) => {
  res.json({ success: true, user: req.user });
});
export default authRouter;
