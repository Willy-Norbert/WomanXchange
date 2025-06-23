
import React from 'react';
import { Input } from '@/components/ui/input';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImageUploadProps {
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  previewImage: string | null;
  field: any;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({ onFileChange, previewImage, field }) => {
  const { t } = useLanguage();

  return (
    <FormItem>
      <FormLabel>{t('products.image')}</FormLabel>
      <FormControl>
        <div className="space-y-2">
          <Input 
            type="file" 
            accept="image/*" 
            onChange={onFileChange}
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
  );
};
