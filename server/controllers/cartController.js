
import asyncHandler from 'express-async-handler';
import prisma from '../prismaClient.js';

// Add or Update Product in Cart (no authentication required)
export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity } = req.body;
  
  console.log('🛒 addToCart called with:', { productId, quantity, hasUser: !!req.user, userId: req.user?.id });
  
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  let cart;
  
  // Check if user is logged in
  if (req.user) {
    // Logged in user - find or create user cart
    const userId = req.user.id;
    console.log('👤 Handling authenticated user cart for userId:', userId);
    cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId } });
      console.log('📦 Created new user cart:', cart.id);
    }
  } else {
    // Unauthenticated user - create anonymous cart
    console.log('👻 Creating anonymous cart for unauthenticated user');
    cart = await prisma.cart.create({ data: {} });
    console.log('📦 Created anonymous cart with ID:', cart.id);
  }

  const existingItem = await prisma.cartItem.findFirst({
    where: { cartId: cart.id, productId }
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: existingItem.quantity + quantity }
    });
    console.log('✅ Updated existing cart item quantity');
  } else {
    await prisma.cartItem.create({
      data: { cartId: cart.id, productId, quantity }
    });
    console.log('✅ Created new cart item');
  }

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { 
      items: { 
        include: { 
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              coverImage: true,
              description: true,
              stock: true
            }
          }
        } 
      } 
    }
  });

  console.log('📦 Returning updated cart with cartId:', cart.id, 'items count:', updatedCart?.items?.length);
  res.json({ data: updatedCart, cartId: cart.id });
});

// Remove Product from Cart (no authentication required)
export const removeFromCart = asyncHandler(async (req, res) => {
  const { productId, cartId } = req.body;

  let cart;
  if (req.user) {
    // Authenticated user
    const userId = req.user.id;
    cart = await prisma.cart.findUnique({ where: { userId } });
  } else {
    // Unauthenticated user - use cartId from request
    if (!cartId) {
      res.status(400);
      throw new Error('Cart ID required for unauthenticated users');
    }
    cart = await prisma.cart.findUnique({ where: { id: cartId } });
  }

  if (!cart) {
    res.status(404);
    throw new Error('Cart not found');
  }

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId }
  });

  const updatedCart = await prisma.cart.findUnique({
    where: { id: cart.id },
    include: { 
      items: { 
        include: { 
          product: {
            select: {
              id: true,
              name: true,
              price: true,
              coverImage: true,
              description: true,
              stock: true
            }
          }
        } 
      } 
    }
  });

  res.json({ data: updatedCart, cartId: cart.id });
});

// Get User Cart (no authentication required)
export const getCart = asyncHandler(async (req, res) => {
  const { cartId } = req.query;
  console.log('🔍 getCart called with hasUser:', !!req.user, 'userId:', req.user?.id, 'cartId:', cartId);
  
  let cart;
  if (req.user) {
    // Authenticated user
    const userId = req.user.id;
    console.log('👤 Getting authenticated user cart for userId:', userId);
    cart = await prisma.cart.findUnique({
      where: { userId },
      include: { 
        items: { 
          include: { 
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                coverImage: true,
                description: true,
                stock: true
              }
            }
          } 
        } 
      }
    });
  } else {
    // Unauthenticated user
    if (cartId) {
      const parsedCartId = parseInt(cartId);
      console.log('👻 Getting anonymous cart with ID:', parsedCartId);
      cart = await prisma.cart.findUnique({
        where: { id: parsedCartId },
        include: { 
          items: { 
            include: { 
              product: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  coverImage: true,
                  description: true,
                  stock: true
                }
              }
            } 
          } 
        }
      });
    } else {
      console.log('👻 No cartId provided for anonymous user');
    }
  }

  console.log('📦 Returning cart data with items:', cart?.items?.length || 0, 'cartId:', cart?.id);
  res.json({ data: cart || { items: [] }, cartId: cart?.id });
});
