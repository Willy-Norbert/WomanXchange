
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

export const useImageUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

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

  const resetImageUpload = () => {
    setSelectedFile(null);
    setPreviewImage(null);
  };

  return {
    selectedFile,
    previewImage,
    handleFileChange,
    uploadImage,
    resetImageUpload,
    setPreviewImage
  };
};
