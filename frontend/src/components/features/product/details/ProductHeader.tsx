'use client';

import { useLocale, useTranslations } from 'next-intl';
import { ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui';
import { Link } from '@/i18n/navigation';
import type { PublicProductDetail } from '@/types/catalog';
import { localized } from '@/types/catalog';

/**
 * Product title block and breadcrumb trail (FR-006).
 *
 * The trail is rendered from the server-supplied `category.breadcrumbs`, which
 * walks the taxonomy on the server. Deriving it client-side would need the whole
 * ancestor chain shipped to the browser to draw one row of links.
 */
interface ProductHeaderProps {
  product: PublicProductDetail;
}

export const ProductHeader = ({ product }: ProductHeaderProps) => {
  const t = useTranslations('product');
  const tCatalog = useTranslations('catalog');
  const locale = useLocale();
  const brandName = localized(product.brand, locale);
  const productName = localized(product, locale);

  return (
    <header className="space-y-3">
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-hidden text-sm text-muted-foreground">
        <Link href="/" className="shrink-0 transition-colors hover:text-primary">
          {t('home')}
        </Link>
        {product.category.breadcrumbs.map((crumb) => (
          <span key={crumb.slug} className="flex min-w-0 items-center gap-1.5">
            <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 rtl:rotate-180" />
            <Link
              href={`/store?category=${crumb.slug}`}
              className="truncate transition-colors hover:text-primary">
              {localized(crumb, locale)}
            </Link>
          </span>
        ))}
        <ChevronRight aria-hidden="true" className="size-3.5 shrink-0 rtl:rotate-180" />
        <span className="truncate font-medium text-foreground" aria-current="page">
          {productName}
        </span>
      </nav>

      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold tracking-tight text-foreground md:text-3xl">{productName}</h1>
        {product.isNew && (
          <Badge className="bg-primary text-primary-foreground">{tCatalog('new')}</Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Badge className="border-none bg-primary/15 px-3 py-1 uppercase text-primary hover:bg-primary/20">
          {brandName}
        </Badge>
        <Badge variant="secondary" className="font-mono text-[11px]">
          {t('sku')}: {product.sku}
        </Badge>
      </div>
    </header>
  );
};