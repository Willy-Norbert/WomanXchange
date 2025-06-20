
import api from './api';

export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  categoryId: number;
  coverImage: string;
  averageRating: number;
  numReviews: number;
  category?: {
    id: number;
    name: string;
  };
}

export const getProducts = () => api.get<Product[]>('/products');

export const getProductById = (id: number) => 
  api.get<Product>(`/products/${id}`);

export const createProduct = (data: Omit<Product, 'id' | 'averageRating' | 'numReviews'>) =>
  api.post<Product>('/products', data);

export const updateProduct = (id: number, data: Partial<Product>) =>
  api.put<Product>(`/products/${id}`, data);

export const deleteProduct = (id: number) =>
  api.delete(`/products/${id}`);
