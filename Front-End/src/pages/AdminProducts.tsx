import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus } from 'lucide-react';
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
    if (!user) navigate('/login');
    if (user?.role === 'buyer') navigate('/');
  }, [user, navigate]);

  const { data: productsData, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories
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

  const onSubmit = (data: CreateProductData) => {
    editingProduct
      ? updateProductMutation.mutate({ id: editingProduct.id.toString(), data })
      : createProductMutation.mutate(data);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setPreviewImage(product.coverImage);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm(t('products.confirm_delete'))) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (!user || user.role === 'buyer') return null;

  if (productsLoading) {
    return (
      <DashboardLayout currentPage="admin-products">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
      </DashboardLayout>
    );
  }

  if (productsError) {
    return (
      <DashboardLayout currentPage="admin-products">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">{t('products.load_error')}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout currentPage="admin-products">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{t('products.title')}</h1>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={resetForm}>
                <Plus className="w-4 h-4 mr-2" />
                {t('products.add_product')}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? t('products.edit_product') : t('products.create_product')}</DialogTitle>
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

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder={t('products.search')} className="pl-10 bg-gray-50 border-gray-200" />
        </div>

        <ProductTable
          products={products}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;
