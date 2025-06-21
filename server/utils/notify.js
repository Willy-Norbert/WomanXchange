import prisma from '../prismaClient.js';  // Make sure this path is correct relative to notify.js
export const notify = async ({ userId, message, recipientRole, relatedOrderId }) => {
  await prisma.notification.create({
    data: {
      userId,
      message,
      recipientRole,
      relatedOrderId,
    },
  });
};