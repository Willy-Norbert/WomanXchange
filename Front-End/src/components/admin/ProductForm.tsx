
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

interface ProductFormProps {
  onSubmit: (data: CreateProductData) => void;
  editingProduct: any;
  categories: any[];
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewImage: string | null;
  isLoading: boolean;
  onCancel: () => void;
}

export const ProductForm: React.FC<ProductFormProps> = ({
  onSubmit,
  editingProduct,
  categories,
  onFileChange,
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
    },
  });

  React.useEffect(() => {
    if (editingProduct) {
      form.reset({ ...editingProduct });
    }
  }, [editingProduct, form]);

  const handleSubmit = (data: CreateProductData) => {
    // Ensure price and stock are numbers
    const formattedData = {
      ...data,
      price: Number(data.price),
      stock: Number(data.stock),
      categoryId: Number(data.categoryId)
    };
    onSubmit(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
                <Input type="number" step="0.01" {...field} onChange={(e) => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField name="stock" control={form.control} render={({ field }) => (
            <FormItem>
              <FormLabel>{t('products.stock')}</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={(e) => field.onChange(e.target.value)} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField name="coverImage" control={form.control} render={({ field }) => (
          <ImageUpload 
            onFileChange={onFileChange}
            previewImage={previewImage}
            field={field}
          />
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
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={isLoading} className="flex-1">
            {editingProduct ? t('products.update') : t('products.create')}
          </Button>
          <Button type="button" variant="outline" onClick={onCancel} className="flex-1">
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </Form>
  );
};
