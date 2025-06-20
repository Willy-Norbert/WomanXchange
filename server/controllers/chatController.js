
import asyncHandler from 'express-async-handler';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// @desc    Get all chat messages
// @route   GET /api/chat/messages
// @access  Private (Admin, Seller)
export const getChatMessages = asyncHandler(async (req, res) => {
  try {
    const messages = await prisma.chatMessage.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat messages'
    });
  }
});

// @desc    Create new chat message
// @route   POST /api/chat/messages
// @access  Private (Admin, Seller)
export const createChatMessage = asyncHandler(async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Message content is required'
      });
    }

    const newMessage = await prisma.chatMessage.create({
      data: {
        message: message.trim(),
        userId: userId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            role: true,
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: newMessage
    });
  } catch (error) {
    console.error('Error creating chat message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create chat message'
    });
  }
});
