import api from '@/lib/api/axios';
import type { ApiEnvelope, AuthUser } from '@/types/auth';
import type { Address, AddressUpdate, NewAddress, UpdateProfilePayload } from '@/types/user';

/**
 * Customer profile and delivery addresses.
 *
 * Every call is scoped server-side to the signed-in customer, so there is no user
 * id in any path — a caller cannot address another account even by accident.
 */
export const userService = {
  async getProfile(): Promise<AuthUser> {
    const { data } = await api.get<ApiEnvelope<{ user: AuthUser }>>('/profile');
    return data.data.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    const { data } = await api.patch<ApiEnvelope<{ user: AuthUser }>>('/profile', payload);
    return data.data.user;
  },

  async listAddresses(): Promise<Address[]> {
    const { data } = await api.get<ApiEnvelope<{ addresses: Address[] }>>('/addresses');
    return data.data.addresses;
  },

  async createAddress(payload: NewAddress): Promise<Address> {
    const { data } = await api.post<ApiEnvelope<{ address: Address }>>('/addresses', payload);
    return data.data.address;
  },

  async updateAddress(id: string, payload: AddressUpdate): Promise<Address> {
    const { data } = await api.patch<ApiEnvelope<{ address: Address }>>(`/addresses/${id}`, payload);
    return data.data.address;
  },

  async deleteAddress(id: string): Promise<void> {
    await api.delete(`/addresses/${id}`);
  },
};
