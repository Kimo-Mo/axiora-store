'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Full product description and warranty callout (FR-006).
 *
 * Rendered as plain text, not HTML. The description is administrator-authored free
 * text from the database, and injecting it through `dangerouslySetInnerHTML` would
 * turn the description field into a stored-XSS sink for any admin account.
 */
interface ProductDescriptionProps {
  description: string | null;
  warranty?: string | null;
  className?: string;
}

export const ProductDescription = ({ description, warranty, className }: ProductDescriptionProps) => {
  const t = useTranslations('product');
  const [expanded, setExpanded] = useState(false);

  if (!description && !warranty) return null;

  // Long descriptions are clamped behind a "show more" affordance; short ones are
  // shown whole so the control never appears when it would do nothing.
  const isLong = (description?.length ?? 0) > 420;

  return (
    <div className={cn('space-y-5', className)}>
      {description && (
        <section className="space-y-2" aria-labelledby="description-heading">
          <h2 id="description-heading" className="text-base font-bold text-foreground">
            {t('aboutThisProduct')}
          </h2>

          <div className="relative">
            <p
              className={cn(
                'text-sm leading-relaxed text-muted-foreground transition-all',
                isLong && !expanded && 'max-h-56 overflow-hidden',
              )}>
              {description}
            </p>

            {isLong && !expanded && (
              <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-background to-transparent" />
            )}
          </div>

          {isLong && (
            <button
              type="button"
              onClick={() => setExpanded((current) => !current)}
              aria-expanded={expanded}
              className="inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-primary transition-colors hover:text-primary/80">
              {expanded ? t('showLess') : t('showMore')}
              {expanded ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
            </button>
          )}
        </section>
      )}

      {warranty && (
        <aside className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
          <ShieldCheck aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-primary" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-foreground">{t('warrantyInfo')}</h3>
            <p className="text-sm text-muted-foreground">{warranty}</p>
          </div>
        </aside>
      )}
    </div>
  );
};