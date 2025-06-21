
import React from 'react';
import ProductCard from './ProductCard';
import { Link } from "react-router-dom";
import { Product } from '@/api/products';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductSectionProps {
  title: string;
  products: Product[];
}

const ProductSection = ({ title, products }: ProductSectionProps) => {
  const { t } = useLanguage();

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          {title}
        </h2>
        
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">{t('products.no_products_available')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {products.map((product, index) => (
              <div key={product.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <ProductCard 
                  id={product.id.toString()}
                  image={product.coverImage}
                  title={product.name}
                  price={`${product.price.toLocaleString()} Rwf`}
                  rating={5}
                />
              </div>
            ))}
          </div>
        )}
        
        <div className="text-center mt-8">
          <Link to="/products">
            <button className="text-black hover:text-purple-700 border border-gray-400 rounded-md px-4 py-2 transition-all duration-300 transform hover:scale-105">
              {t('products.view_more')}
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
