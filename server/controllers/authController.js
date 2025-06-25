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

// Get user profile
export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  console.log('Getting profile for user:', userId);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      bio: true,
      businessName: true,
      gender: true,
      sellerStatus: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  console.log('Profile found for user:', user.email);
  res.json(user);
});

// Update user profile
export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { name, email, phone, address, bio, businessName, gender } = req.body;

  console.log('Updating profile for user:', userId, 'with data:', req.body);

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if email is being changed and if it already exists
  if (email && email !== user.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email }
    });
    
    if (emailExists) {
      res.status(400);
      throw new Error('Email already in use');
    }
  }

  const updateData = {};
  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (address) updateData.address = address;
  if (bio) updateData.bio = bio;
  if (businessName) updateData.businessName = businessName;
  if (gender) updateData.gender = gender;

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      bio: true,
      businessName: true,
      gender: true,
      sellerStatus: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  console.log('Profile updated successfully for user:', updatedUser.email);
  res.json(updatedUser);
});

// Get single user (Admin only)
export const getUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  console.log('Getting user:', userId);
  
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      bio: true,
      company: true,
      isActive: true,
      sellerStatus: true,
      businessName: true,
      createdAt: true
    }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  console.log('User found successfully');
  res.json(user);
});

// Create user (Admin only)
export const createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role, phone, address, bio, company } = req.body;
  
  console.log('Creating user:', email);

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
      ...(phone && { phone }),
      ...(address && { address }),
      ...(bio && { bio }),
      ...(company && { company })
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      address: true,
      bio: true,
      company: true,
      isActive: true,
      sellerStatus: true,
      businessName: true,
      createdAt: true
    }
  });

  console.log('User created successfully');
  res.status(201).json(user);
});

// Get all users (Admin only)
export const getAllUsers = asyncHandler(async (req, res) => {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      sellerStatus: true,
      businessName: true,
      createdAt: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  res.status(200).json(users);
});

// Delete user (Admin only)
export const deleteUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  
  console.log('Deleting user:', userId);
  
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Cannot delete admin users
  if (user.role === 'ADMIN') {
    res.status(403);
    throw new Error('Cannot delete admin users');
  }

  await prisma.user.delete({
    where: { id: parseInt(userId) }
  });

  console.log('User deleted successfully');
  res.json({ message: 'User deleted successfully' });
});

// Update user (Admin only)
export const updateUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, role, isActive } = req.body;
  
  console.log('Updating user:', userId, req.body);

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Check if email is already taken by another user
  if (email && email !== user.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email }
    });
    if (emailExists) {
      res.status(400);
      throw new Error('Email already exists');
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: {
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role: role.toUpperCase() }),
      ...(typeof isActive === 'boolean' && { isActive })
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      isActive: true,
      sellerStatus: true,
      businessName: true,
      createdAt: true
    }
  });

  console.log('User updated successfully');
  res.json(updatedUser);
});

// Logout User
export const logoutUser = (req, res) => {
  res.cookie('token', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Logged out successfully' });
};
