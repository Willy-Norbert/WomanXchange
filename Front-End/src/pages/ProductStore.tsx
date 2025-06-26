
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getProducts } from '@/api/products';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Search, Star, Filter } from 'lucide-react';

const ProductStore = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { data: productsData, isLoading, error } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const products = productsData?.data || [];

  const filteredProducts = products.filter((product: any) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category?.name === selectedCategory;
    return matchesSearch && matchesCategory && product.isVisible;
  });

  const categories = [...new Set(products.map((p: any) => p.category?.name).filter(Boolean))];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error loading products</h1>
            <p className="text-gray-600">Please try again later.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <ShoppingBag className="w-8 h-8 text-purple-600" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Product Store
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="outline">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="bg-purple-600 hover:bg-purple-700">Register</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product: any) => (
              <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                  <img
                    src={product.coverImage}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {product.isOnSale && (
                    <Badge className="absolute top-2 left-2 bg-red-500 hover:bg-red-600">
                      Sale
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm rounded-full p-1">
                    <div className="flex items-center text-xs">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="ml-1">{product.averageRating || 0}</span>
                    </div>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2 group-hover:text-purple-600 transition-colors">
                    {product.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {product.description}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex flex-col">
                      <span className="text-lg font-bold text-purple-600">
                        {product.price.toLocaleString()} Rwf
                      </span>
                      {product.isOnSale && product.salePrice && (
                        <span className="text-sm text-gray-500 line-through">
                          {product.salePrice.toLocaleString()} Rwf
                        </span>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {product.category?.name}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span>Stock: {product.stock}</span>
                    <span>By: {product.createdBy?.businessName || product.createdBy?.name}</span>
                  </div>
                  <Link to={`/products/${product.id}`} className="block">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700">
                      View Details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductStore;
