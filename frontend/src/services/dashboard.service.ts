import api from '../lib/api/axios';

export const dashboardService = {
  // Admin Dashboard endpoints (especially multipart forms)
  // NOTE: Do NOT manually set Content-Type for FormData — axios auto-sets
  // the correct "multipart/form-data; boundary=..." header automatically.
  adminCreateProductFull: async (payload: FormData) => {
    const { data } = await api.post('/dashboard/admin/products/create/', payload);
    return data;
  },
  adminUpdateProductFull: async (slug: string, payload: FormData) => {
    const { data } = await api.put(`/dashboard/admin/products/${slug}/full-update/`, payload);
    return data;
  },
};
