
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';
import bcrypt from 'bcryptjs';

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

// Change password
export const changePassword = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  console.log('Changing password for user:', userId);

  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Verify current password
  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isCurrentPasswordValid) {
    res.status(400);
    throw new Error('Current password is incorrect');
  }

  // Hash new password
  const hashedNewPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedNewPassword }
  });

  console.log('Password changed successfully for user:', user.email);
  res.json({ message: 'Password changed successfully' });
});

// Admin: Get all user profiles
export const getAllUserProfiles = asyncHandler(async (req, res) => {
  console.log('Admin getting all user profiles');

  const users = await prisma.user.findMany({
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
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('Found', users.length, 'user profiles');
  res.json(users);
});

// Admin: Update any user profile
export const updateAnyUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const { name, email, phone, address, bio, businessName, gender, role, sellerStatus, isActive } = req.body;

  console.log('Admin updating profile for user:', userId, 'with data:', req.body);

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
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
  if (role) updateData.role = role;
  if (sellerStatus) updateData.sellerStatus = sellerStatus;
  if (typeof isActive === 'boolean') updateData.isActive = isActive;

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
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

  console.log('Profile updated successfully by admin for user:', updatedUser.email);
  res.json(updatedUser);
});

// Admin: Delete user profile
export const deleteUserProfile = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  console.log('Admin deleting user profile:', userId);

  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) }
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Delete user and all related data
  await prisma.user.delete({
    where: { id: parseInt(userId) }
  });

  console.log('User profile deleted successfully:', user.email);
  res.json({ message: 'User profile deleted successfully' });
});
