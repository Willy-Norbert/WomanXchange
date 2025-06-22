
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
  const [isCartIdReady, setIsCartIdReady] = useState(false);

  // Get cartId from localStorage for unauthenticated users
  useEffect(() => {
    if (!user) {
      const storedCartId = localStorage.getItem('anonymous_cart_id');
      if (storedCartId) {
        setCartId(parseInt(storedCartId));
      }
      setIsCartIdReady(true);
    } else {
      // Clear anonymous cart when user logs in
      localStorage.removeItem('anonymous_cart_id');
      setCartId(null);
      setIsCartIdReady(true);
    }
  }, [user]);

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart', cartId, user?.id],
    queryFn: () => {
      console.log('useCart query: calling getCart with cartId:', cartId);
      return getCart(cartId);
    },
    enabled: isCartIdReady, // Only run query when cartId is ready
    staleTime: 5000,
    gcTime: 10 * 60 * 1000,
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => {
      console.log('Adding to cart:', { productId, quantity });
      return addToCart(productId, quantity);
    },
    onSuccess: (data) => {
      console.log('Add to cart success:', data);
      
      // Store cartId for unauthenticated users and update state immediately
      if (!user && data.data.cartId) {
        const newCartId = data.data.cartId;
        localStorage.setItem('anonymous_cart_id', newCartId.toString());
        setCartId(newCartId);
        
        // Update the query cache with the new cart data
        queryClient.setQueryData(['cart', newCartId, user?.id], data);
      }
      
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: any) => {
      console.error('Add to cart error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (productId: number) => {
      return removeFromCart(productId, cartId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to remove item",
        variant: "destructive",
      });
    }
  });

  const cartItemsCount = cart?.data?.items?.reduce((total: number, item: any) => total + item.quantity, 0) || 0;

  return {
    cart: cart?.data,
    cartItemsCount,
    isLoading: isLoading || !isCartIdReady,
    error,
    addToCart: addToCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
};
