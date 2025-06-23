import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { getProducts, createProduct, updateProduct, deleteProduct, CreateProductData } from '@/api/products';
import { getCategories } from '@/api/categories';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const AdminProducts = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const form = useForm<CreateProductData>({
    defaultValues: {
      name: '',
      description: '',
      price: 0,
      stock: 0,
      coverImage: '',
      categoryId: 1,
    },
  });

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast({ 
          title: t('common.error'), 
          description: 'File size must be less than 5MB', 
          variant: 'destructive' 
        });
        return;
      }
      
      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast({ 
          title: t('common.error'), 
          description: 'Only JPEG, PNG, GIF, and WebP images are allowed', 
          variant: 'destructive' 
        });
        return;
      }
      
      setSelectedFile(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File) => {
    try {
      console.log('Starting image upload...');
      
      // Create a FormData object
      const formData = new FormData();
      formData.append('image', file);
      
      // Get the token for authentication
      const token = localStorage.getItem('token');
      
      // Send to your backend API endpoint using the correct base URL
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: formData,
      });
      
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Upload failed with status:', response.status, errorData);
        throw new Error(errorData.error || `Upload failed with status ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Upload successful:', data);
      return data.imagePath;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const createProductMutation = useMutation({
    mutationFn: async (data: CreateProductData) => {
      let imageUrl = data.coverImage;
      
      if (selectedFile) {
        try {
          imageUrl = await uploadImage(selectedFile);
        } catch (error) {
          console.error('Image upload failed:', error);
          toast({ 
            title: t('common.error'), 
            description: 'Image upload failed. Please try again.', 
            variant: 'destructive' 
          });
          throw error;
        }
      }
      
      return createProduct({ ...data, coverImage: imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setIsCreateModalOpen(false);
      form.reset();
      setSelectedFile(null);
      setPreviewImage(null);
      toast({ title: t('common.success'), description: t('products.created') });
    },
    onError: (error) => {
      console.error('Create product error:', error);
      toast({ title: t('common.error'), description: t('products.create_failed'), variant: 'destructive' });
    }
  });

  const updateProductMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateProductData> }) => {
      let imageUrl = data.coverImage;
      
      if (selectedFile) {
        try {
          imageUrl = await uploadImage(selectedFile);
        } catch (error) {
          console.error('Image upload failed:', error);
          toast({ 
            title: t('common.error'), 
            description: 'Image upload failed. Please try again.', 
            variant: 'destructive' 
          });
          throw error;
        }
      }
      
      return updateProduct(id, { ...data, coverImage: imageUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setEditingProduct(null);
      form.reset();
      setSelectedFile(null);
      setPreviewImage(null);
      toast({ title: t('common.success'), description: t('products.updated') });
    },
    onError: (error) => {
      console.error('Update product error:', error);
      toast({ title: t('common.error'), description: t('products.update_failed'), variant: 'destructive' });
    }
  });

  const deleteProductMutation = useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      toast({ title: t('common.success'), description: t('products.deleted') });
    },
    onError: () => {
      toast({ title: t('common.error'), description: t('products.delete_failed'), variant: 'destructive' });
    }
  });

  const products = productsData?.data || [];
  const categories = categoriesData?.data || [];

  const onSubmit = (data: CreateProductData) => {
    editingProduct
      ? updateProductMutation.mutate({ id: editingProduct.id.toString(), data })
      : createProductMutation.mutate(data);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    form.reset({ ...product });
    setPreviewImage(product.coverImage);
    setIsCreateModalOpen(true);
  };

  const handleDelete = (productId: string) => {
    if (window.confirm(t('products.confirm_delete'))) {
      deleteProductMutation.mutate(productId);
    }
  };

  const resetForm = () => {
    setEditingProduct(null);
    form.reset();
    setSelectedFile(null);
    setPreviewImage(null);
    setIsCreateModalOpen(false);
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField name="name" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.name')}</FormLabel>
                      <FormControl><Input {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="description" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.description')}</FormLabel>
                      <FormControl><Textarea {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="grid grid-cols-2 gap-4">
                    <FormField name="price" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('products.price')}</FormLabel>
                        <FormControl>
                          <Input type="number" onChange={(e) => field.onChange(Number(e.target.value))} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="stock" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('products.stock')}</FormLabel>
                        <FormControl>
                          <Input type="number" onChange={(e) => field.onChange(Number(e.target.value))} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                  <FormField name="coverImage" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.image')}</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange}
                          />
                          {previewImage && (
                            <div className="mt-2">
                              <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="w-32 h-32 object-cover rounded"
                              />
                            </div>
                          )}
                          {/* Hidden input to maintain form values */}
                          <input type="hidden" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <FormField name="categoryId" control={form.control} render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('products.category')}</FormLabel>
                      <Select onValueChange={(v) => field.onChange(Number(v))} defaultValue={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder={t('products.select_category')} /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )} />
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending} className="flex-1">
                      {editingProduct ? t('products.update') : t('products.create')}
                    </Button>
                    <Button type="button" variant="outline" onClick={resetForm} className="flex-1">
                      {t('common.cancel')}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input placeholder={t('products.search')} className="pl-10 bg-gray-50 border-gray-200" />
        </div>

        <Card>
          <CardHeader><CardTitle>{t('products.all')} ({products.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">{t('products.image')}</th>
                    <th className="px-4 py-3 text-left">{t('products.name')}</th>
                    <th className="px-4 py-3 text-left">{t('products.category')}</th>
                    <th className="px-4 py-3 text-left">{t('products.price')}</th>
                    <th className="px-4 py-3 text-left">{t('products.stock')}</th>
                    <th className="px-4 py-3 text-left">{t('products.actions')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {products.length > 0 ? products.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <img 
                          src={product.coverImage} 
                          className="w-12 h-12 object-cover rounded" 
                          alt={product.name}
                        />
                      </td>
                      <td className="px-4 py-3">{product.name}</td>
                      <td className="px-4 py-3">{product.category?.name || 'N/A'}</td>
                      <td className="px-4 py-3">{product.price.toLocaleString()} Rwf</td>
                      <td className="px-4 py-3">{product.stock}</td>
                      <td className="px-4 py-3">
                        <div className="flex space-x-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(product)}><Edit className="w-4 h-4" /></Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id.toString())} className="text-red-600 hover:text-red-800">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        {t('products.no_products')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminProducts;
