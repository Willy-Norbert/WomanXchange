
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
  userId?: number;
  customerEmail?: string;
  customerName?: string;
  shippingAddress: string;
  paymentMethod: string;
  totalPrice: number;
  isPaid: boolean;
  isDelivered: boolean;
  isConfirmedByAdmin?: boolean;
  clientConfirmedPayment?: boolean;
  paidAt?: Date;
  deliveredAt?: Date;
  confirmedAt?: Date;
  clientConfirmedAt?: Date;
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
  customerEmail?: string;
  customerName?: string;
  cartId?: number;
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
  shippingPrice?: number;
}

export const getCart = (cartId?: number | null) => {
  console.log('🔍 API getCart: Getting cart with cartId:', cartId);
  const params: Record<string, string> = {};
  if (cartId) {
    params.cartId = cartId.toString();
  }
  console.log('📤 API getCart: Request params:', params);
  return api.get<Cart>('/orders/cart', { params });
};

export const addToCart = (productId: number, quantity: number, cartId?: number | null) => {
  const data: any = { productId, quantity };
  if (cartId) {
    data.cartId = cartId;
  }
  console.log('📤 API addToCart: Request data:', data);
  return api.post('/orders/cart', data);
};

export const removeFromCart = (productId: number, cartId?: number | null) => {
  const data: any = { productId };
  if (cartId) {
    data.cartId = cartId;
  }
  return api.delete('/orders/cart', { data });
};

export const placeOrder = (data: PlaceOrderData) => {
  console.log('📤 API placeOrder: Request data:', data);
  return api.post<Order>('/orders', data);
};

// Create order by admin/seller
export const createOrder = (data: CreateOrderData) =>
  api.post<Order>('/orders/create', data);

export const getUserOrders = () => api.get<Order[]>('/orders');

export const getAllOrders = async (userRole?: string, userId?: number) => {
  console.log('🔍 getAllOrders called with role:', userRole, 'userId:', userId);
  
  try {
    const response = await api.get<Order[]>('/orders/all');
    console.log('✅ getAllOrders API response:', response);
    return response;
  } catch (error) {
    console.error('❌ getAllOrders API error:', error);
    throw error;
  }
};

// Get individual order by ID
export const getOrderById = (id: number) => api.get<Order>(`/orders/${id}`);

export const updateOrderStatus = (id: number, isPaid?: boolean, isDelivered?: boolean) =>
  api.put(`/orders/${id}/status`, { isPaid, isDelivered });

export const confirmOrderPayment = (id: number) =>
  api.put(`/orders/${id}/confirm-payment`);

// Delete order (Admin only)
export const deleteOrder = (id: number) => api.delete(`/orders/${id}`);

// Update order (Admin only)
export const updateOrder = (id: number, data: Partial<CreateOrderData>) =>
  api.put(`/orders/${id}`, data);
