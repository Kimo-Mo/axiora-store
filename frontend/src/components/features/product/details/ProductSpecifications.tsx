import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface ProductSpecificationsProps {
  product: Product;
  className?: string;
}

export const ProductSpecifications = ({ product, className }: ProductSpecificationsProps) => {
  const hasSpecifics = product.attributes && product.attributes.length > 0;
  if (!hasSpecifics) return null;

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-lg font-extrabold text-foreground tracking-tight">Specifications</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {product.attributes?.map((attr) => (
          <div
            key={attr.id}
            className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card shadow-sm"
          >
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                {attr.name}
              </span>
              <span className="text-sm font-semibold">{attr.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
