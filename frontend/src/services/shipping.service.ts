import api from '@/lib/api/axios';
import type { ShippingRateDto } from '@/types/checkout';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const shippingService = {
  /** List active shipping zones (public; drives the governorate dropdown). */
  listRates: async (): Promise<ShippingRateDto[]> => {
    const response = await api.get<ApiResponse<{ rates: ShippingRateDto[] }>>('/shipping/rates');
    return response.data.data.rates;
  },

  /** Delivery fee + estimate for one governorate. */
  getRate: async (governorate: string): Promise<ShippingRateDto> => {
    const response = await api.get<ApiResponse<ShippingRateDto>>(
      `/shipping/rates/${encodeURIComponent(governorate)}`
    );
    return response.data.data;
  },
};
