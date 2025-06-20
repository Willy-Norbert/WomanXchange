
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getProductById } from '@/api/products';

const SingleProduct = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: product, isLoading, error } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error loading product</div>;
  if (!product) return <div className="p-8">Product not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-4">{product.data.name}</h1>
      <img 
        src={product.data.coverImage} 
        alt={product.data.name}
        className="w-full max-w-md h-64 object-cover rounded-lg mb-4"
      />
      <p className="text-gray-600 mb-4">{product.data.description}</p>
      <p className="text-2xl font-bold text-green-600">
        {product.data.price.toLocaleString()} Rwf
      </p>
    </div>
  );
};

export default SingleProduct;
