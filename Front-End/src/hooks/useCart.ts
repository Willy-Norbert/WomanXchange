
import { useState, useEffect, useContext } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCart, addToCart, removeFromCart, Cart as CartType } from '@/api/orders';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export const useCart = () => {
  const { user } = useContext(AuthContext);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [guestId, setGuestId] = useState<string>(() => {
    if (!user) {
      const stored = localStorage.getItem('guestCartId');
      if (stored) return stored;
      const newId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('guestCartId', newId);
      return newId;
    }
    return '';
  });

  const { data: cart, isLoading, error } = useQuery({
    queryKey: ['cart', user?.id || guestId],
    queryFn: () => getCart(user ? undefined : guestId),
    staleTime: 5000, // 5 seconds stale time for better performance
    gcTime: 10 * 60 * 1000, // 10 minutes garbage collection time
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId, quantity }: { productId: number; quantity: number }) => {
      return addToCart(productId, quantity, user ? undefined : guestId);
    },
    onSuccess: (data) => {
      if (data.data?.guestId && !user) {
        setGuestId(data.data.guestId);
        localStorage.setItem('guestCartId', data.data.guestId);
      }
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to add item to cart",
        variant: "destructive",
      });
    }
  });

  const removeFromCartMutation = useMutation({
    mutationFn: (productId: number) => {
      return removeFromCart(productId, user ? undefined : guestId);
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
    isLoading,
    error,
    addToCart: addToCartMutation.mutate,
    removeFromCart: removeFromCartMutation.mutate,
    isAddingToCart: addToCartMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
  };
};
