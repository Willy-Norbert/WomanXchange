
import api from './api';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  coverImage: string;
  categoryId: number;
  createdById: number;
  category?: {
    id: number;
    name: string;
    description: string;
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  stock: number;
  coverImage: string;
  categoryId: number;
}

export const getProducts = () => api.get<Product[]>('/products');

export const getProductById = (id: string) => api.get<Product>(`/products/${id}`);

export const createProduct = (data: CreateProductData) => 
  api.post<Product>('/products', data);

export const updateProduct = (id: string, data: Partial<CreateProductData>) =>
  api.put<Product>(`/products/${id}`, data);

export const deleteProduct = (id: string) => api.delete(`/products/${id}`);
