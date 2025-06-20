
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface ProductCardProps {
  id: string;
  image: string;
  title: string;
  price: string;
  rating?: number;
}

const ProductCard = ({ id, image, title, price, rating = 5 }: ProductCardProps) => {
  return (
    <Link to={`/products/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group hover:scale-105">
        <div className="relative overflow-hidden rounded-t-xl">
          <img 
            src={image} 
            alt={title}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <ShoppingCart className="w-4 h-4 text-purple-600" />
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
            <span className="font-bold text-purple-600">{price}</span>
            <Button 
              size="sm" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Added to cart:', title);
              }}
            >
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
