
import { Request, Response } from 'express';
import { db } from '../lib/database';

// Get cart
export const getCart = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const cartId = req.query.cartId;

    console.log('🛒 Getting cart for:', { userId, cartId });

    let cartItems;
    let currentCartId;

    if (userId) {
      // Authenticated user
      cartItems = await db.query(`
        SELECT ci.*, p.name, p.price, p.image_url 
        FROM cart_items ci 
        JOIN products p ON ci.product_id = p.id 
        WHERE ci.user_id = ?
      `, [userId]);
      currentCartId = userId; // Use user ID as cart identifier
    } else if (cartId) {
      // Guest user with existing cart
      cartItems = await db.query(`
        SELECT ci.*, p.name, p.price, p.image_url 
        FROM cart_items ci 
        JOIN products p ON ci.product_id = p.id 
        WHERE ci.cart_id = ?
      `, [cartId]);
      currentCartId = cartId;
    } else {
      // New guest user
      cartItems = [];
      currentCartId = null;
    }

    const total = cartItems.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);

    const cart = {
      id: currentCartId,
      items: cartItems.map((item: any) => ({
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        product: {
          id: item.product_id,
          name: item.name,
          price: item.price,
          image_url: item.image_url,
        },
      })),
      total,
    };

    console.log('🛒 Returning cart:', { itemCount: cart.items.length, total, cartId: currentCartId });
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Failed to fetch cart' });
  }
};

// Add to cart
export const addToCart = async (req: Request, res: Response) => {
  try {
    const { product_id, quantity = 1, cart_id } = req.body;
    const userId = req.user?.id;

    console.log('🛒 Adding to cart:', { product_id, quantity, cart_id, userId });

    if (!product_id) {
      return res.status(400).json({ message: 'Product ID is required' });
    }

    let currentCartId = cart_id;

    if (userId) {
      // Authenticated user
      const existingItem = await db.query(
        'SELECT * FROM cart_items WHERE user_id = ? AND product_id = ?',
        [userId, product_id]
      );

      if (existingItem.length > 0) {
        await db.query(
          'UPDATE cart_items SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
          [quantity, userId, product_id]
        );
      } else {
        await db.query(
          'INSERT INTO cart_items (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, product_id, quantity]
        );
      }
      currentCartId = userId;
    } else {
      // Guest user
      if (!currentCartId) {
        // Create new cart ID for guest
        const result = await db.query('INSERT INTO guest_carts () VALUES ()');
        currentCartId = result.insertId;
        console.log('🛒 Created new guest cart:', currentCartId);
      }

      const existingItem = await db.query(
        'SELECT * FROM cart_items WHERE cart_id = ? AND product_id = ?',
        [currentCartId, product_id]
      );

      if (existingItem.length > 0) {
        await db.query(
          'UPDATE cart_items SET quantity = quantity + ? WHERE cart_id = ? AND product_id = ?',
          [quantity, currentCartId, product_id]
        );
      } else {
        await db.query(
          'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES (?, ?, ?)',
          [currentCartId, product_id, quantity]
        );
      }
    }

    console.log('🛒 Item added successfully, cart_id:', currentCartId);
    res.json({ 
      message: 'Item added to cart', 
      cart_id: currentCartId 
    });
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Failed to add to cart' });
  }
};

// Update cart item quantity
export const updateCartItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { quantity, cart_id } = req.body;
    const userId = req.user?.id;

    if (userId) {
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND user_id = ?',
        [quantity, id, userId]
      );
    } else {
      await db.query(
        'UPDATE cart_items SET quantity = ? WHERE id = ? AND cart_id = ?',
        [quantity, id, cart_id]
      );
    }

    res.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Failed to update cart item' });
  }
};

// Remove from cart
export const removeFromCart = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { cart_id } = req.query;
    const userId = req.user?.id;

    if (userId) {
      await db.query('DELETE FROM cart_items WHERE id = ? AND user_id = ?', [id, userId]);
    } else {
      await db.query('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [id, cart_id]);
    }

    res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Failed to remove from cart' });
  }
};

// Clear cart
export const clearCart = async (req: Request, res: Response) => {
  try {
    const { cart_id } = req.query;
    const userId = req.user?.id;

    if (userId) {
      await db.query('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    } else if (cart_id) {
      await db.query('DELETE FROM cart_items WHERE cart_id = ?', [cart_id]);
    }

    res.json({ message: 'Cart cleared' });
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Failed to clear cart' });
  }
};
