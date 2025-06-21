
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import dotenv from 'dotenv';

dotenv.config();

// Middleware to protect routes
export const protect = asyncHandler(async (req, res, next) => {
  let token;

  console.log('Auth middleware: Checking authorization header');
  console.log('Authorization header:', req.headers.authorization);

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('Auth middleware: Token extracted, length:', token.length);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('Auth middleware: Token decoded successfully, user ID:', decoded.id);

      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      if (!user) {
        console.log('Auth middleware: User not found in database');
        res.status(401);
        throw new Error('User not found');
      }

      console.log('Auth middleware: User found:', user.email);
      req.user = user;
      next();
    } catch (error) {
      console.error('Auth middleware: JWT error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  } else {
    console.log('Auth middleware: No authorization header found');
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});

// Role-based access control
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user.role?.toLowerCase();  // 💡 normalize to lowercase
    const allowedRoles = roles.map(r => r.toLowerCase()); // 💡 also normalize allowed roles

    if (!allowedRoles.includes(userRole)) {
      res.status(403);
      throw new Error(`Role (${req.user.role}) not authorized`);
    }
    next();
  };
};


// Error handler middleware
export const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack,
  });
};
