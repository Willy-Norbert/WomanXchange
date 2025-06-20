
import api from './api';

export interface Category {
  id: number;
  name: string;
  description?: string;
}

export const getCategories = () => api.get<Category[]>('/categories');

export const getCategoryById = (id: number) => 
  api.get<Category>(`/categories/${id}`);

export const createCategory = (data: Omit<Category, 'id'>) =>
  api.post<Category>('/categories', data);

export const updateCategory = (id: number, data: Partial<Category>) =>
  api.put<Category>(`/categories/${id}`, data);

export const deleteCategory = (id: number) =>
  api.delete(`/categories/${id}`);

export const getProductsByCategory = (id: number) =>
  api.get(`/categories/${id}/products`);
