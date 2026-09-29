import api from '../lib/api/axios';
import { CartPayload } from '@/types';

export const cartService = {
  getCart: async () => {
    const { data } = await api.get('/cart/');
    return data;
  },
  addToCart: async (payload: CartPayload) => {
    const { data } = await api.post('/cart/items/', payload);
    return data;
  },
  clearCart: async () => {
    const { data } = await api.delete('/cart/');
    return data;
  },
  updateCartItem: async (payload: CartPayload) => {
    const { data } = await api.patch('/cart/items/update/', payload);
    return data;
  },
  deleteCartItem: async (payload: CartPayload) => {
    const { data } = await api.delete('/cart/items/delete/', { data: payload });
    return data;
  },
};
