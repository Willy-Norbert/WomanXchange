
import React, { useContext } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { AuthContext } from '@/contexts/AuthContext';

const CartBadge = () => {
  const { user } = useContext(AuthContext);
  const { cartItemsCount, isLoading } = useCart();

  return (
    <Link to="/cart">
      <Button variant="ghost" size="icon" className="relative">
        <ShoppingCart className="w-5 h-5" />
        {user && cartItemsCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {cartItemsCount > 99 ? '99+' : cartItemsCount}
          </span>
        )}
      </Button>
    </Link>
  );
};

export default CartBadge;
