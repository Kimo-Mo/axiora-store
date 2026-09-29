import api from '../lib/api/axios';
import { UpdateProfilePayload, AdminAddUserPayload } from '@/types';
import type { AdminUpdateUserPayload, UserListParams } from '@/types/admin/users';

export const userService = {
  // Public user methods
  getUser: async (userId: string) => {
    const { data } = await api.get(`/users/user/${userId}/`);
    return data;
  },
  getMyProfile: async () => {
    const { data } = await api.get('/users/user/my/profile');
    return data;
  },
  getUserProfile: async (userId: string) => {
    const { data } = await api.get(`/users/user/${userId}/profile`);
    return data;
  },
  getActivityLog: async (userId: string, pageSize: number = 5) => {
    const { data } = await api.get(`/users/user/${userId}/logs`, {
      params: { page_size: pageSize },
    });
    return data;
  },
  updateProfile: async (payload: UpdateProfilePayload) => {
    const { data } = await api.patch('/users/user/my/profile/update/', payload);
    return data;
  },
  getUserCurrency: async (userId: string) => {
    const { data } = await api.get(`/users/user/${userId}/profile/currency/`);
    return data;
  },
  updateUserCurrency: async (userId: string, payload: { currency: string }) => {
    const { data } = await api.put(`/users/user/${userId}/profile/currency/`, payload);
    return data;
  },
  getCurrentUserLocation: async (userId: string) => {
    const { data } = await api.get(`/users/user/${userId}/location/current/`);
    return data;
  },

  // Admin user methods
  adminUsersList: async (params?: UserListParams) => {
    const { data } = await api.get('/users/admin/users', { params });
    return data;
  },
  adminAddUser: async (payload: AdminAddUserPayload) => {
    const { data } = await api.post('/users/admin/users/', payload);
    return data;
  },
  adminUpdateUser: async (userId: string, payload: AdminUpdateUserPayload) => {
    const { data } = await api.patch(`/users/user/${userId}/profile/update/`, payload);
    return data;
  },
  adminUpdateUserRole: async (userId: string, payload: { role: string }) => {
    const { data } = await api.patch(`/users/admin/users/${userId}/update/role`, payload);
    return data;
  },
  adminDeleteUser: async (userId: string) => {
    const { data } = await api.delete(`/users/user/${userId}/delete/`);
    return data;
  },
};
