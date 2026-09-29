'use client';

import ProductCard from './ProductCard';
import { Skeleton } from '@/components/ui';

import { cn } from '@/lib/utils';
import { Product } from '@/types';

interface ProductGridProps {
  products?: Product[];
  isLoading?: boolean;
  error?: unknown;
  limit?: number;
  className?: string;
}

export default function ProductGrid({
  products,
  isLoading,
  error,
  limit,
  className,
}: ProductGridProps) {
  if (isLoading) {
    return (
      <div
        className={cn(
          'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
          className
        )}>
        {[...Array(limit || 8)].map((_, i) => (
          <Skeleton key={i} className="w-full h-80 rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 text-destructive">
        Failed to load products. Please check if the API is running.
      </div>
    );
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6',
        className
      )}>
      {products?.map((product, index) => (
        <ProductCard key={index} product={product} priority={index <= 4} />
      ))}
      {!products?.length && (
        <div className="col-span-full text-center py-10 text-muted-foreground">
          No products found.
        </div>
      )}
    </div>
  );
}
