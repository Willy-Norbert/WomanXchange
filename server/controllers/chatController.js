
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';

// @desc    Get all chat messages for community chat
// @route   GET /api/chat/messages
// @access  Private (Admin/Seller only)
export const getChatMessages = asyncHandler(async (req, res) => {
  console.log('Getting chat messages...', req.user);
  
  const messages = await prisma.chatMessage.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  console.log('Found messages:', messages.length);
  res.status(200).json(messages);
});

// @desc    Create a new chat message
// @route   POST /api/chat/messages
// @access  Private (Admin/Seller only)
export const createChatMessage = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user.id;

  console.log('Creating chat message:', { message, userId, userRole: req.user.role });

  if (!message || !message.trim()) {
    res.status(400);
    throw new Error('Message is required');
  }

  // Ensure user has proper role
  const userRole = req.user.role.toLowerCase();
  if (userRole !== 'admin' && userRole !== 'seller') {
    res.status(403);
    throw new Error('Only admins and sellers can post messages');
  }

  const chatMessage = await prisma.chatMessage.create({
    data: {
      message: message.trim(),
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
    },
  });

  console.log('Created chat message:', chatMessage);
  res.status(201).json(chatMessage);
});
