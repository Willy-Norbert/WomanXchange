
import api from './api';

export interface OrderItem {
  id: number;
  productId: number;
  quantity: number;
  price: number;
  product: {
    id: number;
    name: string;
    coverImage: string;
  };
}

export interface Order {
  id: number;
  userId: number;
  shippingAddress: any;
  paymentMethod?: string;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    coverImage: string;
  };
}

export interface Cart {
  id: number;
  userId: number;
  items: CartItem[];
}

// Cart operations
export const getCart = () => api.get<Cart>('/orders/cart');

export const addToCart = (productId: number, quantity: number) =>
  api.post('/orders/cart', { productId, quantity });

export const removeFromCart = (productId: number) =>
  api.delete('/orders/cart', { data: { productId } });

// Order operations
export const placeOrder = (data: { shippingAddress: any; paymentMethod: string }) =>
  api.post<Order>('/orders', data);

export const getUserOrders = () => api.get<Order[]>('/orders');

export const getAllOrders = () => api.get<Order[]>('/orders/all');

export const updateOrderStatus = (id: number, data: { isPaid?: boolean; isDelivered?: boolean }) =>
  api.put(`/orders/${id}/status`, data);
