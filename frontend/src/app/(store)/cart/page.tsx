'use client';

import { useCartStore } from '@/lib/stores/useCartStore';
import CartItemRow from '@/components/features/cart/CartItemRow';
import CartSummary from '@/components/features/cart/CartSummary';
import { ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import Loading from '@/app/loading';

export default function CartPage() {
  const { items, clearCart, _hasHydrated } = useCartStore();
  const validItems = items.filter((item) => item?.product);

  if (!_hasHydrated) return <Loading />;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Shopping Cart</h1>
          <p className="text-muted-foreground">Manage your gaming keys and top up.</p>
        </div>
        {validItems.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCart} className="text-muted-foreground">
            Clear all
          </Button>
        )}
      </div>

      {validItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="flex flex-col">
              {validItems.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </div>
          <div className="lg:col-span-1">
            <CartSummary />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 space-y-4 text-center">
          <div className="bg-primary/10 p-6 rounded-full">
            <ShoppingCart className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Your cart is empty</h2>
            <p className="text-muted-foreground max-w-xs mx-auto">
              Looks like you haven&apos;t added anything to your cart yet. Browse our store for the
              best gaming deals!
            </p>
          </div>
          <Button asChild size="lg" className="mt-4">
            <Link href="/store">Browse Products</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
