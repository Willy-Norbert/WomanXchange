
import { useState, useEffect, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart, removeFromCart, Cart as CartType } from '@/api/orders';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useCart = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [cartId, setCartId] = useState<number | null>(null);

  console.log('🛒 useCart hook - user state:', { hasUser: !!user, userId: user?.id, userRole: user?.role });

  // Get cartId from localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      const storedCartId = localStorage.getItem('anonymous_cart_id');
      if (storedCartId && !isNaN(parseInt(storedCartId))) {
        const parsedCartId = parseInt(storedCartId);
        setCartId(parsedCartId);
        console.log('🛒 useCart: Loaded cart ID from localStorage:', parsedCartId);
      } else {
        console.log('🛒 useCart: No valid stored cart ID found for anonymous user');
        setCartId(null);
      }
    } else {
      // Clear anonymous cart when user logs in
      localStorage.removeItem('anonymous_cart_id');
      setCartId(null);
      console.log('👤 useCart: User logged in, cleared anonymous cart');
    }
  }, [user]);

  // Create a stable query key that changes when user auth state changes
  const queryKey = user ? ['cart', 'authenticated', user.id] : ['cart', 'anonymous', cartId];

  const { data: cartResponse, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      try {
        console.log('🔍 useCart query: calling getCart with user:', !!user, 'cartId:', cartId);
        const response = await getCart(cartId);
        console.log('📦 useCart query: Cart response received:', response?.data);
        return response;
      } catch (err) {
        console.error('❌ useCart query error:', err);
        // Don't throw the error, return null instead to prevent query failure
        return null;
      }
    },
    staleTime: 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    enabled: true, // Always enable the query
  });

  // Extract cart data from the response with better error handling
  const cart = cartResponse?.data?.data || null;

  console.log('🛒 useCart hook state:', {
    user: !!user,
    userId: user?.id,
    cartId,
    isLoading,
    cartResponse: cartResponse?.data,
    cart: cart,
    cartItems: cart?.items,
    queryKey,
    error
  });

  const addToCartMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      console.log('➕ useCart: Adding to cart:', { productId, quantity, hasUser: !!user, userId: user?.id });
      const response = await addToCart(productId, quantity);
      console.log('✅ useCart: Add to cart API response:', response?.data);
      return response;
    },
    onSuccess: (data) => {
      console.log('🎉 useCart: Add to cart success, response data:', data?.data);
      
      // Store cartId for unauthenticated users and update state immediately
      if (!user && data?.data?.cartId) {
        const newCartId = data.data.cartId;
        localStorage.setItem('anonymous_cart_id', newCartId.toString());
        setCartId(newCartId);
        console.log('💾 useCart: Stored new cart ID:', newCartId);
      }
      
      // Invalidate and refetch cart queries immediately
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // Force immediate refetch with proper error handling
      setTimeout(() => {
        console.log('🔄 useCart: Force refetching cart...');
        refetch().catch(err => {
          console.error('❌ useCart: Refetch error:', err);
        });
      }, 100);
      
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: any) => {
      console.error('❌ useCart: Add to cart error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (productId: number) => {
      console.log('➖ useCart: Removing from cart:', { productId, cartId, hasUser: !!user });
      return removeFromCart(productId, cartId);
    },
    onSuccess: () => {
      console.log('✅ useCart: Remove from cart success');
      // Invalidate and refetch immediately
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      refetch().catch(err => {
        console.error('❌ useCart: Refetch after remove error:', err);
      });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: any) => {
      console.error('❌ useCart: Remove from cart error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item",
        variant: "destructive",
      });
    }
  });

  // Improved cart items count calculation with better error handling
  const cartItemsCount = (() => {
    try {
      if (!cart?.items || !Array.isArray(cart.items)) {
        return 0;
      }
      const count = cart.items.reduce((total: number, item: any) => {
        const quantity = parseInt(item?.quantity) || 0;
        return total + quantity;
      }, 0);
      console.log('🔢 useCart: Cart items count calculated:', count, 'from items:', cart?.items);
      return count;
    } catch (err) {
      console.error('❌ useCart: Error calculating cart items count:', err);
      return 0;
    }
  })();

  return {
    cart: cart,
    cartItemsCount,
    isLoading,
    error,
    addToCart: addToCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    refetchCart: refetch,
  };
};
