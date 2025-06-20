
import api from './api';

export const generatePaymentCode = (orderId: number) =>
  api.post(`/payments/${orderId}/generate-code`);

export const confirmClientPayment = (orderId: number) =>
  api.post(`/payments/${orderId}/confirm-client`);

export const confirmPaymentByAdmin = (orderId: number) =>
  api.post(`/payments/${orderId}/confirm-admin`);
