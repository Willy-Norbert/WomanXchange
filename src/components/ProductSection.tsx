
import ProductCard from './ProductCard';

interface Product {
  id: number;
  name: string;
  price: number;
  coverImage: string;
  averageRating?: number;
}

interface ProductSectionProps {
  products: Product[];
  loading: boolean;
}

const ProductSection = ({ products, loading }: ProductSectionProps) => {
  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Featured Products
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow-md animate-pulse">
                <div className="h-48 bg-gray-300 rounded-t-lg mb-4"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
          Featured Products
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id.toString()}
              image={product.coverImage}
              title={product.name}
              price={`${product.price.toLocaleString()} Rwf`}
              rating={product.averageRating || 5}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductSection;
