
import api from './api';

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  isActive: boolean;
  sellerStatus?: string;
  businessName?: string;
  createdAt: string;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: string;
  isActive?: boolean;
}

// Get all users (Admin only)
export const getAllUsers = () => api.get<User[]>('/auth/users');

// Delete user (Admin only)
export const deleteUser = (userId: number) => api.delete(`/auth/users/${userId}`);

// Update user (Admin only)
export const updateUser = (userId: number, data: UpdateUserData) => 
  api.put<User>(`/auth/users/${userId}`, data);

// Get user profile
export const getUserProfile = () => api.get('/auth/profile');

// Update user profile
export const updateUserProfile = (data: any) => api.put('/auth/profile', data);
