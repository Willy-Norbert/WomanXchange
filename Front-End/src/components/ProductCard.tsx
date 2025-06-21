
import React, { useContext, useState } from 'react';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { AuthContext } from '@/contexts/AuthContext';
import { addToCart } from '@/api/orders';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: string;
  originalPrice?: string;
  rating?: number;
}

const ProductCard = ({ id, image, title, price, originalPrice, rating = 5 }: ProductCardProps) => {
  const auth = useContext(AuthContext);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!auth?.user) {
      toast({
        title: t('auth.login_required'),
        description: t('auth.login_to_add_cart'),
        variant: "destructive",
      });
      return;
    }

    try {
      setIsAddingToCart(true);
      await addToCart(parseInt(id), 1);
      toast({
        title: t('cart.added_to_cart'),
        description: t('cart.item_added', { item: title }),
      });
    } catch (err: any) {
      toast({
        title: t('common.error'),
        description: err.response?.data?.message || t('cart.failed_to_add'),
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <Link to={`/product/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group hover:scale-105">
        <div className="relative overflow-hidden rounded-t-xl">
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShoppingCart className="w-4 h-4 text-purple" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h3>
          <div className="flex items-center mb-2">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-purple">{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
              )}
            </div>
            <Button 
              size="sm" 
              className="bg-purple hover:bg-purple-600 text-white"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? t('cart.adding') : t('cart.add_to_cart')}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
