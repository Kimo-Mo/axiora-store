import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItemDto, GuestCartItem } from '@/types/cart';
import { MAX_CART_ITEM_QUANTITY } from '@/types/cart';

interface GuestCartState {
  items: GuestCartItem[];
  _hasHydrated: boolean;
  setHasHydrated: (hydrated: boolean) => void;
  addItem: (item: Omit<GuestCartItem, 'id'>) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  removeItem: (variantId: string) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getItemCount: () => number;
}

export const useGuestCartStore = create<GuestCartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,

      setHasHydrated: (hydrated: boolean) => {
        set({ _hasHydrated: hydrated });
      },

      addItem: (newItem) => {
        const { items } = get();
        const existingIndex = items.findIndex((i) => i.variantId === newItem.variantId);

        if (existingIndex > -1) {
          const updatedItems = [...items];
          const existing = updatedItems[existingIndex];
          const maxStock = newItem.availableStock ?? existing.availableStock;
          let targetQuantity = existing.quantity + (newItem.quantity || 1);

          if (maxStock !== null && maxStock !== undefined && targetQuantity > maxStock) {
            targetQuantity = maxStock;
          }

          updatedItems[existingIndex] = {
            ...existing,
            ...newItem,
            quantity: targetQuantity,
          };
          set({ items: updatedItems });
        } else {
          const maxStock = newItem.availableStock;
          let initialQuantity = newItem.quantity || 1;
          if (maxStock !== null && maxStock !== undefined && initialQuantity > maxStock) {
            initialQuantity = maxStock;
          }

          set({
            items: [
              ...items,
              {
                ...newItem,
                id: newItem.variantId,
                quantity: initialQuantity,
              },
            ],
          });
        }
      },

      updateQuantity: (variantId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(variantId);
          return;
        }

        const { items } = get();
        const updated = items.map((item) => {
          if (item.variantId === variantId) {
            let targetQuantity = quantity;
            if (item.availableStock !== null && item.availableStock !== undefined && targetQuantity > item.availableStock) {
              targetQuantity = item.availableStock;
            }
            return { ...item, quantity: targetQuantity };
          }
          return item;
        });

        set({ items: updated });
      },

      removeItem: (variantId: string) => {
        set((state) => ({
          items: state.items.filter((i) => i.variantId !== variantId),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      getSubtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
      },

      getItemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: 'axiora_guest_cart',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

/**
 * Maps an offline guest cart snapshot to the unified CartItemDto interface.
 */
export function mapGuestItemToCartItemDto(item: GuestCartItem): CartItemDto {
  const lineTotal = item.price * item.quantity;
  const isAvailable =
    item.stockStatus !== 'OUT_OF_STOCK' &&
    (item.availableStock === null || item.availableStock >= item.quantity);

  return {
    id: item.id || item.variantId,
    variantId: item.variantId,
    quantity: item.quantity,
    unitPrice: item.price,
    compareAtPrice: item.compareAtPrice,
    lineTotal,
    availableStock: item.availableStock ?? MAX_CART_ITEM_QUANTITY,
    stockStatus: item.stockStatus,
    isAvailable,
    product: {
      id: item.productId,
      slug: item.productSlug,
      nameAr: item.nameAr,
      nameEn: item.nameEn,
      primaryImage: item.image,
    },
    variant: {
      id: item.variantId,
      sku: '',
      attributes: item.attributes || {},
    },
  };
}

