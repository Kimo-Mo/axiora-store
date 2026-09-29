'use client';

import { useInfiniteQuery } from '@tanstack/react-query';
import { catalogService } from '@/services/catalog.service';
import { Product } from '@/types';
import ProductCard from '@/components/features/product/ProductCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { ChevronRight, Loader2 } from 'lucide-react';

interface RelatedProductsProps {
  slug: string;
  isSidebar?: boolean;
}

export function RelatedProducts({ slug, isSidebar = false }: RelatedProductsProps) {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['related-products', slug],
    queryFn: ({ pageParam = 1 }) => catalogService.publicRelatedProducts(slug, pageParam as number),
    getNextPageParam: (lastPage) => lastPage.next ? lastPage.current_page + 1 : undefined,
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-[4/3] w-full rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  const products = data?.pages.flatMap(page => page.results) ?? [];

  if (products.length === 0) return null;

  return (
    <div className="space-y-4">
      {!isSidebar && (
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-foreground tracking-tight">You may also like</h2>
          <Link
            href="/store"
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            See all <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </Link>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        {products.map((product: Product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasNextPage && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
            className="group font-bold px-8 border-primary/20 hover:border-primary/50 text-primary"
          >
            {isFetchingNextPage ? (
              <Loader2 className="w-4 h-4 animate-spin me-2" />
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
