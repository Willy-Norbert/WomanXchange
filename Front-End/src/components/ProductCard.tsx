
import React, { useState, useContext } from 'react';
import { Star, ShoppingCart, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useCart } from '@/hooks/useCart';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { AuthContext } from '@/contexts/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createProductReview } from '@/api/reviews';

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
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const queryClient = useQueryClient();
  const { addToCart, isAddingToCart, refetchCart } = useCart();
  
  // Review form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [showReviewDialog, setShowReviewDialog] = useState(false);

  // Use averageRating from database if available, otherwise fallback to rating prop
  const displayRating = averageRating > 0 ? averageRating : rating;
  const displayNumReviews = numReviews || 0;

  // Submit review mutation
  const submitReviewMutation = useMutation({
    mutationFn: (reviewData: { rating: number; comment: string }) => {
      console.log('📝 ProductCard: Submitting review:', reviewData, 'for product:', id);
      return createProductReview(id, reviewData);
    },
    onSuccess: () => {
      toast({
        title: "Review submitted",
        description: "Thank you for your review!",
      });
      setReviewComment('');
      setReviewRating(5);
      setShowReviewDialog(false);
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['all-reviews'] });
    },
    onError: (error: any) => {
      console.error('❌ ProductCard: Review submission error:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to submit review",
        variant: "destructive",
      });
    }
  });

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

  const handleSubmitReview = () => {
    if (!reviewComment.trim()) {
      toast({
        title: "Error",
        description: "Please write a comment for your review",
        variant: "destructive",
      });
      return;
    }

    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to submit a review",
        variant: "destructive",
      });
      return;
    }

    submitReviewMutation.mutate({ rating: reviewRating, comment: reviewComment.trim() });
  };

  const StarRating = ({ value, onChange, readonly = false }: { 
    value: number; 
    onChange?: (value: number) => void; 
    readonly?: boolean;
  }) => (
    <div className="flex items-center space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-4 h-4 cursor-pointer transition-colors ${
            star <= value ? 'text-yellow-400 fill-current' : 'text-gray-300'
          } ${readonly ? 'cursor-default' : 'hover:text-yellow-300'}`}
          onClick={() => !readonly && onChange?.(star)}
        />
      ))}
    </div>
  );

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
          
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-purple-500">{price}</span>
              {originalPrice && (
                <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              size="sm" 
              className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
              onClick={handleAddToCart}
              disabled={isAddingToCart}
            >
              {isAddingToCart ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                t('cart.add_to_cart') || 'Add to Cart'
              )}
            </Button>
            
            {/* Add Review Button */}
            <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
              <DialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (!user) {
                      toast({
                        title: "Login required",
                        description: "Please log in to add a review",
                        variant: "destructive",
                      });
                      return;
                    }
                    setShowReviewDialog(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md" onClick={(e) => e.stopPropagation()}>
                <DialogHeader>
                  <DialogTitle>Add Review for {title}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Rating</label>
                    <StarRating value={reviewRating} onChange={setReviewRating} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Comment</label>
                    <Textarea
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows={3}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      onClick={handleSubmitReview}
                      disabled={submitReviewMutation.isPending}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {submitReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowReviewDialog(false);
                        setReviewComment('');
                        setReviewRating(5);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
