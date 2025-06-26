
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    image_url?: string;
  };
}

interface Cart {
  id: number;
  items: CartItem[];
  total: number;
}

export const useCart = () => {
  const { user } = useAuth();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(false);
  const [cartId, setCartId] = useState<number | null>(null);

  // Get or create guest cart ID
  const getGuestCartId = useCallback(() => {
    const stored = localStorage.getItem('guest_cart_id');
    if (stored) {
      const id = parseInt(stored);
      setCartId(id);
      return id;
    }
    return null;
  }, []);

  // Store guest cart ID
  const storeGuestCartId = useCallback((id: number) => {
    localStorage.setItem('guest_cart_id', id.toString());
    setCartId(id);
  }, []);

  // Clear guest cart
  const clearGuestCart = useCallback(() => {
    localStorage.removeItem('guest_cart_id');
    setCartId(null);
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      console.log('useCart hook - user state:', { hasUser: !!user, userId: user?.id });
      
      let response;
      if (user) {
        // Authenticated user
        response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
      } else {
        // Guest user - get existing cart ID or create new one
        const guestCartId = getGuestCartId();
        console.log('getCart called with hasUser: false cartId:', guestCartId);
        
        if (guestCartId) {
          response = await fetch(`/api/cart?cartId=${guestCartId}`);
        } else {
          // No cart yet, will be created when first item is added
          console.log('📦 No guest cart found, will create on first add');
          setCart({ id: 0, items: [], total: 0 });
          setLoading(false);
          return;
        }
      }

      if (response.ok) {
        const cartData = await response.json();
        console.log('📦 Returning cart data with items:', cartData.items?.length || 0, 'cartId:', cartData.id);
        setCart(cartData);
        
        // Store cart ID for guests
        if (!user && cartData.id) {
          storeGuestCartId(cartData.id);
        }
      } else {
        // Cart doesn't exist, create empty state
        setCart({ id: 0, items: [], total: 0 });
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
      setCart({ id: 0, items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  }, [user, getGuestCartId, storeGuestCartId]);

  const addToCart = async (productId: number, quantity: number = 1) => {
    try {
      setLoading(true);
      
      let response;
      if (user) {
        // Authenticated user
        response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({ product_id: productId, quantity }),
        });
      } else {
        // Guest user
        const guestCartId = getGuestCartId();
        const body: any = { product_id: productId, quantity };
        
        if (guestCartId) {
          body.cart_id = guestCartId;
        }
        
        response = await fetch('/api/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
      }

      if (response.ok) {
        const result = await response.json();
        
        // Store cart ID for guests if this is their first item
        if (!user && result.cart_id) {
          storeGuestCartId(result.cart_id);
        }
        
        await fetchCart();
        toast.success('Item added to cart');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to add item to cart');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    try {
      setLoading(true);
      
      let response;
      if (user) {
        response = await fetch(`/api/cart/items/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
          body: JSON.stringify({ quantity }),
        });
      } else {
        const guestCartId = getGuestCartId();
        response = await fetch(`/api/cart/items/${itemId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ quantity, cart_id: guestCartId }),
        });
      }

      if (response.ok) {
        await fetchCart();
        toast.success('Cart updated');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to update cart');
      }
    } catch (error) {
      console.error('Error updating cart:', error);
      toast.error('Failed to update cart');
    } finally {
      setLoading(false);
    }
  };

  const removeFromCart = async (itemId: number) => {
    try {
      setLoading(true);
      
      let response;
      if (user) {
        response = await fetch(`/api/cart/items/${itemId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
      } else {
        const guestCartId = getGuestCartId();
        response = await fetch(`/api/cart/items/${itemId}?cart_id=${guestCartId}`, {
          method: 'DELETE',
        });
      }

      if (response.ok) {
        await fetchCart();
        toast.success('Item removed from cart');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      toast.error('Failed to remove item');
    } finally {
      setLoading(false);
    }
  };

  const clearCart = async () => {
    try {
      setLoading(true);
      
      let response;
      if (user) {
        response = await fetch('/api/cart/clear', {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          },
        });
      } else {
        const guestCartId = getGuestCartId();
        if (guestCartId) {
          response = await fetch(`/api/cart/clear?cart_id=${guestCartId}`, {
            method: 'DELETE',
          });
        }
        clearGuestCart();
      }

      if (response?.ok) {
        await fetchCart();
        toast.success('Cart cleared');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      toast.error('Failed to clear cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Clean up guest cart when user logs in
  useEffect(() => {
    if (user) {
      clearGuestCart();
    }
  }, [user, clearGuestCart]);

  return {
    cart,
    cartId: user ? cart?.id : cartId,
    loading,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetch: fetchCart,
  };
};
