
import React, { useState } from 'react';
import { Star, ShoppingCart, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: string;
  originalPrice?: string;
  rating?: number;
  numReviews?: number;
  averageRating?: number;
}

const ProductCard = ({ 
  id, 
  image, 
  title, 
  price, 
  originalPrice, 
  rating = 5, 
  numReviews = 0,
  averageRating = 0
}: ProductCardProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const { addToCart, isAddingToCart, refetchCart } = useCart();

  // Use averageRating from database if available, otherwise fallback to rating prop
  const displayRating = averageRating > 0 ? averageRating : rating;
  const displayNumReviews = numReviews || 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      console.log('🛒 ProductCard: Adding to cart, product ID:', id);
      await addToCart({ productId: parseInt(id), quantity: 1 });
      
      // Force cart refetch after successful add
      setTimeout(() => {
        refetchCart();
      }, 500);
      
    } catch (err: any) {
      console.error('❌ ProductCard: Add to cart failed:', err);
      toast({
        title: t('common.error'),
        description: err.response?.data?.message || t('cart.failed_to_add'),
        variant: "destructive",
      });
    }
  };

  return (
    <Link to={`/products/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group hover:scale-105">
        <div className="relative overflow-hidden rounded-t-xl">
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShoppingCart className="w-4 h-4 text-purple-500" />
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-2 text-sm">{title}</h3>
          
          {/* Star Rating and Review Count */}
          <div className="flex items-center mb-2 space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${
                    i < Math.floor(displayRating) 
                      ? 'text-yellow-400 fill-current' 
                      : i < displayRating 
                      ? 'text-yellow-400 fill-current opacity-50' 
                      : 'text-gray-300'
                  }`} 
                />
              ))}
            </div>
            {displayNumReviews > 0 && (
              <div className="flex items-center text-xs text-gray-500">
                <MessageSquare className="w-3 h-3 mr-1" />
                <span>({displayNumReviews})</span>
              </div>
            )}
            {displayRating > 0 && (
              <span className="text-xs text-gray-600">
                {displayRating.toFixed(1)}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-purple-500">{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
              )}
            </div>
            <Button 
              size="sm" 
              className="bg-purple-500 hover:bg-purple-600 text-white"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                t('cart.add_to_cart') || 'Add to Cart'
              )}
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
