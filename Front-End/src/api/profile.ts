
import api from './api';

export interface ProfileData {
  id: number;
  name: string;
  email: string;
  role: string;
  phone?: string;
  address?: string;
  bio?: string;
  businessName?: string;
  gender?: string;
  sellerStatus?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProfileUpdateData {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  bio?: string;
  businessName?: string;
  gender?: string;
}

export interface AdminProfileUpdateData extends ProfileUpdateData {
  role?: string;
  sellerStatus?: string;
  isActive?: boolean;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Get current user profile
export const getUserProfile = async (): Promise<ProfileData> => {
  const response = await api.get('/profile/me');
  return response.data;
};

// Update current user profile
export const updateUserProfile = async (data: ProfileUpdateData): Promise<ProfileData> => {
  const response = await api.put('/profile/me', data);
  return response.data;
};

// Change password
export const changePassword = async (data: ChangePasswordData): Promise<{ message: string }> => {
  const response = await api.put('/profile/change-password', data);
  return response.data;
};

// Admin: Get all user profiles
export const getAllUserProfiles = async (): Promise<ProfileData[]> => {
  const response = await api.get('/profile/all');
  return response.data;
};

// Admin: Update any user profile
export const updateAnyUserProfile = async (userId: number, data: AdminProfileUpdateData): Promise<ProfileData> => {
  const response = await api.put(`/profile/${userId}`, data);
  return response.data;
};

// Admin: Delete user profile
export const deleteUserProfile = async (userId: number): Promise<{ message: string }> => {
  const response = await api.delete(`/profile/${userId}`);
  return response.data;
};
