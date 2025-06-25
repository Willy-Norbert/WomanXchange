
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Filter, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getProducts, CreateProductData } from '@/api/products';
import { getCategories } from '@/api/categories';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductForm } from '@/components/admin/ProductForm';
import { ProductTable } from '@/components/admin/ProductTable';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useProductMutations } from '@/hooks/useProductMutations';

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const {
    selectedFile,
    previewImage,
    imageUrl,
    handleFileChange,
    handleUrlChange,
    uploadImage,
    resetImageUpload,
    setPreviewImage
  } = useImageUpload();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user?.role === 'buyer') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  const { data: productsData, isLoading: productsLoading, error: productsError, refetch: refetchProducts } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    retry: 3,
  });

  const resetForm = () => {
    setEditingProduct(null);
    resetImageUpload();
    setIsCreateModalOpen(false);
  };

  const {
    createProductMutation,
    updateProductMutation,
    deleteProductMutation
  } = useProductMutations(uploadImage, selectedFile, imageUrl, resetForm);

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  // Filter products based on search term
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data: CreateProductData) => {
    console.log('Submitting product data:', data);
    if (editingProduct) {
      updateProductMutation.mutate({ id: editingProduct.id.toString(), data });
    } else {
      createProductMutation.mutate(data);
    }
  };

  const handleEdit = (product: any) => {
    console.log('Editing product:', product);
    setEditingProduct(product);
    setPreviewImage(product.coverImage);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm(t('products.confirm_delete') || 'Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  const handleRefresh = () => {
    refetchProducts();
  };

  // Don't render anything if user is not authorized
  if (!user || user.role === 'buyer') {
    return null;
  }

  if (productsLoading || categoriesLoading) {
    return (
      <DashboardLayout currentPage="admin-products">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <div className="text-lg text-gray-600">{t('common.loading') || 'Loading...'}</div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (productsError) {
    return (
      <DashboardLayout currentPage="admin-products">
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-lg text-red-600">{t('products.load_error') || 'Failed to load products'}</div>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="admin-products">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('products.title') || 'Products'}</h1>
            <p className="text-gray-600 mt-1">
              Manage your product catalog ({filteredProducts.length} of {products.length} products)
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700" onClick={resetForm}>
                  <Plus className="w-4 h-4 mr-2" />
                  {t('products.add_product') || 'Add Product'}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh]">
                <DialogHeader>
                  <DialogTitle>
                    {editingProduct ? 
                      (t('products.edit_product') || 'Edit Product') : 
                      (t('products.create_product') || 'Create New Product')
                    }
                  </DialogTitle>
                </DialogHeader>
                <ProductForm
                  onSubmit={onSubmit}
                  editingProduct={editingProduct}
                  categories={categories}
                  onFileChange={handleFileChange}
                  onUrlChange={handleUrlChange}
                  previewImage={previewImage}
                  isLoading={createProductMutation.isPending || updateProductMutation.isPending}
                  onCancel={resetForm}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder={t('products.search') || 'Search products by name, description, or category...'}
              className="pl-10 bg-gray-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && searchTerm && (
          <div className="text-center py-8">
            <p className="text-gray-500">No products found matching "{searchTerm}"</p>
            <Button 
              variant="link" 
              onClick={() => setSearchTerm('')}
              className="mt-2"
            >
              Clear search
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;
