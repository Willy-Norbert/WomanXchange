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
  userId: number;
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
  paidAt?: Date;
  deliveredAt?: Date;
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

export const getCart = (guestId?: string) => {
  const params = guestId ? { guestId } : {};
  return api.get<Cart>('/orders/cart', { params });
};

export const addToCart = (productId: number, quantity: number, guestId?: string) => {
  const data = { productId, quantity };
  if (guestId) data.guestId = guestId;
  return api.post('/orders/cart', data);
};

export const removeFromCart = (productId: number, guestId?: string) => {
  const data = { productId };
  if (guestId) data.guestId = guestId;
  return api.delete('/orders/cart', { data });
};

export const placeOrder = (data: PlaceOrderData) =>
  api.post<Order>('/orders', data);

export const getUserOrders = () => api.get<Order[]>('/orders');

export const getAllOrders = () => api.get<Order[]>('/orders/all');

export const updateOrderStatus = (id: number, isPaid?: boolean, isDelivered?: boolean) =>
  api.put(`/orders/${id}/status`, { isPaid, isDelivered });

// New function for admin to confirm payment
export const confirmOrderPayment = (id: number) =>
  api.put(`/orders/${id}/confirm-payment`);
