'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import StoreSidebarFilter, { type StoreFilterValue } from './StoreSidebarFilter';
import type { PublicBrand, PublicCategory } from '@/types/catalog';

/**
 * Mobile filter drawer (FR-002).
 *
 * Edits are held in a local draft and only committed on "Show results". Applying
 * on every toggle would fire a request per checkbox on a phone connection, and the
 * drawer would re-render mid-gesture.
 */
interface MobileStoreFilterProps {
  categories: PublicCategory[];
  brands: PublicBrand[];
  value: StoreFilterValue;
  onApply: (next: StoreFilterValue) => void;
  priceBounds: { min: number; max: number };
}

export default function MobileStoreFilter({
  categories,
  brands,
  value,
  onApply,
  priceBounds,
}: MobileStoreFilterProps) {
  const t = useTranslations('store');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<StoreFilterValue>(value);

  /**
   * Seed the draft on open, in the event handler rather than an effect.
   *
   * Opening is the moment the committed filters become the starting point, so this
   * is user-initiated state synchronisation rather than a prop-to-state mirror —
   * and it also means a cancelled edit never leaks into the next visit.
   */
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) setDraft(value);
    setOpen(nextOpen);
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button variant="outline" className="gap-2 lg:hidden">
          <Filter className="size-4" />
          {t('filters')}
        </Button>
      </SheetTrigger>

      <SheetContent
        showCloseButton={false}
        aria-describedby={undefined}
        side="start"
        className="flex w-[85vw] max-w-sm flex-col overflow-hidden border-border bg-card p-0 sm:max-w-sm">
        <SheetTitle className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-bold">{t('filters')}</span>
          <SheetClose asChild>
            <button
              type="button"
              className="cursor-pointer rounded-lg bg-muted/50 p-1.5 transition-colors hover:bg-muted"
              aria-label={t('clearSearch')}>
              <X className="size-4" />
            </button>
          </SheetClose>
        </SheetTitle>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <StoreSidebarFilter
            categories={categories}
            brands={brands}
            value={draft}
            onChange={setDraft}
            onClear={() => setDraft({ brands: [], inStock: false })}
            priceBounds={priceBounds}
            idPrefix="mobile"
          />
        </div>

        {/* Sticky actions: the apply button must stay reachable without scrolling
            back to the top of a long filter list. */}
        <div className="flex gap-2 border-t border-border bg-card px-5 py-4">
          <Button variant="outline" className="flex-1" onClick={() => setDraft({ brands: [], inStock: false })}>
            {t('clearFilters')}
          </Button>
          <Button
            className="flex-1"
            onClick={() => {
              onApply(draft);
              setOpen(false);
            }}>
            {t('applyFilters')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}