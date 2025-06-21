
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import generateToken from '../utils/generateToken.js';
import bcrypt from 'bcryptjs';
import { notify } from '../utils/notify.js';

// Register User
export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const userExists = await prisma.user.findUnique({ where: { email } });
  if (userExists) {
    res.status(400);
    throw new Error('User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: role.toUpperCase(),
    }
  });

  try {
    await notify({
      userId: null,
      message: `New user registered: ${user.name} (${user.role})`,
      recipientRole: 'ADMIN',
      relatedOrderId: null,
    });
  } catch (error) {
    console.error('Notification error:', error);
  }

  if (user) {
    res.status(201).json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(400);
    throw new Error('Invalid user data');
  }
});

// Login User
export const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });

  if (user && (await bcrypt.compare(password, user.password))) {
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      token: generateToken(user.id, user.role),
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// Verify token endpoint
export const verifyToken = asyncHandler(async (req, res) => {
  // The protect middleware will have already verified the token
  // and attached the user to req.user
  if (req.user) {
    res.json({ 
      success: true, 
      user: {
        id: req.user.id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } else {
    res.status(401);
    throw new Error('Token verification failed');
  }
});

// Get all users
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json(users);
});

// Logout User
export const logoutUser = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};
