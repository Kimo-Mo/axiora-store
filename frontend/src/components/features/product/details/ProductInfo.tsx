'use client';

import { Product } from '@/types';
import { ProductSpecifications } from './ProductSpecifications';
import { ProductDescription } from './ProductDescription';
import { ProductSecondaryImages } from './ProductSecondaryImages';

interface ProductInfoProps {
  product: Product;
  hideDescription?: boolean;
}

export const ProductInfo = ({ product, hideDescription }: ProductInfoProps) => {
  return (
    <div className="space-y-6">
      {/* Help / Warning */}
      {product.help && (
        <div className="p-4 rounded-e-xl border border-s-4 border-yellow-500/30 border-l-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/20 text-yellow-900 dark:text-yellow-300 shadow-sm">
          <div className="flex gap-3 items-start">
            <div className="p-1.5 rounded-lg bg-yellow-500/20 text-yellow-600 dark:text-yellow-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h4 className="font-black mb-1 text-sm uppercase tracking-tight">Important Note</h4>
              <p className="text-sm font-medium leading-relaxed whitespace-pre-line opacity-90">{product.help}</p>
            </div>
          </div>
        </div>
      )}

      {/* Short Description */}
      {product.short_description && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {product.short_description}
            {product.description && (
              <button
                onClick={() => {
                  document.getElementById('product-full-description')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="ms-2 text-primary font-bold hover:underline"
              >
                More
              </button>
            )}
          </p>
        </div>
      )}

      {/* Info / Additional Notes */}
      {product.info && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-foreground">Additional Info</h3>
          <p className="text-muted-foreground leading-relaxed text-sm whitespace-pre-line">
            {product.info}
          </p>
        </div>
      )}

      {/* Tags */}
      {product.tags && product.tags.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-base font-bold text-foreground">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {product.tags.map((tag) => (
              <span
                key={tag.id}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-muted text-muted-foreground border border-border uppercase">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Full Description */}
      {!hideDescription && product.description && (
        <ProductDescription description={product.description} />
      )}
    </div>
  );
};

