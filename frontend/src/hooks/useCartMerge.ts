'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { useGuestCartStore } from '@/lib/stores/useGuestCartStore';
import { cartService } from '@/services/cart.service';
import { cartKeys } from '@/hooks/useCart';

/**
 * Hook to automatically and atomically merge local guest cart items
 * into the customer's authenticated server cart upon login or registration.
 */
export function useCartMerge() {
  const queryClient = useQueryClient();
  const t = useTranslations('cart');

  const mergeGuestCart = async () => {
    const guestItems = useGuestCartStore.getState().items;
    if (!guestItems || guestItems.length === 0) {
      return null;
    }

    try {
      const payload = guestItems.map((item) => ({
        variantId: item.variantId,
        quantity: item.quantity,
      }));

      const mergedCart = await cartService.mergeCart(payload);

      // Clear guest cart from localStorage now that server has accepted the items
      useGuestCartStore.getState().clearCart();

      // Seed the query cache with the merged server cart
      queryClient.setQueryData(cartKeys.cart, mergedCart);

      toast.success(t('cartMerged'));
      return mergedCart;
    } catch (error) {
      console.error('Failed to merge guest cart into server cart:', error);
      // Non-fatal: leave items in guest store so shopper does not lose them on network failure
      return null;
    }
  };

  return { mergeGuestCart };
}
