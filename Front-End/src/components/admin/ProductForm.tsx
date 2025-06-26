
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CreateProductData } from '@/api/products';
import { useLanguage } from '@/contexts/LanguageContext';
import { ImageUpload } from './ImageUpload';
import { CustomVariantsInput } from './CustomVariantsInput';

interface ProductFormProps {
  onSubmit: (data: CreateProductData) => void;
  editingProduct: any;
  categories: any[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onUrlChange: (url: string) => void;
  previewImage: string | null;
  isLoading: boolean;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  editingProduct,
  categories,
  onFileChange,
  onUrlChange,
  previewImage,
  isLoading,
  onCancel
}) => {
  const { t } = useLanguage();
  
  const form = useForm<CreateProductData>({
    defaultValues: {
      name: editingProduct?.name || '',
      description: editingProduct?.description || '',
      price: editingProduct?.price || 0,
      stock: editingProduct?.stock || 0,
      coverImage: editingProduct?.coverImage || '',
      categoryId: editingProduct?.categoryId || 1,
      colors: editingProduct?.colors || [],
      sizes: editingProduct?.sizes || [],
    },
  });

  React.useEffect(() => {
    if (editingProduct) {
      form.reset({ 
        ...editingProduct,
        colors: editingProduct.colors || [],
        sizes: editingProduct.sizes || []
      });
    }
  }, [editingProduct, form]);

  const handleSubmit = (data: CreateProductData) => {
    const formattedData = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      categoryId: Number(data.categoryId)
    };
    onSubmit(formattedData);
  };

  return (
    <div className="max-h-[80vh] overflow-y-auto pr-2">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          {/* Basic Product Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Basic Information</h3>
            
            <FormField name="name" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>{t('products.name')}</FormLabel>
                <FormControl><Input {...field} placeholder="Enter product name" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="description" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>{t('products.description')}</FormLabel>
                <FormControl>
                  <Textarea 
                    {...field} 
                    placeholder="Enter product description"
                    className="min-h-[100px] resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField name="categoryId" control={form.control} render={({ field }) => (
              <FormItem>
                <FormLabel>{t('products.category')}</FormLabel>
                <Select onValueChange={(v) => field.onChange(v)} defaultValue={field.value?.toString()}>
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
          </div>

          {/* Pricing and Inventory */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Pricing & Inventory</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField name="price" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.price')} (RWF)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      step="0.01" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="0.00"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField name="stock" control={form.control} render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('products.stock')}</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={(e) => field.onChange(e.target.value)}
                      placeholder="0"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>
          </div>

          {/* Product Images */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Images</h3>
            
            <FormField name="coverImage" control={form.control} render={({ field }) => (
              <ImageUpload 
                onFileChange={onFileChange}
                onUrlChange={onUrlChange}
                previewImage={previewImage}
                field={field}
              />
            )} />
          </div>

          {/* Product Variants */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Product Variants</h3>
            
            <FormField name="colors" control={form.control} render={({ field }) => (
              <CustomVariantsInput
                label="Colors"
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Enter color (e.g., Red, Blue, Black)"
              />
            )} />

            <FormField name="sizes" control={form.control} render={({ field }) => (
              <CustomVariantsInput
                label="Sizes"
                value={field.value || []}
                onChange={field.onChange}
                placeholder="Enter size (e.g., S, M, L, XL, 42, 44)"
              />
            )} />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
