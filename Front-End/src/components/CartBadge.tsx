
import React, { useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';

const CartBadge = () => {
  const { cartItemsCount, isLoading, refetchCart } = useCart();

  // Auto-refresh cart data periodically
  useEffect(() => {
    const interval = setInterval(() => {
      refetchCart();
    }, 5000); // Refresh every 5 seconds

    return () => clearInterval(interval);
  }, [refetchCart]);

  console.log('CartBadge render - cartItemsCount:', cartItemsCount, 'isLoading:', isLoading);

  return (
    <Link to="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="w-5 h-5" />
        {!isLoading && cartItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium animate-pulse">
            {cartItemsCount > 99 ? '99+' : cartItemsCount}
          </span>
        )}
        {isLoading && (
          <span className="absolute -top-1 -right-1 bg-gray-400 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            <div className="animate-spin rounded-full h-2 w-2 border border-white border-t-transparent"></div>
          </span>
        )}
      </Button>
    </Link>
  );
};

export default CartBadge;
