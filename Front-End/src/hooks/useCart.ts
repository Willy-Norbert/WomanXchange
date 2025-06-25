
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

  // Get cartId from localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      const storedCartId = localStorage.getItem('anonymous_cart_id');
      if (storedCartId) {
        const parsedCartId = parseInt(storedCartId);
        setCartId(parsedCartId);
        console.log('🛒 Loaded cart ID from localStorage:', parsedCartId);
      } else {
        console.log('🛒 No stored cart ID found for anonymous user');
      }
    } else {
      // Clear anonymous cart when user logs in
      localStorage.removeItem('anonymous_cart_id');
      setCartId(null);
      console.log('👤 User logged in, cleared anonymous cart');
    }
  }, [user]);

  // Create a stable query key that changes when user auth state changes
  const queryKey = user ? ['cart', 'authenticated', user.id] : ['cart', 'anonymous', cartId];

  const { data: cartResponse, isLoading, error, refetch } = useQuery({
    queryKey,
    queryFn: async () => {
      console.log('🔍 useCart query: calling getCart with cartId:', cartId, 'user:', !!user);
      const response = await getCart(cartId);
      console.log('📦 Cart response received:', response?.data);
      return response;
    },
    staleTime: 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  // Extract cart data from the response
  const cart = cartResponse?.data?.data;

  console.log('🛒 useCart hook state:', {
    user: !!user,
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
      console.log('➕ Adding to cart:', { productId, quantity, currentCartId: cartId });
      const response = await addToCart(productId, quantity);
      console.log('✅ Add to cart API response:', response?.data);
      return response;
    },
    onSuccess: (data) => {
      console.log('🎉 Add to cart success:', data?.data);
      
      // Store cartId for unauthenticated users and update state immediately
      if (!user && data?.data?.cartId) {
        const newCartId = data.data.cartId;
        localStorage.setItem('anonymous_cart_id', newCartId.toString());
        setCartId(newCartId);
        console.log('💾 Stored new cart ID:', newCartId);
      }
      
      // Invalidate and refetch cart queries immediately
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // Force immediate refetch with updated cartId
      setTimeout(() => {
        refetch();
      }, 100);
      
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: any) => {
      console.error('❌ Add to cart error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (productId: number) => {
      console.log('➖ Removing from cart:', { productId, cartId });
      return removeFromCart(productId, cartId);
    },
    onSuccess: () => {
      console.log('✅ Remove from cart success');
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      refetch();
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: any) => {
      console.error('❌ Remove from cart error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item",
        variant: "destructive",
      });
    }
  });

  const cartItemsCount = cart?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;

  console.log('🔢 Cart items count calculated:', cartItemsCount, 'from items:', cart?.items);

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
