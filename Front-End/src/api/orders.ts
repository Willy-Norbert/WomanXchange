
import api from './api';

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
  userId?: number;
  items: CartItem[];
}

export interface Order {
  id: number;
  userId: number;
  shippingAddress: string;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  isConfirmedByAdmin?: boolean;
  paidAt?: Date;
  deliveredAt?: Date;
  confirmedAt?: Date;
  createdAt: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
  items: {
    id: number;
    productId: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
      coverImage: string;
    };
  }[];
}

export interface PlaceOrderData {
  shippingAddress: string;
  paymentMethod: string;
}

export interface CreateOrderData {
  userId: number;
  shippingAddress: string;
  paymentMethod: string;
  items: {
    productId: number;
    quantity: number;
    price: number;
  }[];
  totalPrice: number;
}

export const getCart = (cartId?: number | null) => {
  console.log('API: Getting cart with cartId:', cartId);
  const params = cartId ? { cartId: cartId.toString() } : {};
  return api.get<Cart>('/orders/cart', { params });
};

export const addToCart = (productId: number, quantity: number) => {
  const data = { productId, quantity };
  console.log('API addToCart called with:', data);
  return api.post('/orders/cart', data);
};

export const removeFromCart = (productId: number, cartId?: number | null) => {
  const data = { productId, ...(cartId && { cartId }) };
  return api.delete('/orders/cart', { data });
};

export const placeOrder = (data: PlaceOrderData) =>
  api.post<Order>('/orders', data);

// Create order by admin/seller
export const createOrder = (data: CreateOrderData) =>
  api.post<Order>('/orders/create', data);

export const getUserOrders = () => {
  console.log('API: Getting user orders');
  return api.get<Order[]>('/orders');
};

export const getAllOrders = () => {
  console.log('API: Getting all orders');
  return api.get<Order[]>('/orders/all');
};

// Get individual order by ID
export const getOrderById = (id: number) => {
  console.log('API: Getting order by ID:', id);
  return api.get<Order>(`/orders/${id}`);
};

export const updateOrderStatus = (id: number, isPaid?: boolean, isDelivered?: boolean) => {
  console.log('API: Updating order status:', id, { isPaid, isDelivered });
  return api.put(`/orders/${id}/status`, { isPaid, isDelivered });
};

export const confirmOrderPayment = (id: number) => {
  console.log('API: Confirming order payment:', id);
  return api.put(`/orders/${id}/confirm-payment`);
};

// Delete order (Admin only)
export const deleteOrder = (id: number) => {
  console.log('API: Deleting order:', id);
  return api.delete(`/orders/${id}`);
};

// Update order (Admin only)
export const updateOrder = (id: number, data: Partial<CreateOrderData>) => {
  console.log('API: Updating order:', id, data);
  return api.put(`/orders/${id}`, data);
};
