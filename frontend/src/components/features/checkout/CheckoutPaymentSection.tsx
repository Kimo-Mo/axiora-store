'use client';

import { useTranslations } from 'next-intl';
import { Banknote, CreditCard } from 'lucide-react';
import { Label, RadioGroup, RadioGroupItem, Textarea } from '@/components/ui';
import type { StorePaymentMethod } from '@/types/payment';

interface CheckoutPaymentSectionProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  /** Methods the store currently offers — never hard-coded (FR-016). */
  methods: StorePaymentMethod[];
  selected: StorePaymentMethod;
  onSelect: (method: StorePaymentMethod) => void;
  isLoading?: boolean;
}

const METHOD_ICON = {
  COD: Banknote,
  ONLINE: CreditCard,
} as const;

const METHOD_ICON_TINT = {
  COD: 'text-emerald-600',
  ONLINE: 'text-primary',
} as const;

/**
 * Section 3 — payment method.
 *
 * The radio group renders from the server's enabled list so the storefront can
 * never offer a method the store has switched off, and never hide one it has
 * enabled (FR-001/FR-016). Labels come from the message namespace rather than the
 * method code, so Arabic and English stay in parity.
 */
export function CheckoutPaymentSection({
  notes,
  onNotesChange,
  methods,
  selected,
  onSelect,
  isLoading = false,
}: CheckoutPaymentSectionProps) {
  const t = useTranslations('checkout');

  return (
    <section className="space-y-4" aria-labelledby="checkout-section-payment">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          3
        </span>
        <h2 id="checkout-section-payment" className="text-lg font-semibold">
          {t('sections.payment')}
        </h2>
      </div>

      {isLoading ? (
        <div className="h-18.5 animate-pulse rounded-xl border border-border bg-muted/30" />
      ) : methods.length === 0 ? (
        <p className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {t('payment.noneAvailable')}
        </p>
      ) : (
        <RadioGroup
          value={selected}
          onValueChange={(value) => onSelect(value as StorePaymentMethod)}
          className="grid grid-cols-1 gap-3"
        >
          {methods.map((method) => {
            const Icon = METHOD_ICON[method];
            const isSelected = selected === method;
            return (
              <Label
                key={method}
                htmlFor={`checkout-payment-${method.toLowerCase()}`}
                className={
                  isSelected
                    ? 'flex items-center justify-between p-4 border border-primary bg-primary/5 ring-1 ring-primary rounded-xl cursor-pointer transition-all'
                    : 'flex items-center justify-between p-4 border border-border rounded-xl cursor-pointer transition-all hover:border-primary/40'
                }
              >
                <div className="flex items-center gap-4">
                  <RadioGroupItem
                    value={method}
                    id={`checkout-payment-${method.toLowerCase()}`}
                    className="h-5 w-5 ms-1"
                  />
                  <div className="flex items-center gap-3">
                    <Icon className={`h-6 w-6 ${METHOD_ICON_TINT[method]}`} />
                    <div>
                      <div className="font-semibold text-sm">{t(`payment.${method === 'COD' ? 'cod' : 'online'}`)}</div>
                      <div className="text-xs text-muted-foreground">
                        {t(`payment.${method === 'COD' ? 'codDescription' : 'onlineDescription'}`)}
                      </div>
                    </div>
                  </div>
                </div>
              </Label>
            );
          })}
        </RadioGroup>
      )}

      <div className="space-y-2">
        <Label htmlFor="checkout-delivery-notes">
          {t('confirmation.notes')}
          <span className="text-muted-foreground font-normal"> ({t('address.optional')})</span>
        </Label>
        <Textarea
          id="checkout-delivery-notes"
          rows={2}
          maxLength={500}
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
        />
      </div>
    </section>
  );
}