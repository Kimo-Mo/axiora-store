import api from '@/lib/api/axios';
import type {
  AddToCartInput,
  CartResponseDto,
  MergeCartItemInput,
  UpdateCartItemInput,
} from '@/types/cart';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const cartService = {
  /** Fetch the authenticated user's current cart. */
  getCart: async (): Promise<CartResponseDto> => {
    const response = await api.get<ApiResponse<CartResponseDto>>('/cart');
    return response.data.data;
  },

  /** Add an item to the authenticated user's cart. */
  addToCart: async (payload: AddToCartInput): Promise<CartResponseDto> => {
    const response = await api.post<ApiResponse<CartResponseDto>>('/cart/items', {
      variantId: payload.variantId,
      quantity: payload.quantity ?? 1,
    });
    return response.data.data;
  },

  /** Update the quantity of an item in the cart. */
  updateCartItem: async (cartItemId: string, payload: UpdateCartItemInput): Promise<CartResponseDto> => {
    const response = await api.patch<ApiResponse<CartResponseDto>>(`/cart/items/${cartItemId}`, payload);
    return response.data.data;
  },

  /** Remove an item from the cart. */
  removeCartItem: async (cartItemId: string): Promise<CartResponseDto> => {
    const response = await api.delete<ApiResponse<CartResponseDto>>(`/cart/items/${cartItemId}`);
    return response.data.data;
  },

  /** Clear all items from the cart. */
  clearCart: async (): Promise<CartResponseDto> => {
    const response = await api.delete<ApiResponse<CartResponseDto>>('/cart');
    return response.data.data;
  },

  /** Merge guest cart items into the authenticated server cart. */
  mergeCart: async (items: MergeCartItemInput[]): Promise<CartResponseDto> => {
    const response = await api.post<ApiResponse<CartResponseDto>>('/cart/merge', { items });
    return response.data.data;
  },
};
