import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem, CartResponse } from '@/types';
import type { LegacyProduct } from '@/types/legacyCatalog';
import { legacyCatalogService } from '@/services/legacyCatalog.service';
import { cartService } from '@/services/cart.service';
import type { ApiResponse } from '@/types';

type CartAction = 'idle' | 'sync' | 'add' | 'remove' | 'update' | 'clear' | 'refresh';

interface ServerCartItem {
  product: {
    id: number;
    name: string;
    slug: string;
  };
  quantity: number;
  unit_price: string;
}

interface CartState {
  items: CartItem[];
  _hasHydrated: boolean;
  isLoading: boolean;
  status: CartAction;
  successMessage: string | null;
  error: string | null;
  setHasHydrated: (state: boolean) => void;
  addItem: (product: LegacyProduct, quantity?: number) => Promise<void>;
  removeItem: (cartItemId: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotal: () => number;
  syncWithServer: () => Promise<void>;
  refreshCartPrices: () => Promise<void>;
  clearMessages: () => void;
  resetCartState: () => void;
}

const isApiEnvelope = <T>(value: T | ApiResponse<T>): value is ApiResponse<T> =>
  typeof value === 'object' && value !== null && 'status' in value;

const extractCartResponse = (
  response: CartResponse | ApiResponse<CartResponse>
): CartResponse | null => {
  if (isApiEnvelope<CartResponse>(response)) {
    return response.data ?? null;
  }
  return response;
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      _hasHydrated: false,
      isLoading: false,
      status: 'idle',
      successMessage: null,
      error: null,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
      clearMessages: () => set({ successMessage: null, error: null }),
      resetCartState: () =>
        set({
          items: [],
          isLoading: false,
          status: 'idle',
          successMessage: null,
          error: null,
        }),

      addItem: async (product, quantity = 1) => {
        const previousItems = get().items;
        const cartItemId = `${product.id}`;

        set({ isLoading: true, status: 'add', error: null, successMessage: null });
        set((state) => {
          const existingItem = state.items.find((item) => item.id === cartItemId);
          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.id === cartItemId ? { ...item, quantity: item.quantity + quantity } : item
              ),
            };
          }
          const newItem: CartItem = {
            id: cartItemId,
            product,
            quantity,
          };
          return { items: [...state.items, newItem] };
        });

        try {
          await cartService.addToCart({
            product_slug: product.slug,
            quantity,
          });
          await get().syncWithServer();
          set({
            isLoading: false,
            status: 'add',
            successMessage: 'Item added to cart successfully',
            error: null,
          });
        } catch {
          set({
            items: previousItems,
            isLoading: false,
            status: 'add',
            error: 'Failed to add item to cart',
            successMessage: null,
          });
        }
      },

      removeItem: async (cartItemId) => {
        const previousItems = get().items;
        const itemToDelete = previousItems.find((item) => item.id === cartItemId);
        if (!itemToDelete) return;

        set({ isLoading: true, status: 'remove', error: null, successMessage: null });
        set((state) => ({
          items: state.items.filter((item) => item.id !== cartItemId),
        }));
        try {
          await cartService.deleteCartItem({
            product_slug: itemToDelete.product.slug,
            quantity: itemToDelete.quantity,
          });
          await get().syncWithServer();
          set({
            isLoading: false,
            status: 'remove',
            successMessage: 'Item removed successfully',
            error: null,
          });
        } catch {
          set({
            items: previousItems,
            isLoading: false,
            status: 'remove',
            error: 'Failed to remove item from cart',
            successMessage: null,
          });
        }
      },

      updateQuantity: async (cartItemId, quantity) => {
        const previousItems = get().items;
        const itemToUpdate = previousItems.find((item) => item.id === cartItemId);
        if (!itemToUpdate) return;

        set({ isLoading: true, status: 'update', error: null, successMessage: null });
        set((state) => ({
          items: state.items
            .map((item) => (item.id === cartItemId ? { ...item, quantity } : item))
            .filter((item) => item.quantity > 0),
        }));

        try {
          await cartService.updateCartItem({
            product_slug: itemToUpdate.product.slug,
            quantity,
          });
          await get().syncWithServer();
          set({
            isLoading: false,
            status: 'update',
            successMessage: 'Cart updated successfully',
            error: null,
          });
        } catch {
          set({
            items: previousItems,
            isLoading: false,
            status: 'update',
            error: 'Failed to update cart',
            successMessage: null,
          });
        }
      },

      clearCart: async () => {
        const previousItems = get().items;
        set({ isLoading: true, status: 'clear', error: null, successMessage: null, items: [] });
        try {
          await cartService.clearCart();
          set({
            isLoading: false,
            status: 'clear',
            successMessage: 'Cart cleared successfully',
            error: null,
          });
        } catch {
          set({
            items: previousItems,
            isLoading: false,
            status: 'clear',
            error: 'Failed to clear cart',
            successMessage: null,
          });
        }
      },

      getTotal: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.price || 0;
          return total + price * item.quantity;
        }, 0);
      },

      syncWithServer: async () => {
        // No pre-flight auth check. The cart store holds guest state (constitution
        // Principle VI) and must not depend on session state, which lives in the
        // `useUser` query. A signed-out visitor simply gets a 401 back, and the
        // catch below leaves their local cart untouched.
        set({ isLoading: true, status: 'sync', error: null });
        try {
          const response = await cartService.getCart();
          const cartData = extractCartResponse(
            response as CartResponse | ApiResponse<CartResponse>
          );
          const serverItems = (cartData?.items || []) as unknown as ServerCartItem[];

          const hydratedItems: CartItem[] = await Promise.all(
            serverItems.map(async (item) => {
              const product = await legacyCatalogService.publicProductDetail(item.product.slug);
              return {
                id: `${product.id}`,
                product: {
                  ...product,
                  price: Number(item.unit_price) || product.price,
                },
                quantity: item.quantity,
                unit_price: item.unit_price,
              };
            })
          );

          set({
            items: hydratedItems,
            isLoading: false,
            status: 'sync',
            error: null,
          });
        } catch {
          set({
            isLoading: false,
            status: 'sync',
            error: 'Failed to sync cart with server',
          });
        }
      },

      refreshCartPrices: async () => {
        set({ isLoading: true, status: 'refresh', error: null, successMessage: null });
        const currentItems = get().items;
        if (currentItems.length === 0) {
          set({ isLoading: false, status: 'refresh' });
          return;
        }

        try {
          const updatedItems = await Promise.all(
            currentItems.map(async (item) => {
              try {
                const productData = await legacyCatalogService.publicProductDetail(item.product.slug);
                return {
                  ...item,
                  product: {
                    ...item.product,
                    price: productData.price ?? item.product.price,
                    currency: productData.currency ?? item.product.currency,
                  },
                };
              } catch (err) {
                console.error(`Failed to refresh price for ${item.product.name}`, err);
                return item;
              }
            })
          );

          set({
            items: updatedItems,
            isLoading: false,
            status: 'refresh',
            successMessage: 'Cart prices refreshed',
            error: null,
          });
        } catch (error) {
          console.error('Failed to refresh cart prices', error);
          set({
            isLoading: false,
            status: 'refresh',
            successMessage: null,
            error: 'Failed to refresh cart prices',
          });
        }
      },
    }),

    {
      name: 'axiora-cart-storage',
      onRehydrateStorage: (state) => {
        return () => state.setHasHydrated(true);
      },
    }
  )
);
