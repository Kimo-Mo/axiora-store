'use client';

import { Badge } from '@/components/ui';
import { Product } from '@/types';

interface ProductHeaderProps {
  product: Product;
}

export const ProductHeader = ({ product }: ProductHeaderProps) => {
  const categoryName = product.categories?.[0]?.name ?? '';

  return (
    <div className="space-y-3">
      <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground capitalize">
        {product.name}
      </h1>
      <div className="flex items-center gap-3 flex-wrap">
        {categoryName && (
          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-none px-3 py-1 uppercase">
            {categoryName}
          </Badge>
        )}
        {product.is_available === false && (
          <Badge variant="destructive" className="text-xs font-semibold px-3 py-1 uppercase">
            Out of Stock
          </Badge>
        )}
      </div>
    </div>
  );
};
