'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@/hooks/useUser';
import { useGuestCartStore, mapGuestItemToCartItemDto } from '@/lib/stores/useGuestCartStore';
import { cartService } from '@/services/cart.service';
import type {
  AddToCartInput,
  CartItemDto,
  CartNotice,
  CartResponseDto,
} from '@/types/cart';
import { DEFAULT_CURRENCY } from '@/types/cart';

export const cartKeys = {
  cart: ['cart'] as const,
};


/**
 * Unified cart hook (facade) providing seamless access to either:
 * - Local guest cart (Zustand + localStorage) when unauthenticated
 * - Persistent server cart (TanStack Query + Prisma/Postgres) when authenticated
 */
export function useCart() {
  const { data: user } = useUser();
  const isAuthenticated = Boolean(user);
  const queryClient = useQueryClient();

  const guestCart = useGuestCartStore();

  const {
    data: serverCart,
    isLoading: isServerCartLoading,
    refetch,
  } = useQuery<CartResponseDto>({
    queryKey: cartKeys.cart,
    queryFn: () => cartService.getCart(),
    enabled: isAuthenticated,
    staleTime: 30 * 1000,
  });

  const addToCartMutation = useMutation({
    mutationFn: (input: AddToCartInput) => cartService.addToCart(input),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart, data);
    },
  });

  const updateQuantityMutation = useMutation({
    mutationFn: ({ id, quantity }: { id: string; quantity: number }) =>
      cartService.updateCartItem(id, { quantity }),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart, data);
    },
  });

  const removeCartItemMutation = useMutation({
    mutationFn: (id: string) => cartService.removeCartItem(id),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart, data);
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: () => cartService.clearCart(),
    onSuccess: (data) => {
      queryClient.setQueryData(cartKeys.cart, data);
    },
  });

  const items: CartItemDto[] = isAuthenticated
    ? serverCart?.items ?? []
    : guestCart.items.map(mapGuestItemToCartItemDto);

  const subtotal: number = isAuthenticated
    ? serverCart?.subtotal ?? 0
    : guestCart.getSubtotal();

  const itemCount: number = isAuthenticated
    ? serverCart?.itemCount ?? 0
    : guestCart.getItemCount();

  const notices: CartNotice[] = isAuthenticated ? serverCart?.notices ?? [] : [];

  const hasUnavailableItems: boolean = isAuthenticated
    ? Boolean(serverCart?.hasUnavailableItems)
    : items.some((item) => !item.isAvailable);

  const isLoading: boolean = isAuthenticated
    ? isServerCartLoading ||
      addToCartMutation.isPending ||
      updateQuantityMutation.isPending ||
      removeCartItemMutation.isPending ||
      clearCartMutation.isPending
    : !guestCart._hasHydrated;

  const isHydrated: boolean = isAuthenticated ? true : guestCart._hasHydrated;

  const addItem = async (input: AddToCartInput) => {
    if (!isAuthenticated) {
      const existing = guestCart.items.find((i) => i.variantId === input.variantId);
      const maxStock = input.variant?.availableStock ?? existing?.availableStock;
      if (existing && maxStock !== null && maxStock !== undefined && existing.quantity >= maxStock) {
        const error = new Error('Requested quantity exceeds available stock');
        (error as Error & { code?: string; availableStock?: number }).code = 'EXCEEDS_AVAILABLE_STOCK';
        (error as Error & { code?: string; availableStock?: number }).availableStock = maxStock;
        throw error;
      }

      guestCart.addItem({
        variantId: input.variantId,
        productId: input.product?.id ?? '',
        productSlug: input.product?.slug ?? '',
        nameAr: input.product?.nameAr ?? '',
        nameEn: input.product?.nameEn ?? '',
        image: input.product?.primaryImage ?? null,
        price: input.variant?.price ?? 0,
        compareAtPrice: input.variant?.compareAtPrice ?? null,
        quantity: input.quantity ?? 1,
        attributes: input.variant?.attributes ?? {},
        stockStatus: input.variant?.stockStatus ?? 'IN_STOCK',
        availableStock: input.variant?.availableStock ?? null,
      });
    } else {
      await addToCartMutation.mutateAsync(input);
    }
  };

  const updateQuantity = async (id: string, quantity: number) => {
    if (!isAuthenticated) {
      guestCart.updateQuantity(id, quantity);
    } else {
      const targetItem = serverCart?.items.find((i) => i.id === id || i.variantId === id);
      const cartItemId = targetItem ? targetItem.id : id;
      await updateQuantityMutation.mutateAsync({ id: cartItemId, quantity });
    }
  };

  const removeItem = async (id: string) => {
    if (!isAuthenticated) {
      guestCart.removeItem(id);
    } else {
      const targetItem = serverCart?.items.find((i) => i.id === id || i.variantId === id);
      const cartItemId = targetItem ? targetItem.id : id;
      await removeCartItemMutation.mutateAsync(cartItemId);
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) {
      guestCart.clearCart();
    } else {
      await clearCartMutation.mutateAsync();
    }
  };

  return {
    items,
    subtotal,
    itemCount,
    currency: serverCart?.currency ?? DEFAULT_CURRENCY,
    isLoading,
    isHydrated,
    hasUnavailableItems,
    notices,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    refetch,
    isAuthenticated,
  };
}
