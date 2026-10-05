import { useLocale, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { PublicSpecification } from '@/types/catalog';

/**
 * Technical specification table (FR-006, FR-016).
 *
 * Rendered as a real `<table>`: it is tabular data with a header relationship
 * between each key and its value, and a screen reader announces that correctly
 * where a grid of `<div>`s does not.
 */
interface ProductSpecificationsProps {
  specifications: PublicSpecification[];
  className?: string;
}

export const ProductSpecifications = ({ specifications, className }: ProductSpecificationsProps) => {
  const t = useTranslations('product');
  const locale = useLocale();

  if (specifications.length === 0) return null;

  return (
    <section className={cn('space-y-3', className)} aria-labelledby="specifications-heading">
      <h2 id="specifications-heading" className="text-lg font-extrabold tracking-tight text-foreground">
        {t('specifications')}
      </h2>

      <table className="w-full border-collapse overflow-hidden rounded-xl border border-border text-sm">
        <tbody>
          {specifications.map((specification) => (
            <tr key={specification.id} className="even:bg-muted/30">
              <th
                scope="row"
                className="w-2/5 px-3 py-2.5 text-start align-top text-xs font-semibold text-muted-foreground">
                {locale === 'ar' ? specification.keyAr : specification.keyEn}
              </th>
              <td className="px-3 py-2.5 align-top text-xs font-medium text-foreground">
                {locale === 'ar' ? specification.valueAr : specification.valueEn}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
};