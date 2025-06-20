import express from 'express';
import { registerUser, authUser, logoutUser, getAllUsers} from '../controllers/authController.js';

const authRouter = express.Router();
authRouter.post('/register', registerUser);
authRouter.post('/login', authUser);
authRouter.post('/logout', logoutUser);
// ✅ Only admins can fetch all users
authRouter.get('/users',  getAllUsers);
export default authRouter;