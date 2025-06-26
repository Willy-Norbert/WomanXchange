
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit, Trash2, Eye, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

interface ProductTableProps {
  products: any[];
  onEdit: (product: any) => void;
  onDelete: (productId: string) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({ products, onEdit, onDelete }) => {
  const { t } = useLanguage();

  return (
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
                  <td className="px-4 py-3">
                    <Link 
                      to={`/products/${product.id}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      {product.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{product.category?.name || 'N/A'}</td>
                  <td className="px-4 py-3">{product.price.toLocaleString()} Rwf</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Link to={`/products/${product.id}`}>
                        <Button variant="ghost" size="sm" title="View Product Details">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Link to={`/store`} target="_blank">
                        <Button variant="ghost" size="sm" title="View on Store" className="text-green-600 hover:text-green-800">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button variant="ghost" size="sm" onClick={() => onEdit(product)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onDelete(product.id.toString())} 
                        className="text-red-600 hover:text-red-800"
                      >
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
  );
};
