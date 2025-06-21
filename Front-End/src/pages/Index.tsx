
import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import HeroSection from '@/components/HeroSection';
import ProductSection from '@/components/ProductSection';
import CategorySection from '@/components/CategorySection';
import TestimonialSection from '@/components/TestimonialSection';
import Footer from '@/components/Footer';
import { getProducts } from '@/api/products';
import { Product } from '@/api/products';
import { useLanguage } from '@/contexts/LanguageContext';

const Index = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([]);
  const [topSelling, setTopSelling] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const { t } = useLanguage();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        const products = response.data;
        
        // Split products for different sections (you can implement your own logic)
        const half = Math.ceil(products.length / 2);
        setNewArrivals(products.slice(0, half));
        setTopSelling(products.slice(half));
      } catch (err: any) {
        setError('Failed to load products');
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-gray-600">{t('common.loading')}</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-lg text-red-600">{error}</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <HeroSection />
      <ProductSection title={t('products.newArrivals')} products={newArrivals} />
      <ProductSection title={t('products.topSelling')} products={topSelling} />
      <CategorySection />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Index;
