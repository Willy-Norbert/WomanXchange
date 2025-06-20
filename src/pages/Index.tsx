
import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/components/HeroSection';
import CategorySection from '@/components/CategorySection';
import ProductSection from '@/components/ProductSection';
import TestimonialSection from '@/components/TestimonialSection';
import TopBanner from '@/components/TopBanner';
import { getProducts } from '@/api/products';
import { getCategories } from '@/api/categories';

const Index = () => {
  const { data: products, isLoading: productsLoading, error: productsError } = useQuery({
    queryKey: ['products'],
    queryFn: getProducts,
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  if (productsError) {
    console.error('Error fetching products:', productsError);
  }

  return (
    <div className="min-h-screen bg-white">
      <TopBanner />
      <Header />
      <HeroSection />
      <CategorySection categories={categories?.data || []} loading={categoriesLoading} />
      <ProductSection products={products?.data || []} loading={productsLoading} />
      <TestimonialSection />
      <Footer />
    </div>
  );
};

export default Index;
