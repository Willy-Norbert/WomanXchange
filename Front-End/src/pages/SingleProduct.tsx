import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { Star, Heart, ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductReviews from '@/components/ProductReviews';
import RelatedProducts from '@/components/RelatedProducts';
import { getProductById, Product } from '@/api/products';
import { useCart } from '@/hooks/useCart';
import { AuthContext } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SingleProduct = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const { user } = useContext(AuthContext);
  const { addToCart, isAddingToCart, refetchCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('black');
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        setError('');
        console.log('Fetching product with ID:', id);
        
        const response = await getProductById(id);
        console.log('Product fetch response:', response);
        
        // Handle the response data structure correctly
        const productData = response.data?.data || response.data;
        
        if (productData) {
          setProduct(productData);
          console.log('Product loaded successfully:', productData);
        } else {
          throw new Error('No product data received');
        }
      } catch (err: any) {
        console.error('Error fetching product:', err);
        const errorMessage = err.response?.status === 404 
          ? 'Product not found' 
          : err.response?.data?.message || err.message || 'Failed to load product';
        setError(errorMessage);
        
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, toast]);

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      console.log('Adding product to cart:', product.id, 'quantity:', quantity);
      await addToCart({ productId: product.id, quantity });
      
      // Force cart refetch to update badge
      setTimeout(() => {
        refetchCart();
      }, 500);
      
      toast({
        title: "Success",
        description: `${product.name} added to cart`,
      });
    } catch (err: any) {
      console.error('Add to cart error:', err);
      toast({
        title: "Error",
        description: err.response?.data?.message || "Failed to add to cart",
        variant: "destructive",
      });
    }
  };

  const productImages = product?.coverImage ? [product.coverImage] : [];
  const colors = [
    { name: 'black', color: '#000000' },
    { name: 'gray', color: '#6B7280' },
    { name: 'navy', color: '#1E3A8A' }
  ];
  const sizes = ['S', 'M', 'L', 'XL'];

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => prev > 1 ? prev - 1 : 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading product...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="text-lg text-red-600 mb-4">{error || 'Product not found'}</div>
            <Button onClick={() => window.location.reload()} className="bg-purple-500 hover:bg-purple-600">
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-500 mb-6">
          Home / Shop / {product.category?.name || 'Category'} / {product.name}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              <img 
                src={productImages[selectedImage] || '/placeholder.svg'} 
                alt={product.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            {productImages.length > 1 && (
              <div className="flex gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                      selectedImage === index ? 'border-purple-500' : 'border-gray-200'
                    }`}
                  >
                    <img 
                      src={image} 
                      alt={`Product ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(4.5)</span>
              </div>
              <p className="text-3xl font-bold text-purple-600 mb-6">{product.price.toLocaleString()} Rwf</p>
              <p className="text-gray-600 mb-6">{product.description}</p>
            </div>

            {/* Color Selection */}
            <div>
              <h3 className="font-medium mb-3">Color</h3>
              <div className="flex gap-3">
                {colors.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color.name ? 'border-purple-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color.color }}
                  />
                ))}
              </div>
            </div>

            {/* Size Selection */}
            <div>
              <h3 className="font-medium mb-3">Size</h3>
              <div className="flex gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border rounded-md ${
                      selectedSize === size
                        ? 'border-purple-500 bg-purple-500 text-white'
                        : 'border-gray-300 text-gray-700 hover:border-purple-500'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Stock Info */}
            <div className="text-sm text-gray-600">
              {product.stock > 0 ? (
                <span className="text-green-600">In Stock ({product.stock} available)</span>
              ) : (
                <span className="text-red-600">Out of Stock</span>
              )}
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={decreaseQuantity}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2 border-x">{quantity}</span>
                  <button
                    onClick={increaseQuantity}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <Button 
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0 || isAddingToCart}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                </Button>
                <Button variant="outline" size="icon">
                  <Heart className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Product Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <div className="flex gap-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'details'
                  ? 'border-purple-500 text-purple-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Product Details
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'reviews'
                  ? 'border-purple-500 text-purple-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Rating & Reviews
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`py-4 px-2 border-b-2 font-medium ${
                activeTab === 'faq'
                  ? 'border-purple-500 text-purple-500'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              FAQs
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="mb-12">
          {activeTab === 'details' && (
            <div className="prose max-w-none">
              <p className="text-gray-600">{product.description}</p>
            </div>
          )}
          {activeTab === 'reviews' && <ProductReviews productId={product.id} />}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">How should I care for this item?</h4>
                <p className="text-gray-600">Follow care instructions provided with the product</p>
              </div>
            </div>
          )}
        </div>

        {/* Related Products */}
        <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} />
      </div>

      <Footer />
    </div>
  );
};

export default SingleProduct;
