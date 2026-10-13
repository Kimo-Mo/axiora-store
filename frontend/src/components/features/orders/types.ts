import type { AxiosError } from 'axios';
import { ORDER_STATUS_FILTERS, type OrderStatusFilter } from '@/types/order';

export { ORDER_STATUS_FILTERS, type OrderStatusFilter };

export const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  return (
    axiosError.response?.data?.message ||
    axiosError.response?.data?.error ||
    (error instanceof Error ? error.message : null) ||
    fallback
  );
};
