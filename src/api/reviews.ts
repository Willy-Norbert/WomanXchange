
import api from './api';

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  comment: string;
  createdAt: string;
  user: {
    name: string;
  };
}

export const createReview = (productId: number, data: { rating: number; comment: string }) =>
  api.post<Review>(`/products/${productId}/reviews`, data);

export const getReviews = (productId: number) =>
  api.get<Review[]>(`/products/${productId}/reviews`);

export const updateReview = (id: number, data: { rating: number; comment: string }) =>
  api.put<Review>(`/products/reviews/${id}`, data);

export const deleteReview = (id: number) =>
  api.delete(`/products/reviews/${id}`);
