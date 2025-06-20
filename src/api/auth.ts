
import api from './api';

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'seller' | 'buyer';
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'seller' | 'buyer';
  token: string;
}

export const loginUser = (data: LoginData) =>
  api.post<UserResponse>('/auth/login', data);

export const registerUser = (data: RegisterData) =>
  api.post<UserResponse>('/auth/register', data);
