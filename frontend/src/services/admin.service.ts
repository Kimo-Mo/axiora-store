import api from '@/lib/api/axios';
import type { AdminUser, UserListParams, UserProfileResponse } from '@/types/admin/users';

/**
 * Administrator user management.
 *
 * These endpoints are NOT implemented yet — the `/api/v1/admin` namespace is
 * mounted and guarded (so the authorization boundary is real) but empty, and the
 * routes arrive with the admin phases. Until then these calls return 404, exactly
 * as they did against the retired Django backend.
 *
 * They live here rather than in `user.service` so it stays unambiguously
 * customer-scoped: nothing in that file can address an account other than the
 * signed-in customer's own.
 */
export const adminService = {
  async listUsers(params: UserListParams) {
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  async getUser(userId: string) {
    const { data } = await api.get(`/admin/users/${userId}`);
    return data as UserProfileResponse;
  },

  async deleteUser(userId: string): Promise<void> {
    await api.delete(`/admin/users/${userId}`);
  },

  async updateUserRole(userId: string, role: string): Promise<void> {
    await api.patch(`/admin/users/${userId}/role`, { role });
  },

  /**
   * Staff-initiated password reset. Distinct from the removed self-service
   * forgot-password flow: an administrator setting a customer's password is a
   * legitimate admin action and does not depend on a mail provider.
   */
  async resetUserPassword(userId: string, newPassword: string): Promise<void> {
    await api.post(`/admin/users/${userId}/password`, { newPassword });
  },
};

export type { AdminUser };
